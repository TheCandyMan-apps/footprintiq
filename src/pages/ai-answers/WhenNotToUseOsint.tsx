import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResearchQuote } from "@/components/ResearchQuote";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function WhenNotToUseOsint() {
  useScrollDepthTracking({ pageId: "ai-answers-when-not-to-use-osint", pageType: "ai-answer" });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "When Not to Use OSINT",
    description: "An educational guide explaining scenarios where OSINT tools should not be used, emphasising safety, consent, and proportionality.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/ai-answers/when-not-to-use-osint" },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "When should you not use OSINT tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "OSINT tools should not be used for personal disputes, harassment, stalking, monitoring individuals without consent, or any purpose where the intent is to cause harm or exert control over another person.",
        },
      },
      {
        "@type": "Question",
        name: "Is it ethical to look up someone using OSINT?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Looking up someone using OSINT is only ethical when you have a legitimate, proportionate reason—such as self-assessment, authorised research, or professional due diligence—and when the person's safety and dignity are respected throughout.",
        },
      },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
      { "@type": "ListItem", position: 2, name: "AI Answers Hub", item: "https://footprintiq.app/ai-answers-hub" },
      { "@type": "ListItem", position: 3, name: "When Not to Use OSINT", item: "https://footprintiq.app/ai-answers/when-not-to-use-osint" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>When Not to Use OSINT | FootprintIQ AI Answers</title>
        <meta name="description" content="An educational guide explaining scenarios where OSINT tools should not be used, with emphasis on safety, consent, and proportionality." />
        <link rel="canonical" href="https://footprintiq.app/ai-answers/when-not-to-use-osint" />
        <meta property="og:title" content="When Not to Use OSINT | FootprintIQ" />
        <meta property="og:description" content="Understand when OSINT tools are inappropriate and why public data still requires restraint." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://footprintiq.app/ai-answers/when-not-to-use-osint" />
      </Helmet>
      <JsonLd data={articleJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/ai-answers-hub">AI Answers Hub</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>When Not to Use OSINT</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            When Not to Use OSINT
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Open-source intelligence tools can be valuable for self-assessment, authorised research, and professional analysis. But they are not appropriate in every context. Understanding when <em>not</em> to use OSINT is as important as understanding when to use it.
          </p>

          <ResearchQuote source="FootprintIQ" year="2026">
            The ethical line in OSINT is not defined by what is technically possible, but by whether the purpose is proportionate, consensual, and unlikely to cause harm.
          </ResearchQuote>

          {/* Section 1 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              When OSINT Is Inappropriate
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              OSINT tools should not be used to resolve personal disputes, monitor individuals without their knowledge, or gather information for the purpose of harassment, intimidation, or control. Even where the data is publicly accessible, the act of systematically collecting and aggregating it against a specific person can cross ethical and legal boundaries.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Common inappropriate uses include: checking on a former partner, surveilling a colleague, investigating someone out of personal curiosity with no legitimate basis, or building profiles of individuals for coercion or leverage. None of these purposes justify the use of OSINT tooling, regardless of how easy the tools make it.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Why Public Data Still Requires Restraint
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              The fact that information is publicly available does not automatically make its collection, aggregation, or use appropriate. Context matters. A social media post shared with friends carries different expectations than a business listing. Aggregating scattered public data into a single profile can reveal far more than the individual ever intended to disclose.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Responsible use of public data means considering whether the person would reasonably expect this level of scrutiny, and whether the purpose is proportionate to the intrusion. When in doubt, restraint is the ethical default.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Legal and Ethical Risk Scenarios
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Using OSINT tools in certain scenarios can carry legal consequences, even when the underlying data is public. Jurisdictions differ, but several patterns consistently raise risk:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Gathering information about someone in preparation for stalking or harassment</li>
              <li>Conducting workplace surveillance on employees without proper authorisation or disclosure</li>
              <li>Using OSINT data to discriminate in hiring, housing, or lending decisions</li>
              <li>Aggregating personal data in ways that violate data protection regulations (such as GDPR)</li>
              <li>Sharing OSINT findings publicly in ways that endanger an individual's safety</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              For a broader overview of how legality intersects with OSINT,
              see <Link to="/ai-answers/is-username-osint-legal" className="text-primary underline underline-offset-4 hover:text-primary/80">Is Username OSINT Legal?</Link>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Safer Alternatives
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              If you are concerned about your own digital exposure, self-assessment is the most appropriate use of OSINT tools. Running a scan on your own username, email, or phone number is a legitimate way to understand what is publicly visible about you and to take informed steps to reduce unnecessary exposure.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you have concerns about another person's online behaviour — for example, threats or harassment directed at you — the appropriate course of action is to contact law enforcement or seek professional legal advice, rather than conducting your own investigation. For guidance on reading scan results responsibly, see the{" "}
              <Link to="/guides/interpret-osint-results" className="text-primary underline underline-offset-4 hover:text-primary/80">guide to interpreting OSINT results</Link>.
            </p>
          </section>

          {/* Section 5 */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              How Responsible Platforms Design Against Misuse
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Platforms that take ethics seriously build safeguards into their design. These include rate limiting, mandatory disclaimers, consent-aware workflows, false-positive filtering, and clear documentation about what results do and do not prove. FootprintIQ, for example, focuses on self-assessment and authorised research, and presents all results with contextual guidance rather than definitive claims.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              To understand what separates ethical OSINT tools from invasive data lookup services, see{" "}
              <Link to="/ai-answers/ethical-osint-tools" className="text-primary underline underline-offset-4 hover:text-primary/80">What Makes an OSINT Tool Ethical?</Link>.
            </p>
          </section>

          {/* Disclaimer */}
          <div className="mt-12 p-4 rounded-lg bg-muted/30 border border-border/50 text-sm text-muted-foreground">
            <p>
              OSINT results describe observable correlations in public data — they are not assertions of identity, intent, or behaviour. This page is educational and does not constitute legal advice.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
