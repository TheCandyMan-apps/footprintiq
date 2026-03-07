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
import { Twitter } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find someone on Twitter/X by username?", a: "Yes. Twitter/X profiles are accessible at x.com/username or twitter.com/username. FootprintIQ checks Twitter/X alongside 500+ platforms to identify cross-platform presence." },
  { q: "Can you see someone's deleted tweets?", a: "Twitter/X does not provide access to deleted tweets. However, third-party archival services like the Wayback Machine and cached Google results may preserve deleted content." },
  { q: "Is it legal to search for someone on Twitter/X?", a: "Yes. Public Twitter/X profiles and tweets are publicly accessible. FootprintIQ only queries public data and never accesses protected accounts." },
  { q: "Can you find a Twitter/X account by email?", a: "Twitter/X does not publicly link emails to profiles. However, if a username is known, cross-platform correlation can connect the Twitter identity to email addresses found elsewhere." },
  { q: "How do you identify fake Twitter/X accounts?", a: "Fake accounts often have recently created profiles, low follower counts, generic bios, no profile photos, and primarily retweet or reply to specific accounts in coordinated patterns. Blue verification badges help but are no longer reliable as sole indicators since paid verification was introduced." },
];

const canonical = "https://footprintiq.app/how-to-find-someone-on-twitter";

