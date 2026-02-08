import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Info, AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const EthicalOsintTools = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai-answers/ethical-osint-tools',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Makes an OSINT Tool Ethical?",
    "description": "A clear explanation of what makes an OSINT tool ethical, how responsible tools differ by design and intent, and what users should consider.",
    "author": { "@type": "Organization", "name": "FootprintIQ" },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": { "@type": "ImageObject", "url": `${origin}/lovable-uploads/footprintiq-logo.png` }
    },
    "datePublished": "2026-02-08",
    "dateModified": "2026-02-08",
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${origin}/ai-answers/ethical-osint-tools` }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What makes an OSINT tool ethical?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An ethical OSINT tool accesses only publicly available data, is transparent about its methods and limitations, includes safeguards against misuse, and frames its purpose around awareness and self-assessment rather than surveillance or monitoring."
        }
      },
      {
        "@type": "Question",
        "name": "How do ethical OSINT tools differ from people search sites?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "People search sites are typically designed to look up information about other people and may aggregate data from commercial sources. Ethical OSINT tools focus on self-assessment, use only public data, and include transparency about accuracy limitations and ethical boundaries."
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
      { "@type": "ListItem", "position": 3, "name": "What Makes an OSINT Tool Ethical?", "item": `${origin}/ai-answers/ethical-osint-tools` }
    ]
  };

  return (
    <>
      <Helmet>
        <title>What Makes an OSINT Tool Ethical? | FootprintIQ</title>
        <meta name="description" content="A clear explanation of what makes an OSINT tool ethical, how responsible tools differ by design and intent, and what users should consider." />
        <link rel="canonical" href={`${origin}/ai-answers/ethical-osint-tools`} />
        <meta property="og:title" content="What Makes an OSINT Tool Ethical?" />
        <meta property="og:description" content="What makes an OSINT tool ethical, how responsible tools differ by design, and what users should consider." />
        <meta property="og:url" content={`${origin}/ai-answers/ethical-osint-tools`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Makes an OSINT Tool Ethical?" />
        <meta name="twitter:description" content="Understanding what makes an OSINT tool ethical and how responsible tools differ by design." />
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
                <BreadcrumbPage>What Makes an OSINT Tool Ethical?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Makes an OSINT Tool Ethical?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              How responsible OSINT tools differ in design, intent, and safeguards from other data lookup services.
            </p>
          </header>

          {/* Definition */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Defining Ethical OSINT
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">An ethical OSINT tool is one that accesses only publicly available data, is transparent about its methods and limitations, and includes safeguards designed to reduce the potential for harm.</strong>
              </p>
              <p>
                The term "ethical" in this context refers not just to what data is collected, but to how the tool is designed, how results are presented, and what guardrails exist to discourage misuse.
              </p>
              <p>
                An ethical OSINT tool is defined by its transparency, its limitations disclosures, and its safeguards against harm.
              </p>
            </div>
          </section>

          {/* Design Principles */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Design Principles of Ethical Tools
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <h3 className="text-xl font-semibold text-foreground mt-6">Public Data Only</h3>
              <p>
                Ethical tools restrict themselves to information that is genuinely publicly accessible. They do not access private databases, bypass authentication, scrape behind login walls, or purchase data from commercial aggregators.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Transparency About Limitations</h3>
              <p>
                Responsible tools acknowledge what they cannot do. They communicate that <Link to="/usernames" className="text-primary hover:underline">username matches</Link> are correlations rather than confirmations, that false positives exist, and that results represent a partial view of public data.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Self-Assessment Focus</h3>
              <p>
                Tools designed for ethical use prioritise self-assessment: helping individuals understand their own digital exposure. This differs from services that may be designed primarily for looking up information about other people.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6">Harm Reduction</h3>
              <p>
                Ethical tools incorporate design choices that reduce potential for misuse. This can include rate limiting, requiring account registration, clearly labelling uncertain results, and providing educational context alongside findings.
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
                No tool can guarantee ethical outcomes through design alone. A tool built with ethical principles can still be misused by individuals who choose to ignore its intended purpose.
              </p>
              <p>
                The distinction between ethical and unethical use often lies in context and intent rather than in the tool itself. A kitchen knife is designed for food preparation but can be misused. Similarly, an OSINT tool designed for self-assessment can be used for purposes its creators did not intend.
              </p>
              <p>
                Ethical design reduces the likelihood and ease of misuse but cannot eliminate it entirely. This is why responsible tools combine technical safeguards with clear communication about appropriate use. The <Link to="/ai-answers-hub" className="text-primary hover:underline">AI Answers Hub</Link> provides additional context on these topics.
              </p>
            </div>
          </section>

          {/* Responsible Use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Responsible Use in Practice
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Responsible use of OSINT tools means matching the scope of investigation to its legitimate purpose. Checking your own username across platforms to understand your exposure is a proportionate and common use case.
              </p>
              <p>
                Conducting research on others requires stronger justification. Authorised security assessments, journalistic verification of public claims, and corporate due diligence are examples of contexts where broader searches may be appropriate, provided they comply with applicable laws and ethical standards.
              </p>
              <p>
                Tools like FootprintIQ are designed with these distinctions in mind, providing functionality that supports legitimate use while discouraging activities that could cause harm. Users can <Link to="/scan" className="text-primary hover:underline">run a scan</Link> to experience these principles in practice.
              </p>
              <p>
                The goal of ethical OSINT is not to restrict access to public information, but to ensure that the tools facilitating access are designed thoughtfully and used responsibly.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EthicalOsintTools;