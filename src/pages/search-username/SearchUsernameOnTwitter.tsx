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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowRight } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you search for a username on Twitter/X?", a: "Yes. Twitter/X profiles are publicly accessible at x.com/username. OSINT tools like FootprintIQ automate this lookup and check the same handle across 500+ additional platforms simultaneously." },
  { q: "How do I find someone's Twitter account by username?", a: "Enter their username into FootprintIQ's search. It checks Twitter/X along with hundreds of other platforms, returning confidence-scored results so you know which matches are genuine." },
  { q: "Is it legal to search for a Twitter username?", a: "Yes. Searching publicly available profile URLs is legal. FootprintIQ only accesses information that is already publicly visible — it never bypasses authentication or accesses private accounts." },
  { q: "What information is visible on a public Twitter profile?", a: "Public Twitter/X profiles display the display name, bio, follower/following counts, join date, pinned tweets, and recent posts. Location and website fields are optional but frequently populated." },
  { q: "Can I find deleted Twitter accounts?", a: "Deleted accounts return a 'not found' status. However, cached versions may persist in search engine indexes or web archives. FootprintIQ checks live availability rather than cached data." },
];

export default function SearchUsernameOnTwitter() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Search Username On Twitter", item: "https://footprintiq.app/search-username-on-twitter" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Search Username On Twitter/X – Find Any Profile | FootprintIQ</title>
        <meta name="description" content="Search for a username on Twitter/X and discover linked accounts across 500+ platforms. Free Twitter username lookup with confidence scoring." />
        <link rel="canonical" href="https://footprintiq.app/search-username-on-twitter" />
        <meta property="og:title" content="Search Username On Twitter/X – Find Any Profile | FootprintIQ" />
        <meta property="og:description" content="Search for a username on Twitter/X and discover linked accounts across 500+ platforms." />
        <meta property="og:url" content="https://footprintiq.app/search-username-on-twitter" />
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
              <Shield className="h-3 w-3 mr-1.5" />Twitter/X Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Username On Twitter
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Enter a Twitter/X username to check profile availability, discover cross-platform presence, and assess digital exposure — all from a single search.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work On Twitter</h2>
            <p>
              Twitter/X uses a simple handle-based URL structure: every public profile lives at <code>x.com/username</code>. When you search for a username on Twitter, OSINT tools send an HTTP request to this URL and analyse the response. A valid 200 response with profile metadata confirms the account exists; a 404 indicates it does not.
            </p>
            <p>
              FootprintIQ goes beyond a basic availability check. It extracts publicly visible metadata — display name, bio text, follower counts, and account creation date — and cross-references the same handle against 500+ additional platforms. This multi-platform approach reveals whether the same person maintains accounts elsewhere, helping you build a complete picture of their public online presence.
            </p>
            <p>
              Because common usernames like "alex" or "tech" appear on nearly every platform, FootprintIQ applies confidence scoring to distinguish genuine matches from coincidental ones. Factors such as bio similarity, profile photo hashes, and temporal patterns are used to assign a confidence level to each result.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Using A Username</h2>
            <p>
              Finding accounts linked to a specific Twitter username involves a systematic approach that balances breadth of coverage with result accuracy.
            </p>
            <ol>
              <li><strong>Start with the known handle.</strong> Enter the exact Twitter/X username into FootprintIQ. The tool checks the handle across social media, developer platforms, forums, gaming networks, and niche communities.</li>
              <li><strong>Review confidence scores.</strong> Each result is assigned a confidence rating. High-confidence matches share multiple corroborating signals; low-confidence results may be coincidental and should be cross-validated.</li>
              <li><strong>Examine profile metadata.</strong> Compare bios, profile images, and linked URLs across matched platforms. Consistent details strengthen correlation; contradictions suggest different users.</li>
              <li><strong>Expand the search.</strong> If the user employs handle variations (e.g., appending numbers or underscores), run additional searches with those variants to capture the full footprint.</li>
            </ol>
            <p>
              For a deeper methodology, see our guide to{" "}
              <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Reuse Across Social Networks</h2>
            <p>
              Research consistently shows that the majority of internet users reuse the same username across multiple platforms. This behaviour — while convenient — creates a traceable thread that links accounts together, even when the user intends them to be separate.
            </p>
            <p>
              A username first registered on Twitter may also appear on Instagram, GitHub, Reddit, Steam, and dozens of smaller communities. Each additional platform adds context: professional interests from LinkedIn, gaming habits from Steam, anonymous opinions from Reddit. Combined, these fragments compose a detailed digital identity.
            </p>
            <p>
              FootprintIQ's{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse risk assessment</Link>{" "}
              quantifies this exposure and provides actionable recommendations for reducing cross-platform traceability.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Techniques For Username Investigation</h2>
            <p>
              Professional investigators use several OSINT techniques when researching Twitter usernames:
            </p>
            <ul>
              <li><strong>Username pivoting.</strong> Starting from one confirmed handle and systematically checking it across every indexed platform to map the full account constellation.</li>
              <li><strong>Temporal analysis.</strong> Examining account creation dates and posting patterns to identify primary versus secondary accounts.</li>
              <li><strong>Network analysis.</strong> Reviewing public follower/following lists and reply patterns to identify connected accounts and social circles.</li>
              <li><strong>Metadata correlation.</strong> Comparing profile photos, bios, linked websites, and locations across matched platforms to confirm identity linkage.</li>
            </ul>
            <p>
              These techniques are built into FootprintIQ's automated pipeline, making professional-grade OSINT accessible without requiring manual tool orchestration. Learn more about{" "}
              <Link to="/username-osint-techniques" className="text-primary hover:underline">username OSINT techniques</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Protecting Your Privacy On Twitter</h2>
            <p>
              If your Twitter/X username search reveals more exposure than expected, consider these steps to reduce your digital footprint:
            </p>
            <ul>
              <li><strong>Use unique handles.</strong> Avoid reusing your Twitter username on other platforms. A unique handle per platform breaks cross-referencing chains.</li>
              <li><strong>Audit your bio and metadata.</strong> Remove personal details such as location, workplace, or real name from your Twitter bio if they aren't necessary.</li>
              <li><strong>Review connected apps.</strong> Revoke access for third-party applications you no longer use — these may expose your account to additional data collection.</li>
              <li><strong>Protect your tweets.</strong> If your content is sensitive, consider making your account private. Protected tweets are only visible to approved followers.</li>
              <li><strong>Delete dormant accounts.</strong> Old, forgotten accounts on other platforms still carry your username. Deactivate or delete them to reduce your exposure surface.</li>
            </ul>
            <p>
              Run a{" "}
              <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link>{" "}
              to see the full scope of your online presence and receive a prioritised remediation plan.
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
