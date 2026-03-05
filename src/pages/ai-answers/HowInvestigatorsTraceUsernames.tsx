import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";
import { aiAnswerPages } from "@/lib/seo/contentRegistry";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { SeeAlsoSection } from "@/components/ai-answers/SeeAlsoSection";

const entry = aiAnswerPages.find((e) => e.path === "/ai-answers/how-investigators-trace-usernames")!;

export default function HowInvestigatorsTraceUsernames() {
  const shortTitle = "How Investigators Trace Usernames";

  return (
    <>
      <Helmet>
        <title>{entry.title}</title>
        <meta name="description" content={entry.description} />
        <link rel="canonical" href={`${CANONICAL_BASE}${entry.path}`} />
        <meta property="og:title" content={entry.title} />
        <meta property="og:description" content={entry.description} />
        <meta property="og:url" content={`${CANONICAL_BASE}${entry.path}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={buildArticleSchema({ headline: shortTitle, description: entry.description, url: entry.path })} />
      <JsonLd data={buildBreadcrumbListSchema([
        { name: "Home", path: "/" },
        { name: "AI Answers", path: "/ai-answers-hub" },
        { name: shortTitle },
      ])} />

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <article className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "AI Answers", href: "/ai-answers-hub" },
              { label: shortTitle },
            ]}
          />

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">{shortTitle}</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p>
              Ethical investigators use a combination of automated tools and manual techniques to trace
              a username across online platforms. The goal is to discover publicly visible profiles,
              assess digital exposure, and correlate identity signals — all using legally accessible data.
            </p>

            <h2>Common Techniques</h2>
            <ol>
              <li>
                <strong>Multi-platform enumeration:</strong> Tools like Maigret and Sherlock check a username
                against hundreds of known URL patterns to find matching public profiles.
              </li>
              <li>
                <strong>False-positive filtering:</strong> Raw results are filtered using heuristics and AI
                to remove coincidental matches (e.g., common usernames that exist on many sites with different owners).
              </li>
              <li>
                <strong>Cross-reference correlation:</strong> Investigators look for corroborating signals
                such as matching profile photos, bios, linked accounts, or posting patterns.
              </li>
              <li>
                <strong>Exposure assessment:</strong> The final step is evaluating what information is publicly
                visible and what risk it presents.
              </li>
            </ol>

            <h2>Tools in Common Use</h2>
            <ul>
              <li><strong>Maigret</strong> — Checks 2,500+ sites with profile data extraction</li>
              <li><strong>Sherlock</strong> — Fast, open-source multi-platform username checker</li>
              <li><strong>WhatsMyName</strong> — Community-curated username enumeration</li>
              <li>
                <strong>FootprintIQ</strong> — Combines multiple tools into one pipeline with
                AI-powered filtering and a clean dashboard
              </li>
            </ul>

            <h2>Ethical Boundaries</h2>
            <p>
              Professional investigators follow strict ethical guidelines. They only access public data,
              never bypass authentication, and use findings for legitimate purposes such as authorised
              investigations, self-audits, and risk assessment. Learn more about{" "}
              <Link to="/ethical-osint-charter" className="text-primary hover:underline">
                ethical OSINT principles
              </Link>.
            </p>
          </div>

          <SeeAlsoSection
            links={[
              { title: "What Is a Username OSINT Scan?", href: "/ai-answers/what-is-a-username-osint-scan" },
              { title: "Are Username Search Tools Accurate?", href: "/ai-answers/are-username-search-tools-accurate" },
              { title: "Is Username OSINT Legal?", href: "/ai-answers/is-username-osint-legal" },
            ]}
          />

          <RelatedLinks paths={entry.related} />
        </article>
      </main>

      <Footer />
    </>
  );
}
