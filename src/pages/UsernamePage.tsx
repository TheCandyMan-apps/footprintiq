import { Link } from "react-router-dom";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResponsibleUsePledge } from "@/components/ResponsibleUsePledge";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { DiscoveryToProofSection } from "@/components/DiscoveryToProofSection";
import { CategoryComparisonStrip } from "@/components/CategoryComparisonStrip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Shield,
  Eye,
  Zap,
  Target,
  ArrowRight,
  Globe,
  Gamepad2,
  Code,
  Briefcase,
  Users,
  Lock,
  Search,
  ScanLine,
  ShieldCheck,
  BarChart3,
  Activity
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How does a username search work?",
    answer: "A username search queries publicly accessible profile URLs across 500+ platforms — social media, gaming networks, forums, and developer sites. It checks whether a profile page exists at URLs like platform.com/username, then applies confidence scoring to filter false positives. Only publicly visible data is accessed; no logins, hacking, or private data retrieval is involved."
  },
  {
    question: "What is a reverse username search?",
    answer: "A reverse username search starts with a known handle and maps every platform where that handle appears. This reveals cross-platform exposure, forgotten accounts, and username reuse patterns. It's the opposite of searching for a person by name — instead, you search by the unique identifier they use online."
  },
  {
    question: "Can I find all accounts linked to a username?",
    answer: "You can find accounts on the 500+ platforms FootprintIQ checks. However, no tool covers every website on the internet. Some platforms block automated queries, and private or deactivated accounts won't appear. Results should be treated as a strong indicator, not an exhaustive list."
  },
  {
    question: "Is username searching legal?",
    answer: "Yes. Searching publicly accessible profile pages is legal in most jurisdictions. FootprintIQ only queries URLs that anyone can visit without authentication. We don't bypass logins, scrape behind paywalls, or access private data. This is ethical OSINT — open-source intelligence from publicly available sources. Always use results responsibly and in compliance with local laws."
  },
  {
    question: "Will the account owner know I searched their username?",
    answer: "No. FootprintIQ only queries publicly accessible profile URLs — the same pages anyone can visit by typing the URL into a browser. No notifications are sent to profile owners, no accounts are accessed, and no interactions are recorded on the target platforms."
  },
  {
    question: "How accurate is an online username search?",
    answer: "Accuracy depends on username uniqueness and the quality of the tool's filtering. Common handles like 'alex' or 'gaming123' produce many false positives — matches belonging to different people. FootprintIQ uses AI-powered confidence scoring to filter these, achieving significantly higher accuracy than raw enumeration tools. Unique or unusual usernames typically produce the most reliable results."
  },
  {
    question: "How often should I search my own username?",
    answer: "We recommend running a username search at least once per quarter, or immediately after receiving a data breach notification. Your digital footprint changes over time — new accounts are created, old platforms change their privacy defaults, and data brokers continuously aggregate public information. Regular scanning catches new exposure before it becomes entrenched."
  },
  {
    question: "Can you find social media accounts by username?",
    answer: "Yes. FootprintIQ checks over 500 platforms — including Instagram, TikTok, Twitter/X, Reddit, LinkedIn, Snapchat, YouTube, and hundreds more — for matching profiles when you search a username. Results are categorised by platform type (social, gaming, professional, developer, forum) and scored for confidence to help you distinguish genuine matches from coincidental ones."
  }
];

const popularSearches = [
  {
    title: "Reverse Username Search",
    description: "Map a single handle across every platform it appears on.",
    href: "/reverse-username-search",
  },
  {
    title: "Instagram Username Search",
    description: "Check username exposure on Instagram's public profiles.",
    href: "/instagram-username-search",
  },
  {
    title: "TikTok Username Search",
    description: "Find where a TikTok handle appears across 500+ sites.",
    href: "/tiktok-username-search",
  },
  {
    title: "Twitter / X Username Search",
    description: "Trace a Twitter handle across social and forum platforms.",
    href: "/twitter-username-search",
  },
  {
    title: "Discord Username Search",
    description: "Discover Discord usernames linked across gaming and social sites.",
    href: "/discord-username-search",
  },
  {
    title: "Reddit Username Search",
    description: "Check where a Reddit handle surfaces on other platforms.",
    href: "/reddit-username-search",
  },
  {
    title: "Kik Username Search",
    description: "Search Kik usernames across messaging and social networks.",
    href: "/kik-username-search",
  },
  {
    title: "Snapchat Username Search",
    description: "Find Snapchat handles and cross-platform username reuse.",
    href: "/snapchat-username-search",
  },
];

