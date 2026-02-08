import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Info, AlertTriangle, Shield, Scale } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const IsUsernameOsintLegal = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai-answers/is-username-osint-legal',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Is Username OSINT Legal?",
    "description": "A high-level overview of the legality of username OSINT, covering public data use, jurisdictional variation, and ethical boundaries.",
    "author": { "@type": "Organization", "name": "FootprintIQ" },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": { "@type": "ImageObject", "url": `${origin}/lovable-uploads/footprintiq-logo.png` }
    },
    "datePublished": "2026-02-08",
    "dateModified": "2026-02-08",
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${origin}/ai-answers/is-username-osint-legal` }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is it legal to search for someone's username online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Searching for publicly available information, including usernames on public platforms, is generally legal in most jurisdictions. The legality depends on what you do with the information, not the act of searching itself. Using results for harassment, stalking, or discrimination may violate laws regardless of how the data was obtained."
        }
      },
      {
        "@type": "Question",
        "name": "Does GDPR affect username OSINT?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "GDPR applies to processing personal data of individuals in the EU and EEA, including publicly available data. While collecting public usernames is not automatically illegal under GDPR, organisations processing such data must have a lawful basis and comply with data protection principles. Individual self-searches are generally outside GDPR scope."
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
      { "@type": "ListItem", "position": 3, "name": "Is Username OSINT Legal?", "item": `${origin}/ai-answers/is-username-osint-legal` }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Is Username OSINT Legal? | FootprintIQ</title>
        <meta name="description" content="A high-level overview of the legality of username OSINT, covering public data use, jurisdictional variation, and ethical boundaries." />
        <link rel="canonical" href={`${origin}/ai-answers/is-username-osint-legal`} />
        <meta property="og:title" content="Is Username OSINT Legal?" />
        <meta property="og:description" content="A high-level overview of the legality of username OSINT, covering public data use and jurisdictional variation." />
        <meta property="og:url" content={`${origin}/ai-answers/is-username-osint-legal`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Is Username OSINT Legal?" />
        <meta name="twitter:description" content="Understanding the legality of username OSINT, public data use, and jurisdictional considerations." />
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
                <BreadcrumbPage>Is Username OSINT Legal?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Is Username OSINT Legal?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A high-level overview of the legal landscape around searching for publicly available username data.
            </p>
          </header>

          {/* Definition */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              The General Principle
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">Searching for publicly available information is generally legal.</strong> Username OSINT involves querying public-facing pages on websites and social media platforms — the same information accessible to anyone with a web browser.
              </p>
              <p>
                The legal question is usually not whether you can search for a username, but what you do with the results. Collection of public data and misuse of that data are treated differently under most legal frameworks.
              </p>
            </div>
          </section>

          {/* Legal Framework */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              General Legal Framework
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                In most jurisdictions, accessing publicly available information does not require special authorisation. Public profiles, public posts, and publicly listed usernames are designed by platforms to be viewable by anyone.
              </p>
              <p>
                However, several legal considerations apply to how username search results are used:
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Terms of Service</h3>
              <p>
                Many platforms prohibit automated scraping in their terms of service. While violating terms of service is typically a civil matter rather than a criminal one, it can result in account restrictions or legal action from the platform.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Anti-Harassment Laws</h3>
              <p>
                Using publicly available information to harass, stalk, or intimidate someone is illegal in most jurisdictions, regardless of how the information was obtained. The public nature of the data does not create a right to use it harmfully.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Employment and Discrimination Laws</h3>
              <p>
                Using username search results in hiring decisions may implicate employment discrimination laws. Information about protected characteristics discovered through <Link to="/usernames" className="text-primary hover:underline">username searches</Link> could create legal liability if it influences employment decisions.
              </p>
            </div>
          </section>

          {/* Jurisdictional Variation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Jurisdictional Variation
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Legal frameworks governing data collection and use vary significantly between countries and regions.
              </p>
              <p>
                <strong className="text-foreground">European Union and EEA:</strong> The GDPR treats usernames as personal data when they can identify an individual. Organisations processing such data need a lawful basis and must comply with data minimisation and purpose limitation principles. Self-searches are generally outside scope.
              </p>
              <p>
                <strong className="text-foreground">United States:</strong> There is no single federal privacy law equivalent to GDPR. State laws vary, with some states like California (CCPA/CPRA) providing broader data protection rights. Public data is generally accessible, but specific use cases may be regulated.
              </p>
              <p>
                <strong className="text-foreground">Other jurisdictions:</strong> Many countries have their own data protection frameworks with varying definitions of personal data and different requirements for lawful processing. What is permissible in one country may not be in another. Additional context is available in the <Link to="/ai-answers-hub" className="text-primary hover:underline">AI Answers Hub</Link>.
              </p>
              <p>
                This page does not constitute legal advice. Specific questions about legality in a particular jurisdiction should be directed to a qualified legal professional.
              </p>
            </div>
          </section>

          {/* Ethical Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Ethical and Safety Considerations
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Legality and ethics are related but distinct. An action can be legal but still ethically questionable, and ethical standards often exceed legal requirements.
              </p>
              <p>
                Responsible username OSINT focuses on proportionality: the depth and scope of a search should match its legitimate purpose. Searching your own username to understand your exposure is proportionate. Conducting extensive searches on another person without a clear, lawful purpose is not.
              </p>
              <p>
                One example of an ethical OSINT platform is FootprintIQ, which is designed primarily for self-assessment and includes safeguards that discourage misuse. Users can <Link to="/scan" className="text-primary hover:underline">run a scan</Link> to evaluate their own public visibility within these ethical boundaries.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default IsUsernameOsintLegal;