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
import { Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find all of someone's social media accounts?", a: "No tool can guarantee 100% coverage. Private accounts, accounts using different handles, and platforms not indexed by OSINT tools will not appear in results. However, FootprintIQ's 500+ platform coverage combined with confidence scoring provides the most comprehensive publicly available analysis." },
  { q: "How do you find someone's hidden social media profiles?", a: "If an account is truly private and uses a unique handle, it won't appear in username searches. However, most people reuse handles across platforms. Searching a known username, email, or phone number frequently reveals accounts the person didn't intend to be discoverable." },
  { q: "Is it legal to search for someone's social media accounts?", a: "Yes, when searching publicly available information. FootprintIQ queries public profile URLs and data sources. It never bypasses authentication, accesses private accounts, or violates platform terms of service." },
  { q: "What's the best way to find someone on social media?", a: "Start with what you know — a username, email address, or phone number — and use FootprintIQ to search across 500+ platforms simultaneously. Combining multiple identifiers (username + email) produces the most comprehensive results." },
  { q: "Can I find someone's social media if I only know their real name?", a: "Real name searches are less precise than username or email searches because names are not unique. FootprintIQ focuses on unique identifiers (usernames, emails, phone numbers) for higher accuracy. If you know a username associated with the person, that's a more effective starting point." },
];