const howItWorksSteps = [
  {
    icon: ScanLine,
    label: "Scan",
    title: "Run Your Scan",
    description: "Enter a username and we query 500+ public platforms in seconds.",
  },
  {
    icon: Activity,
    label: "Act",
    title: "Review Findings",
    description: "See where the handle appears with confidence scores and risk context.",
  },
  {
    icon: ShieldCheck,
    label: "Verify",
    title: "Validate Results",
    description: "Cross-reference matches and filter false positives for accuracy.",
  },
  {
    icon: BarChart3,
    label: "Measure",
    title: "Reduce Exposure",
    description: "Follow prioritised steps to delete, lock, or update exposed accounts.",
  },
];

const platformCategories = [
  { icon: Globe, label: "Social Media Platforms", description: "Discover social media profiles on Twitter, Instagram, LinkedIn, TikTok, Reddit, and more" },
  { icon: Gamepad2, label: "Gaming Networks", description: "Steam, Discord, Xbox, PlayStation gaming profiles" },
  { icon: Code, label: "Developer Platforms", description: "GitHub, GitLab, Stack Overflow developer accounts" },
  { icon: Briefcase, label: "Professional Networks", description: "LinkedIn, Behance, Dribbble professional profiles" },
  { icon: Users, label: "Forums & Communities", description: "Dozens of platforms and 500+ forums to map your complete online presence" }
];

const differentiators = [
  { icon: Target, title: "Correlation Analysis", description: "We identify patterns across platforms to help you understand the full picture" },
  { icon: Shield, title: "Risk Context", description: "Understand which findings matter for privacy and security exposure" },
  { icon: Zap, title: "False Positive Filtering", description: "Reduce noise from coincidental matches and inactive accounts" },
  { icon: Eye, title: "Actionable Intelligence", description: "Know what to do with the results — not just raw data" }
];

