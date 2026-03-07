import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { HeroInputField } from "@/components/HeroInputField";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Eye, Shield, Search, Globe, Database, Users, ArrowRight } from "lucide-react";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";

const SLUG = "/how-people-find-you-online";
const CANONICAL = `${CANONICAL_BASE}${SLUG}`;
const TITLE = "How People Find You Online – OSINT Identity Discovery | FootprintIQ";
const DESC = "Learn how investigators, recruiters, and attackers locate online identities using OSINT. Understand username search, social media discovery, and digital footprint tools — and how to protect yourself.";

const FAQS = [
  {
    q: "How can someone find all my online accounts?",
    a: "By searching your username, email address, or phone number across public data sources. OSINT tools automate this process, querying 500+ platforms, breach databases, and data brokers simultaneously. A single identifier can reveal dozens of linked accounts within minutes.",
  },
  {
    q: "What is OSINT and how is it used to find people?",
    a: "OSINT (Open Source Intelligence) is the practice of collecting and analysing publicly available information. Investigators use OSINT techniques to discover social media profiles, forum registrations, breach exposure, and digital footprints without accessing private data or bypassing authentication.",
  },
  {
    q: "Can employers find my social media accounts?",
    a: "Yes. Many employers and recruiters use username search tools and social media screening services to review candidates' online presence. Accounts using your real name, common username, or professional email are particularly easy to discover.",
  },
  {
    q: "How do I stop people from finding me online?",
    a: "Use unique usernames for different platforms, remove or deactivate unused accounts, opt out of data broker listings, and audit your digital footprint regularly. FootprintIQ's scan identifies where you're discoverable so you can take targeted action.",
  },
  {
    q: "Is it legal to search for someone's online identity?",
    a: "Searching publicly available information is legal in most jurisdictions. The legality depends on intent and usage — self-auditing, authorised investigations, and corporate due diligence are legitimate uses. Stalking, harassment, and unauthorised surveillance are illegal regardless of the data source.",
  },
  {
    q: "What's the difference between a username search and a people search?",
    a: "A username search checks whether a specific handle exists across platforms. A people search (data broker lookup) aggregates public records, property data, and consumer information indexed by name, address, or phone number. Both contribute to a complete digital footprint analysis.",
  },
  {
    q: "How accurate are online identity searches?",
    a: "Accuracy varies significantly between tools. Raw username enumeration can produce 30-40% false positives. Advanced platforms like FootprintIQ use AI confidence scoring to reduce false positives to under 5%, distinguishing genuine identity matches from coincidental username overlaps.",
  },
];

