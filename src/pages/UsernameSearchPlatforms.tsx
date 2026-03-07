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
import { Card, CardContent } from "@/components/ui/card";
import { Shield, ArrowRight, Globe, Eye, Lock, Users, Zap, Search } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const PLATFORMS = [
  {
    name: "Instagram",
    slug: "/platforms/instagram/username-search",
    desc: "Instagram profiles are publicly accessible at instagram.com/username. Public accounts expose photos, stories highlights, follower counts, bio text, and tagged locations. Instagram's visual nature makes profile photos and image metadata particularly valuable for identity correlation. FootprintIQ checks Instagram alongside 500+ other platforms in a single scan.",
  },
  {
    name: "Reddit",
    slug: "/search-username-on-reddit",
    desc: "Reddit profiles live at reddit.com/user/username and are pseudonymous by design. While users rarely attach real names, their post and comment history accumulates a rich trail of interests, opinions, geographic hints, and professional knowledge. Subreddit activity alone can reveal location, employer, and personal circumstances. The same handle on Reddit and a real-name platform creates a direct identity link.",
  },
  {
    name: "TikTok",
    slug: "/search-username-on-tiktok",
    desc: "TikTok profiles follow the pattern tiktok.com/@username and display public videos, follower/following counts, total likes, and bio information. With over a billion users, TikTok is a critical platform for digital footprint analysis — especially among younger demographics who frequently reuse the same handle across Instagram, Snapchat, and Discord.",
  },
  {
    name: "Twitter/X",
    slug: "/search-username-on-twitter",
    desc: "Twitter/X profiles at x.com/username expose display names, bios, follower graphs, join dates, and public tweet history. The platform's conversational nature means users often disclose opinions, locations, and connections that aren't shared elsewhere. Reply networks and follower overlap provide additional correlation data for investigators.",
  },
  {
    name: "Snapchat",
    slug: "/platforms/snapchat/username-search",
    desc: "Snapchat's ephemeral messaging model limits publicly available data, but usernames are still searchable. Snapchat handles frequently match those used on Instagram and TikTok, making cross-platform correlation straightforward. Public Snap Map activity and Snapchat Stories (when set to public) provide additional data points.",
  },
  {
    name: "Discord",
    slug: "/search-username-on-discord",
    desc: "Discord operates differently from most social platforms — profiles are not publicly accessible via URL. However, Discord usernames are frequently shared in Twitter/X bios, Reddit profiles, and gaming platform accounts. Since Discord migrated from discriminator tags to unique usernames in 2023, handle reuse across platforms has become even more common.",
  },
  {
    name: "YouTube",
    slug: "/search-username-on-youtube",
    desc: "YouTube channels are accessible at youtube.com/@handle and expose channel descriptions, subscriber counts, upload history, featured channels, and public comments. Content creators typically maintain the same handle across YouTube, Twitter/X, Instagram, and Twitch — making YouTube a reliable starting point for cross-platform enumeration.",
  },
  {
    name: "Pinterest",
    slug: "/platforms/pinterest/username-search",
    desc: "Pinterest profiles at pinterest.com/username reveal curated boards, saved pins, follower counts, and bio information. Pinterest activity is often overlooked in OSINT investigations but can reveal personal interests, lifestyle preferences, and aspirations that other platforms don't capture. The visual nature of saved content provides unique intelligence value.",
  },
  {
    name: "Twitch",
    slug: "/platforms/twitch/username-search",
    desc: "Twitch profiles at twitch.tv/username display streaming history, follower counts, bio details, and linked social accounts. The gaming and streaming community shows particularly high username reuse rates — the same handle often appears across Twitch, Discord, Steam, YouTube, and Twitter/X, creating a densely interconnected digital identity.",
  },
  {
    name: "Telegram",
    slug: "/guides/telegram-osint-search",
    desc: "Telegram usernames are searchable at t.me/username for public profiles and channels. While Telegram is designed for privacy, public group memberships and channel ownership are discoverable. The same username on Telegram and a less private platform can bridge the gap between anonymous messaging and a publicly identifiable online presence.",
  },
];

