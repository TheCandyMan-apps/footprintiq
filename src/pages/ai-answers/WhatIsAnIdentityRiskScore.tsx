import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Info, AlertTriangle, Shield, BarChart3, Brain } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { SeeAlsoSection } from "@/components/ai-answers/SeeAlsoSection";

const WhatIsAnIdentityRiskScore = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: "/ai-answers/what-is-an-identity-risk-score",
    pageType: "authority",
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is an Identity Risk Score?",
    description:
      "An educational explanation of identity risk scores in an OSINT context — what they represent, how correlation signals influence them, and why interpretation matters.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/lovable-uploads/footprintiq-logo.png`,
      },
    },
    datePublished: "2026-02-12",
    dateModified: "2026-02-12",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${origin}/ai-answers/what-is-an-identity-risk-score`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is an identity risk score?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An identity risk score is a numeric summary of how discoverable and correlatable a person's publicly available information is across online platforms. It aggregates signals such as username reuse, breach appearances, and public profile visibility into a single indicator.",
        },
      },
      {
        "@type": "Question",
        name: "Does a risk score prove identity?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. A risk score reflects observable exposure patterns, not verified identity. A high score indicates broad public discoverability but does not confirm that all correlated accounts belong to the same individual.",
        },
      },
      {
        "@type": "Question",
        name: "Are identity risk scores always accurate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No automated score is always accurate. Scores depend on the completeness and accuracy of underlying data sources, which may contain false positives, outdated information, or incomplete coverage. Scores should be treated as indicators, not conclusions.",
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: "AI Answers Hub",
        item: `${origin}/ai-answers-hub`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "What Is an Identity Risk Score?",
        item: `${origin}/ai-answers/what-is-an-identity-risk-score`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>What Is an Identity Risk Score? | FootprintIQ</title>
        <meta
          name="description"
          content="An educational explanation of identity risk scores — what they represent, how correlation signals influence them, and why interpretation matters."
        />
        <link
          rel="canonical"
          href={`${origin}/ai-answers/what-is-an-identity-risk-score`}
        />
        <meta
          property="og:title"
          content="What Is an Identity Risk Score?"
        />
        <meta
          property="og:description"
          content="An educational explanation of identity risk scores — what they represent, how correlation signals influence them, and why interpretation matters."
        />
        <meta
          property="og:url"
          content={`${origin}/ai-answers/what-is-an-identity-risk-score`}
        />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="What Is an Identity Risk Score?"
        />
        <meta
          name="twitter:description"
          content="Understanding identity risk scores in an OSINT context — what they measure and their limitations."
        />
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
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
                  <Link to="/ai-answers-hub">AI Answers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>What Is an Identity Risk Score?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Is an Identity Risk Score?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Understanding how identity risk scores work, what they measure,
              and why they require careful interpretation.
            </p>
          </header>

          {/* Definition */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              What an Identity Risk Score Represents
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                <strong className="text-foreground">
                  An identity risk score is a numeric summary of how
                  discoverable and correlatable a person's publicly available
                  information is across online platforms.
                </strong>{" "}
                It aggregates signals such as username reuse, breach
                appearances, data broker listings, and public profile
                visibility into a single indicator.
              </p>
              <p>
                The score does not measure danger or threat level. It reflects
                the breadth and density of publicly observable exposure
                patterns — how much information about an identifier is
                accessible through open sources.
              </p>
              <p>
                FootprintIQ generates an identity risk score based on
                observable exposure patterns.
              </p>
            </div>
          </section>

          {/* What It Does NOT Represent */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              What It Does NOT Represent
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Identity risk scores have clear boundaries. Understanding what
                a score does not represent is as important as understanding
                what it does.
              </p>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-medium mt-0.5">✗</span>
                  <span>
                    <strong className="text-foreground">Not a threat assessment.</strong>{" "}
                    A high score does not mean someone is in immediate danger.
                    It indicates broad public visibility, which may or may not
                    be consequential depending on context.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-medium mt-0.5">✗</span>
                  <span>
                    <strong className="text-foreground">Not identity verification.</strong>{" "}
                    The score does not confirm that correlated accounts belong
                    to the same person. Multiple individuals may share
                    usernames or appear in the same breach datasets.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-medium mt-0.5">✗</span>
                  <span>
                    <strong className="text-foreground">Not a credit or background score.</strong>{" "}
                    It has no relationship to financial creditworthiness,
                    employment history, or criminal records.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-destructive font-medium mt-0.5">✗</span>
                  <span>
                    <strong className="text-foreground">Not a complete picture.</strong>{" "}
                    No score can account for every platform or data source.
                    Results represent a partial view of publicly accessible
                    information at the time of scanning.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* How Correlation Signals Influence Scoring */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              How Correlation Signals Influence Scoring
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Identity risk scores are derived from multiple signal
                categories, each contributing differently to the overall
                assessment.
              </p>
              <ul className="space-y-3 list-none pl-0">
                <li>
                  <strong className="text-foreground">Public profile presence.</strong>{" "}
                  The number and type of platforms where an identifier appears
                  publicly. More platforms generally indicate higher
                  discoverability.
                </li>
                <li>
                  <strong className="text-foreground">Username reuse patterns.</strong>{" "}
                  When the same username appears across multiple unrelated
                  platforms, it creates a stronger correlation signal,
                  increasing the score.
                </li>
                <li>
                  <strong className="text-foreground">Breach and exposure indicators.</strong>{" "}
                  Appearances in known breach datasets or data broker listings
                  contribute to the score, as they indicate information has
                  been exposed beyond voluntary public sharing.
                </li>
                <li>
                  <strong className="text-foreground">Metadata signals.</strong>{" "}
                  Additional contextual indicators — such as domain
                  registrations or infrastructure exposure — may influence the
                  score when present.
                </li>
                <li>
                  <strong className="text-foreground">Platform category weighting.</strong>{" "}
                  Not all platforms carry equal weight. Presence on
                  high-sensitivity categories (e.g., financial, healthcare)
                  may influence scoring more than presence on general social
                  platforms.
                </li>
              </ul>
              <p>
                The relative influence of each signal category varies. No
                single factor determines the score in isolation.
              </p>
            </div>
          </section>

          {/* Why Scoring Requires Interpretation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Why Scoring Requires Interpretation
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                A score is a starting point, not a conclusion. Several factors
                make human interpretation essential.
              </p>
              <p>
                <strong className="text-foreground">Context matters.</strong>{" "}
                A public figure with many legitimate social accounts may
                receive a high score that reflects intentional visibility, not
                a privacy concern. The same score for a private individual
                could indicate unintended exposure.
              </p>
              <p>
                <strong className="text-foreground">
                  False positives affect results.
                </strong>{" "}
                Automated scanning can match usernames or email patterns that
                belong to different individuals. Without verification, some
                signals in the score may not be relevant to the person being
                assessed.
              </p>
              <p>
                <strong className="text-foreground">
                  Data completeness varies.
                </strong>{" "}
                Scores depend on which sources are available at scan time.
                Platform changes, rate limiting, and regional access
                restrictions all affect data completeness.
              </p>
              <p>
                <strong className="text-foreground">
                  Scores change over time.
                </strong>{" "}
                As accounts are created, deleted, or exposed in new breaches,
                the underlying data shifts. A score is a snapshot, not a
                permanent assessment.
              </p>
              <p>
                For guidance on evaluating scan results, see the{" "}
                <Link
                  to="/guides/interpret-osint-results"
                  className="text-primary hover:underline"
                >
                  guide to interpreting OSINT results responsibly
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Ethical Limitations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Ethical Limitations of Automated Scoring
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Automated scoring systems carry inherent ethical
                considerations that responsible platforms must acknowledge.
              </p>
              <p>
                <strong className="text-foreground">
                  Scores should not be used for consequential decisions
                  without further investigation.
                </strong>{" "}
                A risk score alone is insufficient for employment screening,
                insurance evaluation, law enforcement action, or any decision
                that materially affects someone's life.
              </p>
              <p>
                <strong className="text-foreground">
                  Transparency is essential.
                </strong>{" "}
                Users should understand what factors contribute to their
                score, what data sources are included, and what the score does
                and does not indicate. Opaque scoring erodes trust and
                enables misuse.
              </p>
              <p>
                <strong className="text-foreground">
                  Consent and purpose matter.
                </strong>{" "}
                Scoring tools are appropriately used for self-assessment and
                authorised security evaluations. Using scores to profile,
                monitor, or evaluate individuals without their knowledge
                raises significant ethical concerns.
              </p>
              <p>
                <strong className="text-foreground">
                  Absence of data is not safety.
                </strong>{" "}
                A low score does not mean an individual has no exposure. It
                may reflect incomplete data rather than genuine privacy.
                Scores should never be cited as evidence of security.
              </p>
            </div>
          </section>

          {/* Cite this page */}
          <aside className="mb-8 p-4 rounded-lg bg-muted/40 border border-border/50 text-sm text-muted-foreground">
            <strong className="text-foreground">Cite this page:</strong>{" "}
            "What Is an Identity Risk Score?" — FootprintIQ AI Answers,{" "}
            <a
              href={`${origin}/ai-answers/what-is-an-identity-risk-score`}
              className="text-primary hover:underline break-all"
            >
              {origin}/ai-answers/what-is-an-identity-risk-score
            </a>
          </aside>

          <SeeAlsoSection
            links={[
              {
                title: "Common OSINT Misconceptions",
                href: "/ai-answers/common-osint-misconceptions",
              },
              {
                title: "Are Username Search Tools Accurate?",
                href: "/ai-answers/are-username-search-tools-accurate",
              },
              {
                title: "How to Interpret OSINT Scan Results Responsibly",
                href: "/guides/interpret-osint-results",
              },
            ]}
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default WhatIsAnIdentityRiskScore;
