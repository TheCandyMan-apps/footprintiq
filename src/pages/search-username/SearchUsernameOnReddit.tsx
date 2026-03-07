import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { HeroInputField } from "@/components/HeroInputField";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you look up a Reddit user by username?", a: "Yes. Reddit profiles are publicly accessible at reddit.com/user/username. FootprintIQ checks this URL and simultaneously searches 500+ other platforms for the same handle." },
  { q: "Is Reddit username search free?", a: "Yes. FootprintIQ offers a free scan that covers Reddit and hundreds of other platforms. Premium plans provide deeper analysis and ongoing monitoring." },
  { q: "Can you see deleted Reddit posts through a username search?", a: "FootprintIQ checks live profile availability — it does not access deleted or removed content. Third-party archive services may retain cached content independently." },
  { q: "Does Reddit show your real identity?", a: "Reddit does not require real names. However, post history, writing style, and disclosed details can collectively reveal significant personal information over time." },
  { q: "How do I find all accounts linked to a Reddit username?", a: "Enter the Reddit username into FootprintIQ. The tool checks whether the same handle exists on social media, gaming, developer, and forum platforms, and applies confidence scoring to identify genuine matches." },
];

export default function SearchUsernameOnReddit() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Search Username On Reddit", item: "https://footprintiq.app/search-username-on-reddit" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Search Username On Reddit – Find Reddit Profiles | FootprintIQ</title>
        <meta name="description" content="Search for a username on Reddit and discover linked accounts across 500+ platforms. Free Reddit username lookup with cross-platform intelligence." />
        <link rel="canonical" href="https://footprintiq.app/search-username-on-reddit" />
        <meta property="og:title" content="Search Username On Reddit – Find Reddit Profiles | FootprintIQ" />
        <meta property="og:description" content="Search for a username on Reddit and discover linked accounts across 500+ platforms." />
        <meta property="og:url" content="https://footprintiq.app/search-username-on-reddit" />
        <meta property="og:type" content="website" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Shield className="h-3 w-3 mr-1.5" />Reddit Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Username On Reddit
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Look up any Reddit username to check profile existence, discover cross-platform accounts, and assess digital exposure across 500+ public platforms.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work On Reddit</h2>
            <p>
              Reddit profiles follow a predictable URL pattern: <code>reddit.com/user/username</code>. When you search for a Reddit username, OSINT tools query this endpoint and analyse the response to confirm whether the account exists and is active.
            </p>
            <p>
              Reddit is particularly interesting for OSINT because it is pseudonymous by design. Users rarely attach real names to their accounts, but their post and comment history often reveals personal details — interests, location hints, professional expertise, and opinions — that accumulate over months and years of activity.
            </p>
            <p>
              FootprintIQ checks the Reddit username and simultaneously searches the same handle across social media, developer platforms, gaming networks, and niche forums. This cross-platform enumeration reveals whether the pseudonymous Reddit identity connects to more identifiable accounts elsewhere.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Using A Username</h2>
            <p>
              Reddit usernames are often reused on other platforms because users favour consistency and memorability. Finding linked accounts requires a structured approach:
            </p>
            <ol>
              <li><strong>Enter the exact Reddit handle.</strong> FootprintIQ searches the username across 500+ platforms, returning results with confidence scores that indicate match reliability.</li>
              <li><strong>Check for handle variations.</strong> Reddit allows underscores and numbers that may differ on other platforms. Search common variations (with/without underscores, appended numbers) to capture the full footprint.</li>
              <li><strong>Cross-reference metadata.</strong> Compare profile details, writing style, and interests across matched accounts. Consistent patterns strengthen identity correlation.</li>
              <li><strong>Assess exposure risk.</strong> FootprintIQ categorises findings by risk level, highlighting accounts that expose sensitive personal information.</li>
            </ol>
            <p>
              For advanced techniques, explore our{" "}
              <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Reuse Across Social Networks</h2>
            <p>
              Username reuse is one of the most common privacy vulnerabilities online. A handle created for Reddit — intended to be anonymous — may also exist on Instagram, Twitter/X, GitHub, or Steam under the same identity. Each platform adds a new dimension of personal data to the profile.
            </p>
            <p>
              The risk is compounded on Reddit because users often share more freely under the assumption of anonymity. When that same username links to a platform where real identity is visible, the pseudonymous content becomes attributable.
            </p>
            <p>
              FootprintIQ's{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse risk assessment</Link>{" "}
              quantifies this exposure and provides actionable guidance for breaking cross-platform linkage chains.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Techniques For Username Investigation</h2>
            <p>
              Professional investigators apply several techniques when researching Reddit usernames:
            </p>
            <ul>
              <li><strong>Username pivoting.</strong> Using a confirmed Reddit handle as a seed to enumerate presence across hundreds of platforms systematically.</li>
              <li><strong>Content analysis.</strong> Reviewing public post history for disclosed personal details — location references, workplace mentions, timezone indicators, and linguistic patterns.</li>
              <li><strong>Subreddit profiling.</strong> The subreddits a user frequents reveal interests, geographic ties, and professional domains that aid in identity correlation.</li>
              <li><strong>Temporal patterns.</strong> Posting times and activity windows can indicate timezone and daily routine, narrowing geographic possibilities.</li>
            </ul>
            <p>
              These techniques are automated within FootprintIQ's scanning pipeline. Learn more about{" "}
              <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Protecting Your Privacy On Reddit</h2>
            <p>
              If a Reddit username search reveals unexpected exposure, take these steps to reduce your digital footprint:
            </p>
            <ul>
              <li><strong>Use a unique Reddit handle.</strong> Don't reuse your Reddit username on platforms where your real identity is visible. This is the single most effective step.</li>
              <li><strong>Audit your post history.</strong> Review old posts and comments for accidentally disclosed personal information — addresses, workplaces, or identifiable anecdotes.</li>
              <li><strong>Limit profile details.</strong> Reddit's profile fields (avatar, banner, bio) are optional. Minimise what you share.</li>
              <li><strong>Consider periodic account rotation.</strong> For privacy-sensitive users, creating new accounts periodically prevents the accumulation of a long, analysable post history.</li>
              <li><strong>Delete dormant accounts.</strong> Old accounts on other platforms still carry your username. Remove them to shrink your attack surface.</li>
            </ul>
            <p>
              Run a{" "}
              <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link>{" "}
              to see your full online presence and receive a prioritised remediation plan.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <FinalCTA />
        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
