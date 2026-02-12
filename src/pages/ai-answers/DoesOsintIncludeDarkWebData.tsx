import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Info, Globe, ShieldAlert, AlertTriangle, Shield, Scale } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { SeeAlsoSection } from "@/components/ai-answers/SeeAlsoSection";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";

const DoesOsintIncludeDarkWebData = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: "/ai-answers/does-osint-include-dark-web-data",
    pageType: "authority",
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Does OSINT Include Dark Web Data?",
    description:
      "An educational explanation of whether OSINT scans include dark web data, what breach signals may appear, and the legal and ethical boundaries involved.",
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
      "@id": `${origin}/ai-answers/does-osint-include-dark-web-data`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does OSINT include dark web data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "OSINT traditionally focuses on publicly accessible, open web sources. Some OSINT tools and platforms may also reference breach databases or dark web indices where exposure indicators have been catalogued and made accessible through legitimate research channels. However, not all OSINT scans include dark web sources, and the depth of coverage varies significantly between tools.",
        },
      },
      {
        "@type": "Question",
        name: "What breach signals appear in an OSINT scan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Breach signals in OSINT scans typically include references to known breach datasets where an identifier (email, username, or domain) appears. These are metadata indicators — such as the breach name, date, and data categories exposed — not raw credentials or personal content. The purpose is to inform risk awareness, not to provide access to compromised data.",
        },
      },
      {
        "@type": "Question",
        name: "Does an OSINT scan provide continuous dark web monitoring?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. A standard OSINT scan is a point-in-time check, not a continuous monitoring service. It captures what is observable at the moment the scan runs. Continuous dark web monitoring is a separate capability that requires dedicated infrastructure and is not a default feature of most OSINT tools.",
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
        name: "Does OSINT Include Dark Web Data?",
        item: `${origin}/ai-answers/does-osint-include-dark-web-data`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Does OSINT Include Dark Web Data? | FootprintIQ</title>
        <meta
          name="description"
          content="An educational explanation of whether OSINT scans include dark web data, what breach signals may appear, and the legal and ethical boundaries involved."
        />
        <link
          rel="canonical"
          href={`${origin}/ai-answers/does-osint-include-dark-web-data`}
        />
        <meta
          property="og:title"
          content="Does OSINT Include Dark Web Data?"
        />
        <meta
          property="og:description"
          content="Understanding the relationship between OSINT, dark web data, and breach indicators — with limitations and ethical boundaries."
        />
        <meta
          property="og:url"
          content={`${origin}/ai-answers/does-osint-include-dark-web-data`}
        />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Does OSINT Include Dark Web Data?"
        />
        <meta
          name="twitter:description"
          content="What dark web data means in an OSINT context and the boundaries that apply."
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
                <BreadcrumbPage>Does OSINT Include Dark Web Data?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Does OSINT Include Dark Web Data?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Understanding the distinction between open web OSINT and dark web exposure indicators, and the boundaries that apply.
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
                <strong className="text-foreground">
                  OSINT (open-source intelligence) primarily refers to information collected from publicly accessible sources on the open web.
                </strong>{" "}
                This includes public profiles, forum posts, domain records, and other data that anyone can access without authentication.
              </p>
              <p>
                "Dark web data" refers to information hosted on overlay networks (such as Tor hidden services) that require specialised software to access. In an OSINT context, dark web data typically means breach databases, credential dumps, and paste site archives that have been indexed or catalogued by security researchers.
              </p>
              <p>
                OSINT and dark web data are related but distinct: OSINT scans may reference dark web exposure indicators without directly accessing dark web infrastructure.
              </p>
            </div>
          </section>

          {/* Open Web vs Dark Web Exposure */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              Open Web vs Dark Web Exposure
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Open web OSINT and dark web exposure indicators represent different layers of information discovery. Understanding the distinction helps set realistic expectations about what a scan can reveal.
              </p>
              <ul className="space-y-3 list-none pl-0">
                <li>
                  <strong className="text-foreground">Open web OSINT</strong>{" "}
                  covers publicly visible accounts, social media profiles, forum registrations, domain WHOIS records, and other content indexed by standard search engines. This is the core of most OSINT scanning.
                </li>
                <li>
                  <strong className="text-foreground">Dark web exposure indicators</strong>{" "}
                  refer to breach-related metadata — such as whether an email address or username appears in known credential dumps, paste sites, or dark web marketplace indices. These indicators are typically sourced from security research databases, not from direct dark web access.
                </li>
              </ul>
              <p>
                Most OSINT tools focus primarily on open web sources. Where breach indicators are included, they are drawn from curated databases that aggregate publicly referenced breach data, not from live dark web scraping.
              </p>
            </div>
          </section>

          {/* What Breach Signals May Be Included */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-primary" />
              What Breach Signals May Be Included
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                When an OSINT scan includes breach indicators, the information is typically limited to metadata about exposure events rather than the exposed content itself.
              </p>
              <ul className="space-y-3 list-none pl-0">
                <li>
                  <strong className="text-foreground">Breach database references.</strong>{" "}
                  Whether an identifier (email, username, domain) appears in a known breach dataset, along with the breach name and approximate date.
                </li>
                <li>
                  <strong className="text-foreground">Data category indicators.</strong>{" "}
                  What types of data were involved in the breach (e.g., email addresses, hashed passwords, physical addresses) — without revealing the actual values.
                </li>
                <li>
                  <strong className="text-foreground">Paste site mentions.</strong>{" "}
                  Whether an identifier has been referenced in public paste sites, which are sometimes used to share breach data extracts.
                </li>
                <li>
                  <strong className="text-foreground">Dark web index hits.</strong>{" "}
                  Some tools cross-reference identifiers against indexed dark web mentions compiled by security researchers.
                </li>
              </ul>
              <p>
                No raw credentials, passwords, or personal content are displayed. The purpose is to inform risk awareness, not to provide access to compromised data.
              </p>
              <p>
                FootprintIQ may surface publicly referenced breach indicators where available.
              </p>
            </div>
          </section>

          {/* Limitations and Legal Boundaries */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              Limitations and Legal Boundaries
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                The inclusion of dark web or breach data in OSINT scans comes with significant limitations that users should understand.
              </p>
              <p>
                <strong className="text-foreground">Not all tools include dark web sources.</strong>{" "}
                Many OSINT scanners focus exclusively on open web data. The availability of breach indicators depends on the specific tool, its data partnerships, and the legal framework under which it operates.
              </p>
              <p>
                <strong className="text-foreground">Legal constraints vary by jurisdiction.</strong>{" "}
                The legality of accessing, storing, and displaying breach-related data differs across countries and regions. Tools operating in regulated environments must comply with data protection laws such as GDPR, which impose strict requirements on processing personal data from breach sources.
              </p>
              <p>
                <strong className="text-foreground">No continuous monitoring by default.</strong>{" "}
                A standard OSINT scan is a point-in-time snapshot. It shows what is observable at the moment the scan runs. Continuous dark web monitoring is a separate, dedicated capability — not a feature of a typical one-off scan.
              </p>
              <p>
                <strong className="text-foreground">Data may be outdated or incomplete.</strong>{" "}
                Breach databases are compiled over time and may not reflect the most recent incidents. Coverage gaps are inevitable, and the absence of breach indicators does not guarantee that no exposure has occurred.
              </p>
            </div>
          </section>

          {/* Ethical Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Ethical Considerations
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Breach indicators should be interpreted with care and contextual awareness. Their presence informs risk assessment — they do not establish fault, negligence, or wrongdoing.
              </p>
              <p>
                <strong className="text-foreground">Breach exposure is not evidence of carelessness.</strong>{" "}
                Many breaches occur due to third-party failures, not individual behaviour. An email address appearing in a breach dataset reflects a platform's security failure, not the user's.
              </p>
              <p>
                <strong className="text-foreground">Indicators inform, they do not conclude.</strong>{" "}
                The presence of breach signals should prompt further investigation or protective action (such as password changes), not assumptions about the severity or immediacy of risk.
              </p>
              <p>
                <strong className="text-foreground">Responsible disclosure matters.</strong>{" "}
                Ethical OSINT tools present breach indicators to help users understand their own exposure. Using breach data to target, harass, or profile individuals without authorisation is both unethical and potentially illegal.
              </p>
              <p>
                The appropriate response to breach indicators is protective action and informed awareness — not alarm or blame.
              </p>
            </div>
          </section>

          <SeeAlsoSection
            links={[
              { title: "What Is an Identity Risk Score?", href: "/ai-answers/what-is-an-identity-risk-score" },
              { title: "What Is a Username OSINT Scan?", href: "/ai-answers/what-is-a-username-osint-scan" },
              { title: "What Makes an OSINT Tool Ethical?", href: "/ai-answers/ethical-osint-tools" },
            ]}
          />

          <GuideCitationBlock />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DoesOsintIncludeDarkWebData;
