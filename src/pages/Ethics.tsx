import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

const sections = [
  {
    id: "public-data-only",
    title: "Public data only",
    content: [
      "FootprintIQ analyses information that is already publicly accessible — data that anyone could find through search engines, social media platforms, public records, or open directories.",
      "The platform does not access private accounts, bypass authentication, intercept communications, or interact with restricted systems. If information requires credentials or special access to reach, it is outside FootprintIQ's scope.",
      "This boundary is intentional. Ethical OSINT begins with the principle that analysis should never extend beyond what is freely available to the public.",
    ],
  },
  {
    id: "correlation-vs-identity",
    title: "Correlation vs identity",
    content: [
      "OSINT results describe observable correlations in public data — they are not assertions of identity, intent, or behaviour.",
      "When FootprintIQ reports that a username appears on multiple platforms, it means exactly that: the same string was found in publicly listed profiles. It does not confirm that the same person owns all of those accounts, nor does it imply anything about the person behind them.",
      "Confidence scores reflect signal strength — how many independent data points align — rather than certainty of identity. A high confidence score means the available public indicators are consistent, not that ownership has been verified.",
      "This distinction matters. Conflating correlation with identity is one of the most common errors in OSINT interpretation, and FootprintIQ is designed to make that distinction visible rather than obscure it.",
    ],
  },
  {
    id: "harm-reduction",
    title: "Harm reduction by design",
    content: [
      "FootprintIQ is built for self-assessment and authorised research, not surveillance. The platform is designed to help individuals understand their own digital footprint and to support organisations conducting legitimate, consented investigations.",
      "Several design choices reflect this orientation:",
    ],
    list: [
      "Results are presented with educational context, not alarm. Findings include explanations of what they mean and what they do not.",
      "Confidence indicators are always visible, helping users distinguish strong signals from weak ones before drawing conclusions.",
      "Interpretive guidance is embedded throughout the platform — in tooltips, result footers, and dedicated guides — so users have the context they need at the point of decision.",
      "No urgency-driven or fear-based language is used. Results are framed as observations, not threats.",
    ],
    suffix: [
      "The goal is informed awareness. Users decide what matters and what action, if any, to take.",
    ],
  },
  {
    id: "safeguards",
    title: "Safeguards against misuse",
    content: [
      "FootprintIQ implements safeguards intended to reduce the risk of the platform being used to harm others:",
    ],
    list: [
      "Rate limiting and usage monitoring help detect patterns consistent with bulk surveillance or harassment campaigns.",
      "Terms of service explicitly prohibit using the platform to stalk, harass, doxx, or discriminate against any person.",
      "Scan results are scoped to the authenticated user's own queries and are not shared publicly or indexed by search engines.",
      "The platform does not offer features designed for covert monitoring of other individuals.",
    ],
    suffix: [
      "No technical safeguard is perfect. These measures are part of a broader commitment to responsible design, not a guarantee against all misuse.",
    ],
  },
  {
    id: "user-responsibility",
    title: "User responsibility and consent",
    content: [
      "FootprintIQ provides information. What users do with that information is their responsibility.",
      "The platform encourages users to apply the same ethical standards they would expect others to apply when handling their own data. This includes:",
    ],
    list: [
      "Using results for self-assessment, security review, or authorised professional purposes.",
      "Not drawing definitive conclusions from correlations alone.",
      "Respecting the privacy and dignity of any individuals whose information may appear in results.",
      "Seeking appropriate professional or legal advice before acting on findings in sensitive contexts.",
    ],
    suffix: [
      "FootprintIQ focuses on ethical, defensive OSINT for self-assessment and authorised research. The platform's value depends on users exercising good judgement about how they interpret and apply what they find.",
    ],
  },
];

const Ethics = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: "/ethics",
    pageType: "authority",
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ethical Design Principles | FootprintIQ",
    description:
      "FootprintIQ's ethical design principles — covering public data use, correlation versus identity, harm reduction, safeguards, and user responsibility.",
    url: `${origin}/ethics`,
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: origin,
    },
    datePublished: "2026-02-10",
    dateModified: "2026-02-10",
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: "Ethical Design Principles",
        item: `${origin}/ethics`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Ethical Design Principles | FootprintIQ</title>
        <meta
          name="description"
          content="How FootprintIQ approaches ethical OSINT — covering public data use, correlation versus identity, harm reduction by design, and user responsibility."
        />
        <link rel="canonical" href={`${origin}/ethics`} />
        <meta property="og:title" content="Ethical Design Principles | FootprintIQ" />
        <meta
          property="og:description"
          content="How FootprintIQ approaches ethical OSINT — public data only, correlation vs identity, harm reduction, and safeguards against misuse."
        />
        <meta property="og:url" content={`${origin}/ethics`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
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
                <BreadcrumbPage>Ethical Design Principles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Ethical Design Principles</h1>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              FootprintIQ is an ethical OSINT platform designed to help individuals understand their
              public digital footprint. These principles guide how the platform is built, what it
              does, and what it deliberately does not do.
            </p>
          </header>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-20">
                <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
                <div className="space-y-3 text-[15px] text-muted-foreground leading-relaxed">
                  {section.content.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  {section.list && (
                    <ul className="list-disc list-inside space-y-1.5 ml-2">
                      {section.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.suffix?.map((para, i) => (
                    <p key={`s-${i}`}>{para}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Canonical disclaimer */}
          <div className="mt-12 p-4 rounded-lg bg-muted/20 border border-border/30">
            <p className="text-sm text-muted-foreground leading-relaxed">
              FootprintIQ analyses publicly available information to identify potential account
              exposure and correlation risks, while emphasising accuracy, transparency, and
              responsible interpretation. OSINT results describe observable correlations in public
              data — they are not assertions of identity, intent, or behaviour.
            </p>
          </div>

          {/* Related reading */}
          <aside className="mt-10 pt-8 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Related reading</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/ai-answers/ethical-osint-tools"
                  className="text-primary hover:underline"
                >
                  What Makes an OSINT Tool Ethical?
                </Link>{" "}
                — How responsible OSINT tools differ in design and safeguards.
              </li>
              <li>
                <Link
                  to="/guides/interpret-osint-results"
                  className="text-primary hover:underline"
                >
                  How to Interpret OSINT Results
                </Link>{" "}
                — Practical guidance on reading confidence scores and avoiding common mistakes.
              </li>
            </ul>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Ethics;