export default function UsernamePage() {

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqItems.map(item => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer
      }
    }))
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FootprintIQ Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      ratingCount: "587",
      bestRating: "5",
    },
    description: "Free social media user search tool. Search user names across 500+ platforms, find accounts by username, and discover social profiles. The best user search engine for digital exposure.",
  };

  return (
    <>
      <SEO
        title="Username Search – Free Social Media Finder Across 500+ Sites | FootprintIQ"
        description="Free username search across 500+ platforms. Find social media profiles by username, search user names, lookup accounts by nickname, and discover your digital exposure."
        canonical="https://footprintiq.app/usernames"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Username Search", item: "https://footprintiq.app/usernames" }
            ]
          },
          faq: faqSchema,
          custom: webAppSchema
        }}
      />
      <JsonLd data={faqSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Intent Alignment */}
        <IntentAlignmentBanner />

        {/* A) Hero Section — primary input + trust line */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              100% Free • Public Data Only • No Login Required
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Username Search &amp; Social Media Finder
              <span className="block text-2xl md:text-3xl font-semibold text-muted-foreground mt-2">Find Usernames, Lookup Accounts &amp; Search User Names Across 500+ Platforms</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Search user names across 500+ platforms to find accounts — including 
              Instagram, LinkedIn, Facebook, TikTok, Twitter, and gaming networks. The best free social media 
              finder and user search engine for checking usernames, discovering social media profiles, 
              and finding people by username or nickname across dozens of platforms.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Run a Free Username Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/trust-safety">
                  See Trust & Safety
                  <Shield className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Ethical OSINT for self-protection. No private access. No data resale.
            </p>

            <EthicalOsintTrustBlock />
          </div>
        </section>

        {/* B) Popular Searches Hub */}
        <section className="py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Popular Username Searches</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Jump straight to a platform-specific search or explore your exposure across multiple networks.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularSearches.map((item) => (
                <Card key={item.href} className="p-5 flex flex-col justify-between">
                  <div>
                    <Link to={item.href} className="hover:underline">
                      <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  </div>
                  <Button size="sm" asChild className="w-full">
                    <Link to="/scan">
                      Scan this platform
                      <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Category comparison */}
        <CategoryComparisonStrip />

        {/* ============================================================
            SEO LONG-FORM CONTENT — ~2000 words, structured H2s
            ============================================================ */}

        {/* H2: What Is a Username Search */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>What Is a Username Search</h2>

            <p>
              A username search is the process of querying a specific handle — such as a screen name, alias,
              or nickname — across multiple public websites to identify where that identifier appears online.
              Unlike a traditional people search that relies on names, addresses, or phone numbers, a username
              search exploits a behavioural pattern that most internet users share: <strong>username reuse</strong>.
            </p>

            <p>
              Research consistently shows that the majority of internet users recycle the same username across
              multiple platforms. A handle created for a gaming forum in 2012 might still be active on
              Reddit, Instagram, GitHub, and a dozen other sites today. Each reuse extends that person's
              digital footprint — often without their awareness. A single username can connect a professional
              LinkedIn profile to a pseudonymous forum account, revealing interests, locations, and activity
              patterns that were never intended to be linked.
            </p>

            <p>
              This is why username search — sometimes called a <Link to="/reverse-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">reverse username lookup</Link> — has become
              a foundational technique in open-source intelligence (OSINT). Security researchers, privacy
              auditors, and everyday users rely on it to map online presence, identify forgotten accounts, and
              assess exposure risk. The technique is entirely passive: it queries publicly accessible profile
              URLs without interacting with accounts, bypassing authentication, or accessing private data.
            </p>

            <p>
              Username reuse is especially common across social media platforms where handles serve as both
              identifiers and vanity URLs. When the same handle appears on Instagram, TikTok, Twitter, and
              Snapchat, it creates a discoverable chain. Data brokers, advertisers, and social engineers
              exploit this chain routinely. A username search tool like FootprintIQ lets you see the same
              chain — but for defensive purposes: self-audit, exposure assessment, and account cleanup.
            </p>
          </div>
        </section>

        {/* H2: How Username Lookup Tools Work */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How Username Lookup Tools Work</h2>

            <p>
              Username lookup tools operate on a straightforward principle: they construct predictable
              profile URLs for hundreds of platforms and check whether a valid page exists at each address.
              For example, if you search the username <code>john_doe</code>, the tool checks URLs like
              <code>twitter.com/john_doe</code>, <code>github.com/john_doe</code>, and
              <code>instagram.com/john_doe</code> — plus hundreds more.
            </p>

            <p>
              The technical process involves several layers:
            </p>

            <ol>
              <li>
                <strong>URL enumeration.</strong> The tool maintains a database of URL patterns for 500+
                platforms. Each platform has a known profile URL structure that accepts a username as a
                parameter.
              </li>
              <li>
                <strong>HTTP response analysis.</strong> For each constructed URL, the tool sends a request
                and analyses the response. A <code>200 OK</code> status typically indicates an existing
                profile, while a <code>404 Not Found</code> suggests the username isn't registered.
                However, many platforms return custom error pages with 200 status codes, requiring deeper
                page-content analysis.
              </li>
              <li>
                <strong>False positive filtering.</strong> Raw results are processed through confidence
                scoring algorithms. Common usernames generate matches on nearly every platform — but most
                belong to different people. AI-powered filtering cross-references profile metadata,
                creation patterns, and contextual signals to separate genuine matches from coincidental ones.
              </li>
              <li>
                <strong>Result enrichment.</strong> Verified matches are enriched with platform category
                (social media, gaming, professional), risk context, and remediation guidance — transforming
                raw data into actionable intelligence.
              </li>
            </ol>

            <p>
              FootprintIQ builds on this foundation with multi-tool correlation. Rather than relying on a
              single scanning engine, we aggregate results from multiple OSINT providers and apply a
              unified confidence model. This reduces both false positives and false negatives compared to
              standalone tools like Sherlock or Maigret used in isolation. For a deeper technical explanation,
              read our{" "}
              <Link to="/guides/how-username-search-tools-work" className="text-primary underline underline-offset-4 hover:text-primary/80">guide to how username search tools work</Link>.
            </p>
          </div>
        </section>

        {/* H2: How Investigators Track Online Identities */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How Investigators Track Online Identities</h2>

            <p>
              In open-source intelligence (OSINT) investigations, a username is often the first — and most
              productive — lead. Professional investigators, cybersecurity analysts, and fraud teams use
              username enumeration as a starting point to map a subject's digital presence across the open web.
            </p>

            <p>
              The investigation typically follows a structured workflow. First, the investigator identifies one
              or more known usernames from an initial data point — a social media profile, a forum post, or a
              breach notification. Next, they run those handles through a{" "}
              <Link to="/username-search-engine" className="text-primary underline underline-offset-4 hover:text-primary/80">username search engine</Link>{" "}
              that checks hundreds of platforms simultaneously. The results reveal which sites host matching
              profiles.
            </p>

            <p>
              From there, investigators cross-reference findings. If the same handle appears on GitHub with a
              real name and on Reddit with pseudonymous posts, the two accounts can be correlated. Profile
              metadata — creation dates, bio text, profile photos, linked websites — provides additional
              correlation signals. This process, known as <strong>identity resolution</strong>, builds a
              composite view of someone's online activity from fragmented public sources.
            </p>

            <p>
              Importantly, legitimate OSINT investigations operate within strict legal and ethical boundaries.
              They access only publicly available information — pages that anyone can view without logging in.
              No hacking, no password guessing, no bypassing privacy settings. FootprintIQ is built on these
              principles: ethical, passive, and transparent. Every result shows its source, confidence level,
              and limitations.
            </p>

            <p>
              For individuals, this means that if an investigator, employer, or data broker can find your
              profiles using a username search, so can anyone else. Understanding how this process works is
              the first step toward controlling your own digital exposure.
            </p>
          </div>
        </section>

        {/* H2: Find Social Media Accounts Using a Username */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Find Social Media Accounts Using a Username</h2>

            <p>
              Social media platforms are where username reuse creates the most visible exposure. A single
              handle can link profiles across Instagram, TikTok, Twitter/X, Reddit, LinkedIn, Facebook,
              Snapchat, Pinterest, and dozens of niche networks. FootprintIQ's username finder checks all
              of these simultaneously — returning results in seconds rather than the hours it would take
              to search each platform manually.
            </p>

            <p>
              The tool identifies not just whether an account exists, but categorises each finding by
              platform type: social media, gaming, professional, developer, forum, or messaging. This
              categorisation helps you understand the <em>shape</em> of a digital footprint — is the
              exposure concentrated on social networks, spread across gaming communities, or bridging
              professional and personal platforms?
            </p>

            <p>
              For targeted searches, FootprintIQ offers platform-specific scanners. You can run an{" "}
              <Link to="/instagram-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Instagram username search</Link>,{" "}
              <Link to="/tiktok-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">TikTok username search</Link>, or{" "}
              <Link to="/reddit-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Reddit username search</Link>{" "}
              to focus on a specific network while still benefiting from cross-platform correlation data.
            </p>

            <p>
              Common use cases for finding social media accounts by username include self-auditing your own
              exposure, verifying whether someone you're communicating with has a consistent online presence,
              and checking whether a brand handle is available across platforms before launching a business.
              Parents also use username search to understand where a child's handle appears publicly —
              without needing to access private messages or content.
            </p>

            <p>
              For a comprehensive approach, combine a username search with an{" "}
              <Link to="/email-breach-check" className="text-primary underline underline-offset-4 hover:text-primary/80">email breach check</Link>{" "}
              and a full{" "}
              <Link to="/digital-footprint-checker" className="text-primary underline underline-offset-4 hover:text-primary/80">digital footprint checker</Link>{" "}
              to cover all exposure vectors — not just social media profiles.
            </p>
          </div>
        </section>

        {/* H2: Why Username Reuse Is a Privacy Risk */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Why Username Reuse Is a Privacy Risk</h2>

            <p>
              Using the same username across multiple platforms creates a traceable digital chain. Each account
              you register with the same handle adds another link — and each link makes the entire chain
              easier to discover. This is the fundamental privacy risk of username reuse.
            </p>

            <p>
              Consider this scenario: you use the handle <code>alex_photo</code> on Instagram (with your real
              name and location), on Reddit (where you post anonymously about personal topics), and on GitHub
              (where your employer's email appears in commit history). Individually, each account reveals
              limited information. But linked together via a single username search, they create a composite
              profile that exposes your real identity, location, interests, employer, and private opinions —
              none of which you intended to make public as a package.
            </p>

            <p>
              Data brokers actively exploit this pattern. They scrape public profiles, correlate usernames, and
              sell aggregated identity profiles to advertisers, background-check companies, and anyone willing
              to pay. According to FootprintIQ's{" "}
              <Link to="/research/username-reuse-report-2026" className="text-primary underline underline-offset-4 hover:text-primary/80">2026 Username Reuse Report</Link>,
              the average person has 7–12 publicly discoverable accounts linked by a shared username. For
              users who have been online since the early 2010s, that number rises to 15 or more.
            </p>

            <p>
              The security implications extend beyond privacy. Users who reuse usernames are statistically
              more likely to reuse passwords as well. A credential stuffing attack that compromises one
              account can cascade across every platform where the same handle — and likely the same or a
              similar password — is registered. Breaking the username chain is one of the simplest and most
              effective steps you can take to improve your digital security.
            </p>
          </div>
        </section>

        {/* H2: Platforms Where Usernames Can Be Found */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Platforms Where Usernames Can Be Found</h2>

            <p>
              FootprintIQ scans 500+ platforms, but certain categories consistently produce the most
              findings. Here are the platforms where username reuse is most commonly detected:
            </p>

            <ul>
              <li>
                <strong><Link to="/instagram-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Instagram</Link></strong> — Public profiles
                at <code>instagram.com/username</code> are indexed by search engines and widely scraped.
                One of the highest-exposure platforms for username reuse.
              </li>
              <li>
                <strong><Link to="/reddit-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Reddit</Link></strong> — User profiles
                at <code>reddit.com/user/username</code> expose post history, comments, and community
                memberships. Reddit profiles are fully public by default.
              </li>
              <li>
                <strong><Link to="/tiktok-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">TikTok</Link></strong> — TikTok profiles
                are publicly accessible and heavily indexed. Username reuse between TikTok and Instagram
                is extremely common among younger users.
              </li>
              <li>
                <strong><Link to="/discord-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Discord</Link></strong> — While Discord
                servers are often private, usernames appear in public server directories, bot listings,
                and third-party tracking sites.
              </li>
              <li>
                <strong><Link to="/search-telegram-username" className="text-primary underline underline-offset-4 hover:text-primary/80">Telegram</Link></strong> — Public
                channels and groups expose usernames. Telegram handles are frequently reused from other
                messaging and social platforms.
              </li>
              <li>
                <strong><Link to="/search-github-username" className="text-primary underline underline-offset-4 hover:text-primary/80">GitHub</Link></strong> — Developer
                profiles at <code>github.com/username</code> often contain real names, email addresses
                in commit history, and links to personal websites.
              </li>
              <li>
                <strong><Link to="/snapchat-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Snapchat</Link></strong> — Snapchat
                usernames are frequently shared publicly on other platforms, creating cross-platform
                linkage even though Snapchat content is ephemeral.
              </li>
              <li>
                <strong><Link to="/search-youtube-username" className="text-primary underline underline-offset-4 hover:text-primary/80">YouTube</Link></strong> — YouTube
                channel handles at <code>youtube.com/@username</code> are fully public and indexed.
                Comment history and subscriptions may also be visible.
              </li>
            </ul>

            <p>
              Beyond these major platforms, FootprintIQ also checks gaming networks (Steam, Twitch, Roblox),
              professional sites (LinkedIn, Behance, Dribbble), developer communities (Stack Overflow, GitLab),
              forums (Quora, Medium, Hacker News), and hundreds of niche communities. The broader the scan,
              the more complete the picture of your digital footprint.
            </p>

            <p>
              Each platform category carries different risks. Social media profiles expose personal photos and
              real names. Developer platforms may leak work email addresses through commit history. Gaming
              networks reveal activity patterns and friend connections. Forum posts — often written
              pseudonymously — may contain candid personal information that users wouldn't share on a
              profile page. A comprehensive username finder like FootprintIQ checks all of these categories
              in a single scan, giving you a complete view of where your handle appears and what information
              each platform exposes.
            </p>
          </div>
        </section>

        {/* H2: How To Protect Your Online Identity */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How To Protect Your Online Identity</h2>

            <p>
              Understanding your exposure is only valuable if you act on it. Once a username search reveals
              where your handle appears, follow these prioritised steps to reduce your digital footprint:
            </p>

            <ol>
              <li>
                <strong>Delete unused accounts.</strong> Dormant profiles are low-hanging fruit for data
                brokers and social engineers. If you haven't used a platform in over a year, delete the
                account entirely. FootprintIQ provides direct links to account deletion pages where
                available.
              </li>
              <li>
                <strong>Break the username chain.</strong> Stop reusing the same handle everywhere. Use
                unique usernames for platforms where privacy matters — especially those that expose your
                real name, location, or interests. A password manager can help you track different
                usernames across services.
              </li>
              <li>
                <strong>Tighten privacy settings.</strong> On platforms you actively use, review privacy
                settings to limit what's publicly visible. Set profiles to private where possible. Remove
                personal details like phone numbers, birthdates, and locations from public bios.
              </li>
              <li>
                <strong>Opt out of data brokers.</strong> Data aggregators scrape public profiles and
                compile them into searchable databases. After reducing your social media exposure, submit
                opt-out requests to major data brokers to prevent re-aggregation.
              </li>
              <li>
                <strong>Monitor regularly.</strong> Digital footprints grow over time. Run a username scan
                quarterly, or immediately after any data breach notification. Regular monitoring catches
                new exposure before it becomes entrenched.
              </li>
            </ol>

            <p>
              For a structured approach, use FootprintIQ's{" "}
              <Link to="/digital-footprint-checker" className="text-primary underline underline-offset-4 hover:text-primary/80">digital footprint checker</Link>{" "}
              for a complete exposure assessment, or{" "}
              <Link to="/check-my-digital-footprint" className="text-primary underline underline-offset-4 hover:text-primary/80">check your digital footprint</Link>{" "}
              to see everything that's publicly visible about you online. Combine username search with an{" "}
              <Link to="/email-breach-check" className="text-primary underline underline-offset-4 hover:text-primary/80">email breach check</Link>{" "}
              to cover all exposure vectors.
            </p>
          </div>
        </section>

        {/* How It Works — Scan → Act → Verify → Measure */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Four steps from first scan to measurable exposure reduction.
              </p>
            </div>

            {/* Progress bar */}
            <div className="relative mb-10">
              <div className="absolute top-5 left-0 right-0 h-1 bg-secondary/50 rounded-full" />
              <div className="absolute top-5 left-0 h-1 bg-primary rounded-full" style={{ width: '100%' }} />
              <div className="relative flex justify-between">
                {howItWorksSteps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center" style={{ width: '22%' }}>
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm mb-3 relative z-10 shadow-md">
                      {idx + 1}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{step.label}</span>
                    <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed cards */}
            <div className="grid sm:grid-cols-2 gap-5">
              {howItWorksSteps.map((step, idx) => (
                <Card key={idx} className="p-5 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Start Your Scan Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Ethical OSINT - What We Check / Don't Do */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Our Deep Username Search Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our free social media finder checks public profile pages across 500+ platforms 
                to find people by username. This deep username search uses ethical OSINT techniques — 
                only querying publicly accessible URLs that anyone can visit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  What We Check
                </h3>
                <ul className="space-y-3">
                  {platformCategories.map((cat, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <cat.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">{cat.label}</span>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  What We Don't Do
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Access private or locked accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Scrape behind logins or paywalls</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Use hacking or unauthorised techniques</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Store or sell your search queries</span>
                  </li>
                </ul>
                <p className="mt-6 text-sm border-t pt-4">
                  This is <strong>ethical OSINT</strong> — open-source intelligence gathered only from publicly accessible sources.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Differentiation Section */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Beyond Basic Username Search Tools</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free username search tools simply tell you "found" or "not found." FootprintIQ goes further
                with correlation analysis, confidence scoring, and actionable remediation guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {differentiators.map((item, idx) => (
                <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Want the Full Picture?</h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Username search is just the beginning. A full <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint scan</Link> checks email breach exposure, 
                  data broker listings, public records, domain/WHOIS exposure, and more.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Email breaches</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Data broker listings</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Public records</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Domain/WHOIS</span>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link to="/scan">
                      Run a Full Digital Footprint Scan
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/trust-safety">
                      Our Trust & Safety Commitment
                      <Shield className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions about username search, reverse username lookup, and reducing digital exposure.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <p className="text-sm text-muted-foreground mt-6 text-center">
              For a deeper dive into how these tools work, read our{" "}
              <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline font-medium">
                technical guide to username search tools
              </Link>.
            </p>
          </div>
        </section>

        {/* Discovery to Proof */}
        <DiscoveryToProofSection />

        {/* Related Tools Section */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Explore More OSINT Tools</h2>
            <p className="text-center text-muted-foreground mb-8">
              Username search is just one piece of the puzzle. Check your complete digital footprint.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/email-breach-check" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Email Breach Check
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check if your email appears in public data breaches and exposure sources
                  </p>
                </Card>
              </Link>
              <Link to="/digital-footprint-scanner" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Digital Footprint Scanner
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Combine username, email, phone, and name searches for complete exposure analysis
                  </p>
                </Card>
              </Link>
              <Link to="/username-search-tools" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Username OSINT Tools Explained
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compare Sherlock, Maigret, and other open source intelligence tools
                  </p>
                </Card>
              </Link>
              <Link to="/blog/what-is-osint-risk" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    What is OSINT Risk?
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how open source intelligence exposes your digital footprint
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <ResponsibleUsePledge />
      <Footer />
    </>
  );
}