export default function HowToFindSomeoneOnTwitter() {
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" }, { "@type": "ListItem", position: 2, name: "How To Find Someone On Twitter/X", item: canonical }] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", headline: "How To Find Someone On Twitter/X", description: "Learn how to find someone on Twitter/X using username searches, tweet analysis, and cross-platform OSINT techniques.", author: { "@type": "Organization", name: "FootprintIQ" }, publisher: { "@type": "Organization", name: "FootprintIQ" }, datePublished: "2026-03-07", dateModified: "2026-03-07", mainEntityOfPage: { "@type": "WebPage", "@id": canonical } };

  return (
    <>
      <Helmet>
        <title>How To Find Someone On Twitter/X – Profile Search Guide | FootprintIQ</title>
        <meta name="description" content="Find someone on Twitter/X by username. Search profiles, analyse tweet history, and trace cross-platform identities using ethical OSINT investigation techniques." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="How To Find Someone On Twitter/X – Profile Search Guide | FootprintIQ" />
        <meta property="og:description" content="Find someone on Twitter/X by username. Search profiles, analyse tweets, and trace identities." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30"><Twitter className="h-3 w-3 mr-1.5" />Twitter/X Investigation Guide</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How To Find Someone On Twitter</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Twitter (now X) is one of the most publicly accessible social platforms — most profiles and tweets are visible without authentication. Learn how to find Twitter profiles, analyse tweet histories, and connect Twitter identities to broader digital footprints.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Searching By Username</h2>
            <p>Twitter/X profiles are accessible at <code>x.com/username</code> (or <code>twitter.com/username</code>). Unlike Snapchat, Twitter allows username changes, meaning a user's handle may differ from what it was in the past.</p>
            <p>A public Twitter/X profile reveals extensive data:</p>
            <ul>
              <li><strong>Display name and bio.</strong> The display name (which may differ from the @handle) and bio frequently contain real names, job titles, employer references, locations, and links to other social profiles or websites.</li>
              <li><strong>Tweet history.</strong> Every public tweet, reply, quote tweet, and retweet is visible. Tweet content reveals opinions, interests, knowledge areas, social connections, and — through mentions and replies — relationship networks.</li>
              <li><strong>Media uploads.</strong> Photos and videos posted to Twitter may contain EXIF data, geotags, or visual location indicators. Profile and header images can be reverse-searched to find matching visuals elsewhere.</li>
              <li><strong>Follower and following lists.</strong> Both lists are public and reveal social networks, professional affiliations, and interest communities. Who someone follows is often more revealing than who follows them.</li>
              <li><strong>Lists membership.</strong> Twitter lists that include the user — often created by journalists, industry observers, or community managers — can reveal how others categorise the individual.</li>
              <li><strong>Account creation date.</strong> Visible on every profile, indicating how long the identity has been active on the platform.</li>
              <li><strong>Pinned tweet.</strong> The tweet a user chooses to pin to their profile reveals what they consider most important or representative of their identity.</li>
            </ul>
            <p>FootprintIQ checks Twitter/X handles across 500+ platforms simultaneously, connecting the Twitter identity to accounts on other services.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Finding Profiles By Profile Information</h2>
            <p>Twitter's public nature and strong search indexing provide multiple pathways to locate someone:</p>
            <ul>
              <li><strong>Twitter advanced search.</strong> Twitter's built-in advanced search supports queries by keyword, phrase, hashtag, account, date range, and minimum engagement. This is one of the most powerful native search tools on any social platform.</li>
              <li><strong>Google site search.</strong> Using <code>site:twitter.com "target name"</code> leverages Google's indexing to surface profiles and tweets that may not appear in Twitter's own search.</li>
              <li><strong>Mention search.</strong> Searching for @mentions of a known account reveals who interacts with the target and in what context. This is valuable for understanding social connections.</li>
              <li><strong>Location-based search.</strong> Twitter's advanced search allows filtering by geographic proximity (when users have geotagging enabled), though this feature has become less prominent over time.</li>
              <li><strong>Bio search tools.</strong> Third-party tools that index Twitter bios allow searching for keywords like job titles, company names, or locations to find profiles matching specific criteria.</li>
              <li><strong>Hashtag analysis.</strong> Searching for niche or event-specific hashtags can surface accounts that participated in particular conversations or attended specific events.</li>
            </ul>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Investigation Techniques</h2>
            <p>Twitter is one of the most valuable platforms for OSINT due to its public-by-default nature and real-time content:</p>
            <ul>
              <li><strong>Tweet timeline analysis.</strong> Mapping tweet timestamps reveals active hours and timezone. Consistent tweeting during 9-5 in a specific timezone strongly indicates geographic location. Gaps in activity may correspond to travel, illness, or life events.</li>
              <li><strong>Sentiment and opinion mapping.</strong> Analysing tweet content over time builds a detailed picture of the user's political views, professional opinions, personal values, and emotional patterns.</li>
              <li><strong>Network analysis.</strong> Mapping who the user mentions, replies to, retweets, and who reciprocates reveals professional relationships, personal connections, and community affiliations. Clusters of mutual interactions indicate close relationships.</li>
              <li><strong>Historical username tracking.</strong> Third-party tools track Twitter username changes. Previous handles can be cross-referenced on other platforms where the old username may still be in use.</li>
              <li><strong>Media intelligence.</strong> Photos posted to Twitter can be reverse-image searched. Background details in images — street signs, building facades, weather conditions — provide geolocation signals.</li>
              <li><strong>Thread and long-form content analysis.</strong> Twitter threads and long-form posts (via Twitter Blue) reveal expertise areas, writing style, and detailed opinions that are less common in short tweets.</li>
              <li><strong>Cross-platform username pivoting.</strong> The Twitter handle serves as a search key across 500+ platforms. FootprintIQ's <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> automates this process.</li>
            </ul>
            <p>For a comprehensive guide, see our <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link> guide.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Fake Profile Detection</h2>
            <p>Twitter/X has a significant fake account problem. Key detection indicators include:</p>
            <ul>
              <li><strong>Account age vs. activity.</strong> Newly created accounts with aggressive posting patterns — especially around political events, product launches, or controversies — are frequently part of coordinated inauthentic behaviour campaigns.</li>
              <li><strong>Follower-to-following ratio.</strong> Accounts following thousands but followed by very few are often using follow-for-follow tactics or are part of bot networks. Conversely, accounts with unrealistically high follower counts relative to their content quality may have purchased followers.</li>
              <li><strong>Content originality.</strong> Accounts that exclusively retweet, post generic motivational content, or share content from a single source without original commentary are more likely automated or part of amplification campaigns.</li>
              <li><strong>Profile image verification.</strong> Reverse-searching profile images can reveal whether they're stock photos, AI-generated faces, or stolen from other accounts. AI-generated faces often have subtle artifacts around ears, backgrounds, and eyewear.</li>
              <li><strong>Verification status.</strong> Since Twitter introduced paid verification, the blue badge is no longer a reliable indicator of authenticity. Gold organisation badges and government badges remain more trustworthy signals.</li>
              <li><strong>Coordinated posting patterns.</strong> Groups of accounts posting similar content at similar times, using the same hashtags, and retweeting each other suggest organised campaigns rather than genuine user activity.</li>
            </ul>
            <p>FootprintIQ's confidence scoring helps distinguish between genuine cross-platform identity matches and coincidental overlaps.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Using FootprintIQ To Search Across Platforms</h2>
            <p>Twitter identities frequently connect to a broad online presence. FootprintIQ maps these connections comprehensively:</p>
            <ul>
              <li><strong>Cross-platform enumeration.</strong> Enter a Twitter handle and FootprintIQ checks the same username across 500+ platforms. Users who maintain a personal brand often use consistent handles across Twitter, GitHub, LinkedIn, and personal websites.</li>
              <li><strong>Bio link extraction.</strong> Website and social links from Twitter bios are cross-referenced with discovered profiles to confirm identity connections.</li>
              <li><strong>Profile metadata correlation.</strong> Display names, profile images, and bio text from Twitter are compared against matched profiles for identity verification.</li>
              <li><strong>Confidence scoring.</strong> Each result receives a confidence score based on multi-signal analysis, helping prioritise genuine matches over coincidental username overlaps.</li>
              <li><strong>Investigation workflows.</strong> Results can be exported and integrated into broader cases with documentation.</li>
            </ul>
            <p>Start with a <Link to="/scan" className="text-primary hover:underline">free username scan</Link> to see what's publicly discoverable. You can also use our <Link to="/usernames" className="text-primary hover:underline">username search tool</Link>, run a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link>, or check your full exposure with the <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint scanner</Link>.</p>
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
        <section className="py-12 bg-muted/10"><div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
}