export default function HowPeopleFindYouOnline() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={buildArticleSchema({ headline: "How People Find You Online", description: DESC, url: CANONICAL, datePublished: "2026-03-07", dateModified: "2026-03-07" })} />
      <JsonLd data={buildFAQSchema(FAQS)} />
      <JsonLd data={buildBreadcrumbListSchema([{ name: "Home", path: "/" }, { name: "How People Find You Online", path: SLUG }])} />

      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ContentBreadcrumb items={[{ label: "Home", href: "/" }, { label: "How People Find You Online" }]} />
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Eye className="h-3 w-3 mr-1.5" />Online Identity Discovery
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How People Find You Online</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Investigators, recruiters, hackers, and curious strangers can locate your online identity in minutes. Here's exactly how they do it — and how you can protect yourself.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        {/* The Reality Of Online Discoverability */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>The Reality Of Online Discoverability</h2>
            <p>
              Most people dramatically underestimate how easy it is to find them online. A single username, email address, or phone number is enough to uncover a detailed picture of someone's digital life — their social media accounts, professional history, interests, location, and even security vulnerabilities.
            </p>
            <p>
              This isn't the result of sophisticated hacking. It's the natural consequence of how the internet works. Every time you create an account, post a comment, register for a service, or appear in a data breach, you leave a trace. These traces are publicly accessible, and they accumulate over years into a comprehensive digital identity that anyone with the right tools can discover.
            </p>
            <p>
              The people searching for you online fall into several categories, each with different motivations. Recruiters screen candidates before interviews. Journalists verify sources. Law enforcement investigates suspects. Cybersecurity professionals assess threat surfaces. And unfortunately, stalkers, scammers, and identity thieves use the same techniques for malicious purposes.
            </p>
            <p>
              Understanding how these searches work is the first step toward controlling what people find when they look for you. The techniques are well-documented, the tools are freely available, and the only real defence is awareness.
            </p>
          </div>
        </section>

        {/* Username Search */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Username Search: The Starting Point</h2>
            <p>
              Username search is the most common method for locating someone's online accounts. The premise is simple: most people reuse the same username — or a small set of variations — across multiple platforms. If you know someone's Instagram handle, there's a strong probability that the same handle exists on Twitter, Reddit, GitHub, TikTok, and dozens of other services.
            </p>
            <p>
              <Link to="/usernames" className="text-primary hover:underline">Username search tools</Link> automate this process by querying hundreds of platforms simultaneously. They send HTTP requests to known profile URL patterns on each platform — for example, <code className="text-sm">twitter.com/handle</code>, <code className="text-sm">reddit.com/user/handle</code> — and analyse the responses to determine whether a profile exists.
            </p>
            <p>
              The most widely used open-source tools for username enumeration include Sherlock (checking ~400 platforms), Maigret (2,500+ platforms), and WhatsMyName (one of the most actively maintained platform databases). These tools are freely available and can be run from any computer with Python installed.
            </p>
            <p>
              The challenge with raw username search is accuracy. A username like "alex2024" will produce hundreds of matches across platforms, but many of those matches belong to different people. This is where advanced platforms like FootprintIQ add value — by applying AI-powered false-positive filtering that analyses response content, profile metadata, and cross-platform patterns to distinguish genuine matches from coincidental overlaps.
            </p>

            <h3>What A Username Reveals</h3>
            <p>
              A successful username match reveals more than just the existence of an account. Profile pages often expose:
            </p>
            <ul>
              <li>Full names, bios, and profile pictures</li>
              <li>Location information (city, country, timezone)</li>
              <li>Professional details (employer, job title, skills)</li>
              <li>Social connections (followers, friends, group memberships)</li>
              <li>Activity patterns (posting frequency, active hours)</li>
              <li>Interests and beliefs (based on content, groups, and follows)</li>
            </ul>
            <p>
              When this information is aggregated across multiple platforms, the composite picture can be remarkably detailed. The <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">2026 Username Reuse &amp; Digital Exposure Report</Link> found that the average username appears on 14 platforms, and users who reuse a single handle across all services face 3.2x higher exposure risk.
            </p>
          </div>
        </section>

        {/* Social Media Search */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Social Media Intelligence</h2>
            <p>
              Social media platforms are the richest source of publicly available personal information. Unlike forums or professional platforms, social media accounts often contain real names, photographs, relationship details, daily activities, and location data — all voluntarily shared by the user.
            </p>
            <p>
              <Link to="/find-social-media-accounts" className="text-primary hover:underline">Social media account discovery</Link> goes beyond simple username matching. Investigators use several techniques to locate and verify social media profiles:
            </p>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              {[
                { icon: Search, title: "Platform Search APIs", desc: "Many platforms expose search functionality that allows querying by name, email, phone number, or location. Even with privacy restrictions, basic profile information is often returned." },
                { icon: Users, title: "Contact Import Discovery", desc: "Services like Facebook and Instagram allow users to find friends by uploading contacts. OSINT tools exploit this to check whether a phone number or email is registered on a platform." },
                { icon: Globe, title: "Google Dorking", desc: "Advanced search operators like site:instagram.com \"john smith\" or site:linkedin.com/in/ \"data scientist\" reveal indexed profiles that platform search might not surface." },
                { icon: Database, title: "Social Graph Analysis", desc: "Once a single profile is found, the connections, followers, and group memberships reveal a social network that can lead to additional accounts and identifiers." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-6">
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <p>
              The intelligence value of social media extends beyond the content users post. Metadata — when posts were made, which device was used, what location services were enabled — can reveal patterns of behaviour, travel history, and daily routines. This is why privacy settings on social media accounts are critically important, even for seemingly innocuous content.
            </p>
          </div>
        </section>

        {/* Email And Phone Discovery */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Email And Phone Number Discovery</h2>
            <p>
              While usernames are the most visible identifiers, email addresses and phone numbers are often more reliable for identity resolution. Unlike usernames, which can vary across platforms, most people use the same one or two email addresses and a single phone number for virtually everything.
            </p>
            <p>
              <Link to="/find-accounts-by-email" className="text-primary hover:underline">Email-based searches</Link> leverage several techniques. Registration enumeration checks whether an email is registered on a service by observing the login or password-reset response. Breach database lookups reveal which services have leaked data containing the target email. Gravatar lookups can retrieve profile pictures linked to the email's hash.
            </p>
            <p>
              <Link to="/find-accounts-by-phone" className="text-primary hover:underline">Phone number searches</Link> are particularly effective for discovering messaging app accounts. WhatsApp, Telegram, Signal, and Viber all allow contact discovery by phone number. Additionally, reverse phone lookup services connect numbers to names and addresses, and data brokers aggregate phone-indexed records from public and commercial sources.
            </p>
            <p>
              The combination of all three identifier types — username, email, and phone — produces the most comprehensive results. Each identifier captures accounts that the others miss. A username scan finds public profiles. An email scan reveals registrations and breach exposure. A phone scan discovers messaging apps and data broker listings. FootprintIQ's multi-identifier scanning pipeline automates this combination in a single workflow.
            </p>
          </div>
        </section>

        {/* Digital Footprint Tools */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Digital Footprint Tools: Putting It All Together</h2>
            <p>
              Individual search techniques — username enumeration, email probing, breach correlation, social media analysis — each provide a partial view. Digital footprint tools aggregate and correlate findings from multiple techniques to produce a unified picture of someone's online presence.
            </p>
            <p>
              The evolution of these tools mirrors the broader OSINT landscape. Early tools like Sherlock performed a single function: check if a username exists on a list of platforms. Modern platforms like FootprintIQ orchestrate multiple tools in a structured pipeline that includes:
            </p>
            <ul>
              <li><strong>Multi-tool execution.</strong> Sherlock, Maigret, WhatsMyName, Holehe, and other engines run simultaneously against the input identifier.</li>
              <li><strong>Result deduplication.</strong> Findings from different tools targeting the same platform are merged into a single canonical result.</li>
              <li><strong>AI false-positive filtering.</strong> The LENS system analyses each result for signs of false positives — soft 404 responses, generic pages, reserved usernames — and assigns confidence scores.</li>
              <li><strong>Breach correlation.</strong> Username and email findings are cross-referenced against breach databases to identify security risks.</li>
              <li><strong>Risk scoring.</strong> The complete result set is analysed for patterns — password reuse indicators, data broker presence, profile consistency — producing an overall exposure score.</li>
              <li><strong>Remediation guidance.</strong> High-risk findings are accompanied by specific, actionable steps: change this password, delete this account, request removal from this data broker.</li>
            </ul>
            <p>
              This pipeline approach transforms raw OSINT data into actionable intelligence. Instead of sifting through hundreds of noisy results from individual tools, users receive a curated report with confidence ratings, severity classifications, and prioritised next steps.
            </p>
          </div>
        </section>

        {/* Protecting Yourself */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Protect Your Online Identity</h2>
            <p>
              The most effective defence against unwanted online discovery is proactive awareness. You can't control what others search for, but you can control what they find. Follow this framework to reduce your discoverability:
            </p>
            <ol>
              <li><strong>Audit your exposure.</strong> Run a comprehensive scan using <Link to="/free-scan" className="text-primary hover:underline">FootprintIQ's free scan</Link> to establish your baseline. Discover which accounts are publicly visible, where your data has been breached, and which data brokers list your information.</li>
              <li><strong>Diversify your identifiers.</strong> Stop reusing the same username across platforms. Use unique handles for different contexts — professional, personal, gaming, dating. This breaks the correlation chain that allows a single username search to map your entire digital life.</li>
              <li><strong>Delete abandoned accounts.</strong> Every forgotten registration is a potential vulnerability. Old forum accounts with reused passwords, inactive social media profiles with personal details — delete or deactivate anything you no longer use.</li>
              <li><strong>Harden active accounts.</strong> Enable two-factor authentication (preferably app-based, not SMS). Use unique, randomly generated passwords managed by a password manager. Review privacy settings and restrict public visibility.</li>
              <li><strong>Opt out of data brokers.</strong> Request removal from people-search sites that aggregate public records. Services like Spokeo, BeenVerified, and WhitePages all offer opt-out processes, though they require persistence.</li>
              <li><strong>Monitor continuously.</strong> Your digital footprint changes over time — new breaches expose old data, services change privacy defaults, data brokers re-list removed information. Regular scanning with the <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint checker</Link> catches new exposure before it becomes a problem.</li>
            </ol>
            <p>
              The goal isn't complete invisibility — that's impractical for most people. The goal is informed control: understanding exactly what's discoverable about you and making deliberate decisions about what to keep visible, what to remove, and what to protect.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/20">
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
