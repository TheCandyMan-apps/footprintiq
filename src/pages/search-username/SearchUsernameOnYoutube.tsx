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
  { q: "Can you search for a YouTube user by username?", a: "Yes. YouTube channels can be found via youtube.com/@handle. FootprintIQ checks this URL and simultaneously searches 500+ other platforms for the same handle." },
  { q: "What's the difference between a YouTube handle and channel name?", a: "A YouTube handle (prefixed with @) is the unique identifier used in URLs. The channel name is the display name shown on the channel page. FootprintIQ searches by handle for accurate cross-platform matching." },
  { q: "Is YouTube username search legal?", a: "Yes. YouTube channel pages are publicly accessible. FootprintIQ only queries publicly available URLs and never accesses private or unlisted content." },
  { q: "Can you find someone's other accounts from their YouTube username?", a: "If the same handle is used on other platforms, FootprintIQ will detect it. Cross-platform username reuse is common and is the primary method for linking online identities." },
  { q: "What information is visible on a public YouTube channel?", a: "Public YouTube channels display the channel name, handle, subscriber count, join date, description, featured channels, and all public videos. Comments on videos are also publicly accessible." },
];

export default function SearchUsernameOnYoutube() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Search Username On YouTube", item: "https://footprintiq.app/search-username-on-youtube" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Search Username On YouTube – Find YouTube Channels | FootprintIQ</title>
        <meta name="description" content="Search for a username on YouTube and discover linked accounts across 500+ platforms. Free YouTube username lookup with cross-platform OSINT scanning." />
        <link rel="canonical" href="https://footprintiq.app/search-username-on-youtube" />
        <meta property="og:title" content="Search Username On YouTube – Find YouTube Channels | FootprintIQ" />
        <meta property="og:description" content="Search for a username on YouTube and discover linked accounts across 500+ platforms." />
        <meta property="og:url" content="https://footprintiq.app/search-username-on-youtube" />
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
              <Shield className="h-3 w-3 mr-1.5" />YouTube Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Username On YouTube
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Enter a YouTube handle to check channel existence, discover cross-platform accounts, and assess digital exposure across 500+ public platforms.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work On YouTube</h2>
            <p>
              YouTube adopted the <code>@handle</code> system, giving every channel a unique, searchable identifier at <code>youtube.com/@handle</code>. This standardised URL structure makes YouTube handle lookups reliable and automatable.
            </p>
            <p>
              When FootprintIQ searches for a YouTube username, it queries the channel URL and verifies whether the profile exists. Public channels expose a wealth of information: subscriber counts, video upload history, channel description, featured channels, and community posts — all accessible without authentication.
            </p>
            <p>
              The tool simultaneously checks the same handle across 500+ other platforms, revealing whether the YouTube identity extends to social media, forums, gaming networks, and developer communities. This multi-platform enumeration transforms a simple channel lookup into a comprehensive digital footprint assessment.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Using A Username</h2>
            <p>
              YouTube handles are frequently reused across platforms. Content creators especially tend to maintain consistent branding, using the same handle on Twitter/X, Instagram, TikTok, and Twitch.
            </p>
            <ol>
              <li><strong>Search the YouTube handle.</strong> Enter the exact handle (without the @) into FootprintIQ for cross-platform enumeration.</li>
              <li><strong>Review confidence-scored results.</strong> Each match is rated based on corroborating signals — bio similarity, profile image matching, and linked URLs.</li>
              <li><strong>Check the channel's "About" section.</strong> YouTube channels often list links to other social profiles, providing direct confirmation of cross-platform identity.</li>
              <li><strong>Search handle variants.</strong> Creators sometimes use abbreviated or extended versions of their handle on different platforms. Run additional searches to capture these.</li>
            </ol>
            <p>
              Our{" "}
              <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link>{" "}
              guide covers advanced cross-platform investigation techniques.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Reuse Across Social Networks</h2>
            <p>
              Content creators and everyday users alike tend to maintain the same handle across YouTube, Instagram, Twitter/X, TikTok, and Twitch. This consistency — essential for brand building — simultaneously creates a comprehensive map of their online presence.
            </p>
            <p>
              For creators, this is intentional: cross-platform discoverability drives audience growth. For personal accounts, however, the same pattern can inadvertently expose private interests, opinions, or activities when a casual YouTube channel shares a handle with a more personal Reddit or forum account.
            </p>
            <p>
              FootprintIQ's{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse risk assessment</Link>{" "}
              helps users understand exactly where their handle appears and what each platform reveals about them.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Techniques For Username Investigation</h2>
            <p>
              When researching a YouTube handle, investigators combine automated scanning with manual analysis:
            </p>
            <ul>
              <li><strong>Username pivoting.</strong> Using the YouTube handle as a seed to enumerate accounts across all indexed platforms.</li>
              <li><strong>Channel metadata analysis.</strong> Reviewing channel descriptions, featured channels, and linked social accounts for direct identity connections.</li>
              <li><strong>Comment history review.</strong> Public comments on other channels reveal interests, opinions, and engagement patterns not visible on the user's own channel.</li>
              <li><strong>Upload pattern analysis.</strong> Video upload frequency and timing can indicate timezone, routine, and level of activity.</li>
            </ul>
            <p>
              Learn more about{" "}
              <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Protecting Your Privacy On YouTube</h2>
            <p>
              To minimise your YouTube-related exposure:
            </p>
            <ul>
              <li><strong>Use a unique handle.</strong> If your YouTube channel is personal, avoid using the same handle on platforms where you share more sensitive content.</li>
              <li><strong>Review your channel description.</strong> Remove personal details — real name, location, email — that aren't essential for your channel's purpose.</li>
              <li><strong>Audit linked accounts.</strong> Check the "Links" section of your channel and remove any social profiles you don't want publicly associated.</li>
              <li><strong>Manage comment visibility.</strong> Your public comments on other channels are part of your digital footprint. Review and remove those that reveal personal information.</li>
              <li><strong>Set video visibility.</strong> Use unlisted or private settings for videos not intended for public discovery.</li>
            </ul>
            <p>
              Use FootprintIQ's{" "}
              <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint checker</Link>{" "}
              for a comprehensive view of your online exposure.
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
