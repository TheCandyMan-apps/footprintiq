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
  { q: "Can you search for a Discord user by username?", a: "Discord usernames are not publicly searchable via URL like most social platforms. However, OSINT tools can check whether the same handle appears on other platforms, providing indirect evidence of a Discord presence." },
  { q: "Are Discord profiles public?", a: "Discord profiles are only partially visible. Server membership and activity are not publicly indexed. However, if a user shares their Discord username on other platforms (bios, forums), it becomes discoverable through OSINT techniques." },
  { q: "How do I find someone's Discord username?", a: "If you know a username used on another platform, search it with FootprintIQ. Users who reuse handles frequently list their Discord username in their Twitter/X bio, Reddit profile, or gaming platform profiles." },
  { q: "Is Discord username search legal?", a: "Yes. Searching for publicly shared usernames is legal. FootprintIQ only accesses publicly available information and never attempts to access private Discord servers or messages." },
  { q: "What is a Discord discriminator?", a: "Discord previously used 4-digit discriminators (e.g., User#1234) to differentiate users with the same name. In 2023, Discord migrated to unique usernames without discriminators. FootprintIQ searches the username portion across platforms." },
];

export default function SearchUsernameOnDiscord() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Search Username On Discord", item: "https://footprintiq.app/search-username-on-discord" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Search Username On Discord – Find Discord Users | FootprintIQ</title>
        <meta name="description" content="Search for a Discord username across 500+ platforms. Discover linked accounts and cross-platform exposure with FootprintIQ's free OSINT scanner." />
        <link rel="canonical" href="https://footprintiq.app/search-username-on-discord" />
        <meta property="og:title" content="Search Username On Discord – Find Discord Users | FootprintIQ" />
        <meta property="og:description" content="Search for a Discord username across 500+ platforms and discover linked accounts." />
        <meta property="og:url" content="https://footprintiq.app/search-username-on-discord" />
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
              <Shield className="h-3 w-3 mr-1.5" />Discord Username Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Username On Discord
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Search a Discord username across 500+ public platforms to discover cross-platform accounts, assess digital exposure, and map online presence.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Username Searches Work On Discord</h2>
            <p>
              Discord operates differently from most social platforms. Unlike Twitter/X, Instagram, or Reddit, Discord does not provide publicly accessible profile URLs that can be queried directly. Profiles are visible only to users who share a server or have a mutual connection.
            </p>
            <p>
              This makes Discord username searching an indirect process. OSINT tools like FootprintIQ approach Discord usernames by checking whether the same handle appears on platforms that <em>are</em> publicly indexable — social media, forums, gaming platforms, and developer communities. Users who maintain the same handle across Discord and public platforms create a traceable link between their semi-private Discord activity and their public online presence.
            </p>
            <p>
              Additionally, many users voluntarily share their Discord username in their Twitter/X bio, Reddit profile, Linktree, or gaming platform accounts. FootprintIQ's cross-platform scan identifies these public disclosures, providing evidence of Discord presence without directly querying Discord's API.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Using A Username</h2>
            <p>
              Because Discord lacks public profile pages, finding accounts linked to a Discord username requires leveraging the username's presence elsewhere:
            </p>
            <ol>
              <li><strong>Search the Discord handle across platforms.</strong> Enter the username into FootprintIQ. If the same handle exists on Twitter/X, GitHub, Steam, or other platforms, the tool will identify the matches.</li>
              <li><strong>Check gaming platforms.</strong> Discord is heavily used by gamers. The same username frequently appears on Steam, Xbox Live, PlayStation Network, and game-specific forums.</li>
              <li><strong>Look for public bot listings.</strong> If the user operates Discord bots, bot listing sites (top.gg, discord.bots.gg) may display their username and linked server information.</li>
              <li><strong>Review developer profiles.</strong> Discord developers often share their username on GitHub, GitLab, or Stack Overflow profiles alongside their projects.</li>
            </ol>
            <p>
              For more techniques, see our{" "}
              <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> guide.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Reuse Across Social Networks</h2>
            <p>
              Discord users frequently maintain the same handle across gaming platforms, social media, and developer communities. This reuse pattern — especially common among gamers and content creators — creates a bridge between the relatively private Discord ecosystem and the public internet.
            </p>
            <p>
              The transition from discriminators (User#1234) to unique usernames in 2023 made Discord handles more consistent with other platforms, increasing the likelihood of username reuse. A handle that was previously unique to Discord may now match exactly with accounts on Twitter/X, Instagram, or Steam.
            </p>
            <p>
              FootprintIQ's{" "}
              <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse risk assessment</Link>{" "}
              identifies where your Discord handle appears publicly and recommends steps to reduce cross-platform exposure.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>OSINT Techniques For Username Investigation</h2>
            <p>
              Investigating Discord usernames requires adapted OSINT techniques due to the platform's closed architecture:
            </p>
            <ul>
              <li><strong>Cross-platform pivoting.</strong> Using the Discord handle as a search term across all public platforms to find correlated accounts.</li>
              <li><strong>Bio scraping.</strong> Searching for the Discord username in the bios and descriptions of public profiles on Twitter/X, Instagram, Reddit, and Linktree.</li>
              <li><strong>Gaming platform correlation.</strong> Checking Steam, Epic Games, Riot Games, and other gaming platforms where Discord integration is common.</li>
              <li><strong>Server listing analysis.</strong> Public Discord server listing sites may expose usernames of server owners and administrators.</li>
            </ul>
            <p>
              Explore our full{" "}
              <Link to="/username-osint-techniques" className="text-primary hover:underline">OSINT techniques for username investigation</Link> guide.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Protecting Your Privacy On Discord</h2>
            <p>
              Discord's semi-private architecture provides some inherent privacy, but username reuse can undermine it. To protect yourself:
            </p>
            <ul>
              <li><strong>Use a unique Discord handle.</strong> Don't reuse your Discord username on public platforms. This is the most effective measure against cross-platform linking.</li>
              <li><strong>Don't share your Discord tag publicly.</strong> Avoid listing your Discord username in social media bios, forum signatures, or public profiles.</li>
              <li><strong>Review server membership.</strong> Large public servers may expose your username to thousands of users. Leave servers you no longer actively use.</li>
              <li><strong>Manage connected accounts.</strong> Discord allows linking Spotify, Steam, GitHub, and other accounts to your profile. Review and disconnect services you don't want associated.</li>
              <li><strong>Audit your gaming profiles.</strong> If your Discord handle matches your Steam or Xbox username, consider changing one to break the correlation.</li>
            </ul>
            <p>
              Run a{" "}
              <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link>{" "}
              to assess your full online exposure and receive remediation guidance.
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