const FAQS = [
  {
    q: "How many platforms can FootprintIQ search?",
    a: "FootprintIQ searches over 500 platforms simultaneously, including social media, forums, gaming networks, developer communities, and niche sites. Results are returned with confidence scores to distinguish genuine matches from coincidental ones.",
  },
  {
    q: "Is it legal to search for usernames across platforms?",
    a: "Yes. Username searches query publicly accessible profile URLs — the same information anyone can find through a search engine. FootprintIQ never bypasses authentication, accesses private accounts, or scrapes behind login walls.",
  },
  {
    q: "What if someone has a common username?",
    a: "Common usernames like 'alex' or 'user123' will match on many platforms. FootprintIQ applies confidence scoring — analysing bio similarity, profile photo hashes, and metadata patterns — to distinguish genuine matches from coincidental ones.",
  },
  {
    q: "Can I search for usernames without creating an account?",
    a: "Yes. FootprintIQ offers a free scan that requires no account registration. Enter a username and receive cross-platform results immediately.",
  },
  {
    q: "How does username search differ from people search?",
    a: "Username search starts with a known handle and maps it across platforms. People search starts with a real name and attempts to find associated accounts. Username search is more precise because handles are unique per platform, while names are not.",
  },
  {
    q: "What should I do if I find my username on platforms I've forgotten about?",
    a: "Deactivate or delete dormant accounts to reduce your digital footprint. Each forgotten account is a potential exposure point — even if you haven't used it in years, it still carries your username and any data you previously shared.",
  },
  {
    q: "Does FootprintIQ store my search queries?",
    a: "FootprintIQ follows a data minimisation approach. Search queries are processed in real time and are not retained for third-party use. See our privacy policy for full details.",
  },
  {
    q: "Can I search for email addresses and phone numbers too?",
    a: "Yes. FootprintIQ supports username, email, and phone number scans. Each scan type queries different data sources to provide comprehensive exposure intelligence.",
  },
];

