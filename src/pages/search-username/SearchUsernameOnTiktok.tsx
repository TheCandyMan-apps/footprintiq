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
  { q: "Can you search for someone on TikTok by username?", a: "Yes. TikTok profiles are publicly accessible at tiktok.com/@username. FootprintIQ checks this URL and simultaneously scans 500+ other platforms for the same handle." },
  { q: "How do I find a TikTok user by username?", a: "Enter the TikTok username into FootprintIQ. The tool verifies the profile exists on TikTok and checks for cross-platform presence, returning results with confidence scores." },
  { q: "Is TikTok username search free?", a: "Yes. FootprintIQ's free tier includes TikTok username checks along with hundreds of other platforms. No account required for basic scans." },
  { q: "Can you find a TikTok account without the app?", a: "Yes. TikTok profiles are accessible via web browser at tiktok.com/@username. FootprintIQ performs this lookup programmatically without requiring the TikTok app." },
  { q: "What does a TikTok username reveal?", a: "A public TikTok profile shows display name, bio, follower/following counts, total likes, and public videos. When cross-referenced with other platforms, the same username can reveal a much broader digital identity." },
];

export default function SearchUsernameOnTiktok() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Search Username On TikTok", item: "https://footprintiq.app/search-username-on-tiktok" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Search Username On TikTok – Find TikTok Profiles | FootprintIQ</title>
        <meta name="description" content="Search for a username on TikTok and discover linked accounts across 500+ platforms. Free TikTok username lookup with cross-platform OSINT intelligence." />
        <link rel="canonical" href="https://footprintiq.app/search-username-on-tiktok" />
        <meta property="og:title" content="Search Username On TikTok – Find TikTok Profiles | FootprintIQ" />
        <meta property="og:description" content="Search for a username on TikTok and discover linked accounts across 500+ platforms." />
        <meta property="og:url" content="https://footprintiq.app/search-username-on-tiktok" />
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
              <Shield className="h-3 w-3 mr-1.5" />TikTok Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Username On TikTok
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Look up any TikTok username to verify profile existence, discover cross-platform accounts, and map digital exposure across 500+ public platforms.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work On TikTok</h2>
            <p>
              TikTok profiles follow a predictable URL structure: <code>tiktok.com/@username</code>. When you search for a username on TikTok, OSINT tools query this URL and analyse the HTTP response to determine whether a profile exists. A valid response with profile metadata confirms the account; an error response indicates it does not.
            </p>
            <p>
              TikTok's rapid growth has made it one of the most important platforms for digital footprint analysis. With over a billion active users, the platform contains a vast amount of publicly accessible content — videos, comments, profile details, and engagement metrics — all indexed by username.
            </p>
            <p>
              FootprintIQ extends the TikTok lookup by simultaneously checking the same handle across social media, gaming, developer, and forum platforms. This reveals whether the TikTok identity connects to other online accounts, providing a comprehensive view of cross-platform exposure.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Using A Username</h2>
            <p>
              TikTok usernames are frequently reused on other platforms. Finding all connected accounts follows a proven methodology:
            </p>
            <ol>
              <li><strong>Enter the TikTok handle.</strong> FootprintIQ checks the username against its database of 500+ platform URL patterns, returning matches with confidence scores.</li>
              <li><strong>Analyse match quality.</strong> High-confidence results share corroborating signals — similar bios, matching profile images, or linked URLs. Low-confidence matches on common usernames require manual verification.</li>
              <li><strong>Check handle variants.</strong> TikTok allows periods and underscores that may differ on other platforms. Search variations to capture accounts the primary lookup might miss.</li>
              <li><strong>Review the exposure summary.</strong> FootprintIQ categorises results by platform type and risk level, making it easy to identify the most sensitive exposures.</li>
            </ol>
            <p>
              See our{" "}
              <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link>{" "}
              guide for advanced techniques.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Reuse Across Social Networks</h2>
            <p>
              Username reuse is especially common among TikTok's younger demographic, who often maintain the same handle across Instagram, Snapchat, Twitter/X, YouTube, and Discord. This consistency makes cross-platform tracking straightforward for anyone with access to OSINT tools.
            </p>
            <p>
              Each platform adds new dimensions to the digital identity: Instagram reveals visual interests and social connections, Twitter/X exposes opinions and conversations, and GitHub may indicate technical skills and professional projects. The combined picture is significantly more revealing than any single platform.
            </p>
            <p>
              FootprintIQ's{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse analysis</Link>{" "}
              maps these connections and provides specific recommendations for reducing cross-platform traceability.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Techniques For Username Investigation</h2>
            <p>
              When investigating a TikTok username, professionals employ several complementary techniques:
            </p>
            <ul>
              <li><strong>Username pivoting.</strong> Using the confirmed TikTok handle as a starting point to enumerate accounts across all indexed platforms.</li>
              <li><strong>Content metadata analysis.</strong> Examining publicly available video metadata — posting times, geolocation tags (if enabled), and audio selections — for intelligence value.</li>
              <li><strong>Engagement pattern analysis.</strong> Reviewing public comment activity and duet/stitch interactions to map social connections and interests.</li>
              <li><strong>Cross-platform correlation.</strong> Comparing profile details, profile photos, and bio text across matched platforms to verify identity linkage with confidence.</li>
            </ul>
            <p>
              These workflows are automated in FootprintIQ's scanning pipeline. Explore our{" "}
              <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques guide</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Protecting Your Privacy On TikTok</h2>
            <p>
              To reduce your TikTok-related digital exposure:
            </p>
            <ul>
              <li><strong>Use a unique handle.</strong> Don't reuse your TikTok username on other platforms — this is the most effective way to prevent cross-platform tracking.</li>
              <li><strong>Set your account to private.</strong> Private TikTok accounts restrict video visibility to approved followers only.</li>
              <li><strong>Disable discoverability features.</strong> Turn off "Suggest your account to others" and sync-from-contacts in TikTok's privacy settings.</li>
              <li><strong>Audit linked accounts.</strong> Review and disconnect any social accounts linked to your TikTok profile.</li>
              <li><strong>Remove location data.</strong> Ensure location services are disabled for TikTok to prevent geographic metadata in your content.</li>
            </ul>
            <p>
              Run a comprehensive{" "}
              <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link>{" "}
              to see everything that's publicly visible about your online identity.
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