export default function FindSomeoneBySocialMedia() {
  const canonical = "https://footprintiq.app/find-someone-by-social-media";
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" }, { "@type": "ListItem", position: 2, name: "Find Someone By Social Media", item: canonical }] };

  return (
    <>
      <Helmet>
        <title>Find Someone By Social Media – Discover All Profiles | FootprintIQ</title>
        <meta name="description" content="Find someone's social media accounts using OSINT techniques. Discover profiles across Instagram, Twitter/X, TikTok, Reddit, and 500+ platforms." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Find Someone By Social Media – Discover All Profiles | FootprintIQ" />
        <meta property="og:description" content="Find someone's social media accounts across 500+ platforms using ethical OSINT." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30"><Users className="h-3 w-3 mr-1.5" />Social Media Investigation</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How To Find Someone's Social Media Accounts</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover how OSINT investigators locate social media profiles across platforms using usernames, email addresses, and phone numbers — and how FootprintIQ automates this process across 500+ platforms.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Social Media Accounts Reveal Digital Identities</h2>
            <p>Social media accounts are among the richest sources of publicly accessible personal information. Each platform captures different aspects of a person's life — professional history on LinkedIn, personal interests on Instagram, opinions on Twitter/X, anonymous thoughts on Reddit, and entertainment preferences on TikTok.</p>
            <p>When these accounts are linked together — through shared usernames, profile photos, or bio details — they form a comprehensive digital identity that reveals far more than any single profile. This is the foundation of social media intelligence (SOCMINT), a subset of OSINT focused specifically on social platform analysis.</p>
            <p>The key insight for investigators and privacy-conscious users alike: <strong>your social media presence is not isolated.</strong> Cross-platform correlation techniques can connect accounts you may consider unrelated, building a composite picture from fragments spread across dozens of services.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Search For Social Media Accounts</h2>
            <p>There are three primary methods for finding someone's social media accounts, each with different strengths:</p>
            <h3>1. Username Search</h3>
            <p>The most common and effective approach. Enter a known username into FootprintIQ to check it across 500+ platforms simultaneously. Because most people reuse usernames, a single confirmed handle often reveals accounts on platforms the person didn't expect to be discoverable.</p>
            <p>FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search</Link> checks social media, forums, gaming networks, developer communities, and niche platforms — far beyond what manual searching could cover.</p>
            <h3>2. Email Address Search</h3>
            <p>Email addresses are used as registration keys across most platforms. FootprintIQ's <Link to="/email-breach-check" className="text-primary hover:underline">email breach check</Link> identifies platforms where the email was used to create accounts, and breach databases often reveal associated usernames.</p>
            <h3>3. Phone Number Search</h3>
            <p>Phone numbers are increasingly used for account verification and recovery. Platforms like WhatsApp, Telegram, and Facebook allow discovery by phone number (unless the user has disabled this). Data broker listings frequently correlate phone numbers with social media profiles.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Platforms You Can Search</h2>
            <p>FootprintIQ searches over 500 platforms, including the most commonly used social media services:</p>
            <ul>
              <li><strong><Link to="/search-instagram-by-username" className="text-primary hover:underline">Instagram</Link></strong> — photos, stories, follower networks, tagged locations, and bio details.</li>
              <li><strong><Link to="/search-twitter-by-username" className="text-primary hover:underline">Twitter/X</Link></strong> — tweets, replies, follower graphs, opinions, and real-time activity.</li>
              <li><strong><Link to="/search-tiktok-by-username" className="text-primary hover:underline">TikTok</Link></strong> — video content, engagement metrics, and linked accounts.</li>
              <li><strong><Link to="/search-reddit-by-username" className="text-primary hover:underline">Reddit</Link></strong> — pseudonymous posts and comments revealing interests and opinions.</li>
              <li><strong><Link to="/search-discord-by-username" className="text-primary hover:underline">Discord</Link></strong> — semi-private identity correlated through cross-platform handle reuse.</li>
              <li><strong><Link to="/search-youtube-by-username" className="text-primary hover:underline">YouTube</Link></strong> — channel content, comments, and linked social accounts.</li>
              <li><strong><Link to="/search-snapchat-by-username" className="text-primary hover:underline">Snapchat</Link></strong> — handle existence and cross-platform correlation.</li>
              <li><strong><Link to="/search-twitch-by-username" className="text-primary hover:underline">Twitch</Link></strong> — streaming activity, gaming identity, and linked accounts.</li>
              <li><strong><Link to="/search-telegram-by-username" className="text-primary hover:underline">Telegram</Link></strong> — public channels, groups, and bot ownership.</li>
            </ul>
            <p>Beyond major social platforms, FootprintIQ covers gaming networks, developer communities, dating platforms, professional sites, and niche forums. See our full <Link to="/username-search-platforms" className="text-primary hover:underline">platform directory</Link>.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Privacy Risks Of Connected Social Media Profiles</h2>
            <p>When social media accounts are linked through username reuse, the privacy implications are significant:</p>
            <ul>
              <li><strong>Identity correlation.</strong> A professional LinkedIn profile linked to an anonymous Reddit account through a shared username collapses the boundary between professional and private identity.</li>
              <li><strong>Social engineering intelligence.</strong> Attackers who can map all of someone's social media accounts have comprehensive material for targeted phishing, pretexting, and impersonation.</li>
              <li><strong>Data aggregation.</strong> Data brokers and people-search sites actively correlate social media profiles to build comprehensive, sellable dossiers.</li>
              <li><strong>Reputation risk.</strong> Content shared casually on one platform can be discovered through cross-platform searches and impact professional or personal reputation.</li>
            </ul>
            <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to understand your own cross-platform exposure and receive remediation guidance.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Reduce Your Social Media Footprint</h2>
            <ul>
              <li><strong>Use unique handles per platform category.</strong> Maintain separate usernames for professional, personal, and anonymous activities.</li>
              <li><strong>Audit your existing profiles.</strong> Search your own username with FootprintIQ to discover accounts you may have forgotten about.</li>
              <li><strong>Delete dormant accounts.</strong> Every forgotten account is a data exposure point. Deactivate or delete accounts you no longer use.</li>
              <li><strong>Review privacy settings.</strong> Each platform has discoverability settings that control how easily your profile can be found. Disable phone number and email discovery where possible.</li>
              <li><strong>Minimise profile metadata.</strong> Remove personal details — location, employer, phone number — from bios and profile fields unless they're necessary.</li>
              <li><strong>Monitor continuously.</strong> Your digital footprint changes as platforms index new content. Periodic rescanning catches new exposure.</li>
            </ul>
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