export default function UsernameSearchPlatforms() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Username Search Platforms", item: "https://footprintiq.app/username-search-platforms" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Search Usernames Across Social Media Platforms (2026 Guide)",
    description:
      "Comprehensive guide to searching usernames across social media platforms. Covers Instagram, Reddit, TikTok, Twitter/X, Discord, YouTube, and more.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-03-07",
    dateModified: "2026-03-07",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/username-search-platforms" },
  };

  return (
    <>
      <Helmet>
        <title>Username Search Platforms – Search Across Social Media | FootprintIQ</title>
        <meta
          name="description"
          content="Search usernames across 500+ social media platforms. Find accounts by username on Instagram, Reddit, TikTok, Twitter/X, Discord, YouTube, and more with FootprintIQ."
        />
        <link rel="canonical" href="https://footprintiq.app/username-search-platforms" />
        <meta property="og:title" content="Username Search Platforms – Search Across Social Media | FootprintIQ" />
        <meta
          property="og:description"
          content="Search usernames across 500+ social media platforms. Find accounts by username on Instagram, Reddit, TikTok, Twitter/X, Discord, YouTube and more."
        />
        <meta property="og:url" content="https://footprintiq.app/username-search-platforms" />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Globe className="h-3 w-3 mr-1.5" />
              Cross-Platform Username Intelligence
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Usernames Across Social Media Platforms
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              A single username can unlock an entire digital identity. Search across Instagram,
              Reddit, TikTok, Twitter/X, Discord, YouTube, and 500+ other platforms to map online
              presence, assess exposure, and understand what's publicly discoverable.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8">
              Free, instant results · Confidence-scored matches · Public data only
            </p>
            <HeroInputField />
            <div className="mt-6">
              <EthicalOsintTrustBlock />
            </div>
          </div>
        </section>

        {/* Why Usernames Reveal Online Identities */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Usernames Reveal Online Identities</h2>

            <p>
              A username is the most consistent identifier across the internet. Unlike email
              addresses — which users may maintain several of — or phone numbers — which change with
              carriers and countries — usernames tend to persist. People choose a handle they like and
              carry it from platform to platform, often for years or decades.
            </p>

            <p>
              This consistency is precisely what makes usernames so valuable for digital footprint
              analysis. A handle created for a gaming forum in 2015 may still be active on Instagram,
              Twitter/X, Reddit, and a dozen niche communities in 2026. Each platform adds a new
              layer to the digital identity: professional history from LinkedIn, casual opinions from
              Reddit, visual interests from Pinterest, real-time location from Snapchat.
            </p>

            <p>
              Research from FootprintIQ's{" "}
              <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">
                2026 Username Reuse & Digital Exposure Report
              </Link>{" "}
              found that the average internet user maintains the same primary username across 4–7
              platforms. Among users aged 18–30, that number rises to 6–12. Each instance is a
              publicly accessible data point that contributes to a composite picture of who someone
              is, what they do, and where they are.
            </p>

            <p>
              For cybersecurity professionals, this means a single confirmed username is often
              sufficient to map an individual's entire public digital presence. For everyday users, it
              means understanding your own username exposure is the first step toward controlling your
              online narrative.
            </p>
          </div>
        </section>

        {/* How Username Searches Work */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work Across Platforms</h2>

            <p>
              Username search tools operate on a straightforward principle: most social media
              platforms use predictable URL patterns for profile pages. Twitter/X uses{" "}
              <code>x.com/username</code>, Instagram uses <code>instagram.com/username</code>,
              Reddit uses <code>reddit.com/user/username</code>, and so on.
            </p>

            <p>
              An OSINT username search tool constructs these URLs for hundreds of platforms
              simultaneously and analyses the HTTP responses. A 200 response with valid profile
              metadata confirms the account exists; a 404 or redirect indicates it does not. This
              process — called <strong>username enumeration</strong> — can check 500+ platforms in
              seconds.
            </p>

            <h3>The Challenge: False Positives</h3>

            <p>
              Raw username enumeration produces false positives, especially for common handles. A
              search for "alex" will match on virtually every platform — but those matches likely
              belong to hundreds of different people. This is where basic tools fall short and
              advanced platforms like FootprintIQ differentiate themselves.
            </p>

            <p>
              FootprintIQ addresses false positives through multi-signal confidence scoring:
            </p>

            <ul>
              <li>
                <strong>Profile metadata comparison.</strong> Bios, display names, and linked URLs
                are compared across matched platforms. Consistent details increase confidence;
                contradictions lower it.
              </li>
              <li>
                <strong>Profile image analysis.</strong> Perceptual hashing detects visually similar
                profile photos across platforms, even if images have been resized or cropped.
              </li>
              <li>
                <strong>Temporal correlation.</strong> Account creation dates and activity patterns
                are analysed. Accounts created in the same time period with matching details receive
                higher confidence scores.
              </li>
              <li>
                <strong>Platform category weighting.</strong> A handle that appears on both a gaming
                forum and a gaming-adjacent social platform carries different weight than one shared
                between unrelated platform categories.
              </li>
            </ul>

            <p>
              The result is a set of matches ranked by likelihood of belonging to the same person —
              not just a raw list of URL hits. For a deeper look at the methodology, see our guide
              to{" "}
              <Link to="/username-osint-techniques" className="text-primary hover:underline">
                username OSINT techniques
              </Link>.
            </p>
          </div>
        </section>

        {/* Social Media Platforms You Can Search */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg dark:prose-invert mb-10">
              <h2>Social Media Platforms You Can Search</h2>
              <p>
                FootprintIQ searches over 500 platforms, but the following are among the most
                commonly queried — and the most revealing — for username-based OSINT
                investigations.
              </p>
            </div>

            <div className="space-y-6">
              {PLATFORMS.map((p) => (
                <Card key={p.name} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{p.name}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                      </div>
                      <Link
                        to={p.slug}
                        className="shrink-0 text-primary hover:underline text-sm font-medium flex items-center gap-1 mt-1"
                      >
                        Search <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              These are just 10 of over 500 platforms FootprintIQ searches. The full index includes
              developer communities, gaming networks, dating platforms, niche forums, and
              professional networks.
            </p>
          </div>
        </section>

        {/* How FootprintIQ Searches */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How FootprintIQ Searches Across Hundreds Of Platforms</h2>

            <p>
              FootprintIQ combines multiple open-source OSINT engines into a single automated
              pipeline. Rather than running Sherlock, Maigret, and WhatsMyName separately and
              manually merging results, FootprintIQ orchestrates these tools behind the scenes and
              delivers unified, deduplicated, confidence-scored output.
            </p>

            <h3>The Scanning Pipeline</h3>

            <ol>
              <li>
                <strong>Input normalisation.</strong> The submitted username is cleaned, validated,
                and prepared for multi-tool dispatch. Handle variations (with/without underscores,
                case differences) are noted for supplementary checks.
              </li>
              <li>
                <strong>Multi-engine enumeration.</strong> The username is dispatched to multiple
                scanning engines simultaneously. Each engine checks its indexed platform list and
                returns raw results.
              </li>
              <li>
                <strong>Deduplication and merging.</strong> Results from different engines that
                reference the same platform are merged. Duplicate entries are consolidated, and the
                highest-fidelity data from each source is retained.
              </li>
              <li>
                <strong>AI-powered false-positive filtering.</strong> An AI classification layer
                analyses each result against known false-positive patterns. Results that match
                generic error pages, placeholder profiles, or unrelated accounts are flagged and
                deprioritised.
              </li>
              <li>
                <strong>Confidence scoring.</strong> Each remaining result receives a confidence
                score based on metadata comparison, profile similarity, and platform-specific
                signals.
              </li>
              <li>
                <strong>Categorisation and risk assessment.</strong> Results are grouped by platform
                category (social media, gaming, developer, forums) and assigned a risk level based
                on the sensitivity of the exposed information.
              </li>
            </ol>

            <p>
              This pipeline transforms a simple username query into a structured intelligence
              report — complete with prioritised findings and actionable remediation steps. The
              entire process completes in seconds.
            </p>

            <p>
              For a comparison of the underlying tools, see our{" "}
              <Link to="/username-search-tools" className="text-primary hover:underline">
                username search tools
              </Link>{" "}
              and{" "}
              <Link to="/best-osint-tools" className="text-primary hover:underline">
                best OSINT tools
              </Link>{" "}
              guides.
            </p>
          </div>
        </section>

        {/* Privacy Risks */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Privacy Risks Of Reused Usernames</h2>

            <p>
              Username reuse is the most underestimated privacy risk on the internet. While most
              people understand that sharing their real name online carries risk, few consider that
              their username — a seemingly anonymous identifier — can be just as revealing.
            </p>

            <h3>Identity Correlation</h3>
            <p>
              When the same username appears on LinkedIn (real name, employer, education) and Reddit
              (anonymous opinions, personal anecdotes), anyone who searches that username can connect
              the two. The pseudonymous content becomes attributable to a real person. This is not a
              theoretical risk — it is the foundational technique of username-based OSINT
              investigation.
            </p>

            <h3>Social Engineering Vectors</h3>
            <p>
              Attackers use cross-platform intelligence to craft targeted social engineering attacks.
              A username that connects a professional LinkedIn profile with a gaming forum and a
              dating site provides rich material for phishing, pretexting, or impersonation. The more
              platforms a username links together, the more ammunition an attacker has.
            </p>

            <h3>Data Broker Aggregation</h3>
            <p>
              Data brokers and people-search sites actively correlate usernames across platforms to
              build comprehensive profiles for resale. Your reused username may be the key that
              connects disparate data points into a single, monetisable dossier.
            </p>

            <h3>Credential Stuffing Risk</h3>
            <p>
              Username reuse often accompanies password reuse. If a breach exposes credentials on one
              platform, attackers will attempt the same combination across every platform where the
              username appears. A cross-platform username search reveals exactly which accounts are
              at risk.
            </p>

            <h3>Mitigating Username Exposure</h3>
            <ul>
              <li>
                <strong>Use unique handles per platform category.</strong> Maintain separate
                usernames for professional, personal, and anonymous activities.
              </li>
              <li>
                <strong>Audit your existing exposure.</strong> Run a{" "}
                <Link to="/digital-footprint-checker" className="text-primary hover:underline">
                  digital footprint check
                </Link>{" "}
                to see where your current username appears.
              </li>
              <li>
                <strong>Delete dormant accounts.</strong> Every forgotten account is a liability.
                Deactivate or delete accounts you no longer use.
              </li>
              <li>
                <strong>Avoid handle patterns.</strong> Don't use predictable variations
                (username1, username_alt) — these are trivially discoverable.
              </li>
              <li>
                <strong>Monitor continuously.</strong> Your digital footprint changes as platforms
                index new data. Periodic rescanning catches new exposure.
              </li>
            </ul>

            <p>
              For detailed risk analysis, read our{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">
                username reuse risks
              </Link>{" "}
              guide and the{" "}
              <Link
                to="/research/username-reuse-report-2026"
                className="text-primary hover:underline"
              >
                2026 Username Reuse & Digital Exposure Report
              </Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <FinalCTA />

        {/* Related */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-4">Related Resources</h3>
            <div className="flex flex-wrap gap-2 justify-center text-sm">
              {[
                { label: "Username Search", to: "/usernames" },
                { label: "Reverse Username Search", to: "/reverse-username-search" },
                { label: "Username OSINT Techniques", to: "/username-osint-techniques" },
                { label: "Username Reuse Risks", to: "/username-reuse-risks" },
                { label: "Digital Footprint Checker", to: "/digital-footprint-checker" },
                { label: "OSINT Tools", to: "/osint-tools" },
                { label: "Check Username Across Platforms", to: "/check-username-across-platforms" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
