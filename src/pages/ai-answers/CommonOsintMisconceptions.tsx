import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldAlert, BarChart3, Globe, Link2, ShieldOff } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const CommonOsintMisconceptions = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai-answers/common-osint-misconceptions',
    pageType: 'authority',
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Common OSINT Misconceptions",
    "description": "A corrective guide addressing the most common misunderstandings about OSINT scan results, including what they do and do not prove.",
    "author": { "@type": "Organization", "name": "FootprintIQ" },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": { "@type": "ImageObject", "url": `${origin}/lovable-uploads/footprintiq-logo.png` }
    },
    "datePublished": "2026-02-10",
    "dateModified": "2026-02-10",
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${origin}/ai-answers/common-osint-misconceptions` }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do OSINT results prove someone's identity?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. OSINT results show correlations between publicly available data points. A matching username or email across platforms indicates a possible link, not a confirmed identity. Verification requires additional context and human judgement."
        }
      },
      {
        "@type": "Question",
        "name": "Does more OSINT results mean more risk?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not necessarily. A large number of results often reflects common usernames or broad platform coverage. Risk depends on the sensitivity and context of findings, not their volume."
        }
      },
      {
        "@type": "Question",
        "name": "Does no OSINT result mean someone is safe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Absence of results may mean data was not indexed, the tools did not cover certain platforms, or the person uses different identifiers. A clean scan is not a guarantee of zero exposure."
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
      { "@type": "ListItem", "position": 3, "name": "Common OSINT Misconceptions", "item": `${origin}/ai-answers/common-osint-misconceptions` }
    ]
  };

  const sections = [
    {
      icon: ShieldAlert,
      title: "OSINT results are not identity proof",
      content: [
        "A username appearing on multiple platforms does not confirm that those accounts belong to the same person. OSINT tools identify correlations — patterns in publicly available data — not verified identities.",
        "Common usernames are shared independently by thousands of people. A match is a starting point for further analysis, not a conclusion. Responsible interpretation always separates correlation from attribution.",
        "Platforms that allow anonymous registration make this distinction especially important. The same handle on two services may belong to entirely different individuals with no connection."
      ]
    },
    {
      icon: BarChart3,
      title: "More results does not mean more risk",
      content: [
        "It is common to assume that a scan returning many results indicates high exposure. In practice, volume often reflects broad tool coverage or common identifiers rather than meaningful risk.",
        "A scan returning 200 low-confidence matches across generic platforms provides less actionable intelligence than five high-confidence findings on sensitive services. Quality of correlation matters more than quantity.",
        "Evaluating risk requires context: what platforms were matched, how specific the identifier is, and whether any findings include secondary confirming signals like profile metadata or linked accounts."
      ]
    },
    {
      icon: Globe,
      title: "Public does not mean harmless",
      content: [
        "Information being publicly accessible does not make it benign. Aggregation of individually unremarkable data points can reveal patterns that are more sensitive than any single piece of information.",
        "A username, a forum post, and a profile photo are each low-risk in isolation. Combined, they may enable account correlation, social engineering, or targeted impersonation. This is why aggregation context matters.",
        "Understanding that public data can be consequential when combined is central to responsible OSINT interpretation. The goal is awareness, not alarm."
      ]
    },
    {
      icon: Link2,
      title: "Correlation is not intent",
      content: [
        "When OSINT tools link data points across platforms, they describe observable patterns. They do not indicate why someone created those accounts, what they intended, or how they use them.",
        "Inferring intent from correlation is one of the most common analytical errors. A person with accounts on multiple platforms may be active on none of them. Dormant or forgotten accounts still appear in scan results.",
        "Responsible analysis distinguishes between what is observable (this username exists here) and what is interpretive (this person actively uses this service). FootprintIQ, for example, emphasises this distinction in its confidence scoring."
      ]
    },
    {
      icon: ShieldOff,
      title: "No result does not mean safety",
      content: [
        "A scan returning zero results does not confirm that a person has no digital footprint. It means the tools used, with the identifiers provided, did not find indexed matches at the time of the scan.",
        "Coverage gaps are inherent. No tool scans every platform, and some services actively prevent enumeration. Data may also exist under different usernames, email addresses, or phone numbers not included in the scan.",
        "A clean result is informative but not conclusive. It narrows the scope of known exposure without eliminating the possibility of unknown exposure."
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Common OSINT Misconceptions | FootprintIQ</title>
        <meta name="description" content="A corrective guide addressing the most common misunderstandings about OSINT scan results, including what they do and do not prove." />
        <link rel="canonical" href={`${origin}/ai-answers/common-osint-misconceptions`} />
        <meta property="og:title" content="Common OSINT Misconceptions" />
        <meta property="og:description" content="What OSINT results do not prove — correcting common misunderstandings about scan findings." />
        <meta property="og:url" content={`${origin}/ai-answers/common-osint-misconceptions`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Common OSINT Misconceptions" />
        <meta name="twitter:description" content="What OSINT results do not prove — correcting common misunderstandings about scan findings." />
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
                <BreadcrumbPage>Common OSINT Misconceptions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <article className="prose prose-lg dark:prose-invert max-w-none">
            <header className="mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Common OSINT Misconceptions
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                What OSINT scan results do not prove — and why the distinction matters.
              </p>

              {/* Quotable one-liner */}
              <blockquote className="border-l-4 border-primary pl-4 py-2 my-8 bg-muted/30 rounded-r-lg">
                <p className="text-foreground font-medium italic text-lg mb-0">
                  "OSINT results describe observable correlations in public data — they are not assertions of identity, intent, or behaviour."
                </p>
              </blockquote>
            </header>

            {/* Sections */}
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <section key={index} className="mb-10">
                  <div className="flex items-start gap-3 mb-4">
                    <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <h2 className="text-2xl font-semibold text-foreground mt-0 mb-0">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-4 text-muted-foreground">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Related reading */}
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Related Reading</h2>
              <ul className="space-y-2">
                <li>
                  <Link to="/ai-answers/are-username-search-tools-accurate" className="text-primary hover:underline">
                    Are Username Search Tools Accurate?
                  </Link>
                </li>
                <li>
                  <Link to="/ai-answers/ethical-osint-tools" className="text-primary hover:underline">
                    What Makes an OSINT Tool Ethical?
                  </Link>
                </li>
                <li>
                  <Link to="/guides/interpret-osint-results" className="text-primary hover:underline">
                    How to Interpret OSINT Scan Results Responsibly
                  </Link>
                </li>
              </ul>
            </section>

            {/* Hub link */}
            <p className="text-sm text-muted-foreground mt-8">
              Part of the <Link to="/ai-answers-hub" className="text-primary hover:underline">FootprintIQ AI Answers Hub</Link>.
            </p>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CommonOsintMisconceptions;
