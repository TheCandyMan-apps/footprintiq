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
  Filter,
  FileText,
  HelpCircle,
  BookOpen,
  Scale,
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
    question: "How can I reduce my online exposure after a scan?",
    answer: "Start by deactivating or deleting accounts you no longer use. Change reused usernames to unique ones on each platform. Tighten privacy settings on active accounts. Remove personal information from public profiles. For a structured approach, run a full digital footprint scan at /scan and follow the prioritised remediation steps provided in your results."
  },
  {
    question: "What is a social media user search?",
    answer: "A social media user search lets you search user names across platforms like Instagram, TikTok, Twitter, Reddit, and Facebook to find linked accounts. Unlike manual searching, FootprintIQ checks 500+ platforms simultaneously with AI-powered confidence scoring, so you get accurate results without false positives. It's the fastest way to see where a username appears across social media."
  },
  {
    question: "What is the difference between a username search and a people search?",
    answer: "A people search uses real-world identifiers like names, phone numbers, or addresses to find someone. A username search uses an online handle — a screen name, alias, or nickname — to locate public profiles across platforms. Username search is more precise for digital investigations because handles are unique within each platform, whereas names are shared by millions of people."
  },
  {
    question: "Can a username search find deleted or deactivated accounts?",
    answer: "Generally, no. Username search tools check live, publicly accessible profile URLs. If an account has been fully deleted, the profile page will return a 404 error and won't appear in results. However, some platforms retain profile pages for deactivated (but not deleted) accounts, and cached references on third-party sites may still surface."
  },
  {
    question: "How accurate is an online username search?",
    answer: "Accuracy depends on username uniqueness and the quality of the tool's filtering. Common handles like 'alex' or 'gaming123' produce many false positives — matches belonging to different people. FootprintIQ uses AI-powered confidence scoring to filter these, achieving significantly higher accuracy than raw enumeration tools. Unique or unusual usernames typically produce the most reliable results."
  },
  {
    question: "Will the account owner know I searched their username?",
    answer: "No. FootprintIQ only queries publicly accessible profile URLs — the same pages anyone can visit by typing the URL into a browser. No notifications are sent to profile owners, no accounts are accessed, and no interactions are recorded on the target platforms."
  },
  {
    question: "How often should I search my own username?",
    answer: "We recommend running a username search at least once per quarter, or immediately after receiving a data breach notification. Your digital footprint changes over time — new accounts are created, old platforms change their privacy defaults, and data brokers continuously aggregate public information. Regular scanning catches new exposure before it becomes entrenched."
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

        {/* Long-form Content Section for SEO */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How to Search Username and Find Accounts Online</h2>
            
            <p>
              Looking to search username handles and <Link to="/find-social-media-accounts-by-username" className="text-primary underline underline-offset-4 hover:text-primary/80">find accounts by username</Link>? A username search tool — sometimes called a social media finder — scans 
              public profile pages across popular social media platforms, gaming networks, and online communities 
              to show you where a specific handle appears. You can check username availability, discover social media profiles 
              on Instagram and Facebook, gather information about online identities, or understand 
              username reuse patterns across dozens of platforms.
            </p>
            
            <p>
              Most people use the same username — or nickname — across multiple sites. This creates a traceable pattern 
              that anyone can follow using a search engine or specialised tool — a concept known as{" "}
              <Link to="/reverse-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">reverse username search</Link>. A username you created years ago on a gaming forum might still appear in search results 
              — even if you've forgotten about it entirely.
            </p>

            <h3>What Is a Username Search?</h3>
            
            <p>
              A username search is a lookup that checks whether a specific handle exists on various 
              websites. When you run a username scan, the tool visits public profile URLs like 
              <code>twitter.com/username</code> or <code>github.com/username</code> and checks if the 
              page exists. This is the same information anyone could find using a search engine manually, but automated to 
              save hours of work.
            </p>

            <p>
              Free social media username search tools like FootprintIQ check over 500 platforms 
              simultaneously. We search major social networks like Twitter, Instagram, LinkedIn, and TikTok. 
              We also check gaming platforms like Steam and Discord, developer sites like GitHub and 
              Stack Overflow, and hundreds of forums and niche communities. The search results show you exactly where a username appears with confidence scoring. For platform-specific analysis, try our{" "}
              <Link to="/instagram-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Instagram username search</Link> to check exposure on one of the most widely indexed social networks.
            </p>

            <h3>Find Someone by Username or Nickname</h3>
            
            <p>
              Whether you're looking to <Link to="/find-someone-by-username" className="text-primary underline underline-offset-4 hover:text-primary/80">find someone by username</Link> or search by nickname, 
              the process is the same. Enter the handle, and our social search tool queries public records and social media profiles 
              across 500+ platforms. Many people don't realise that their online nickname connects to dozens of accounts — 
              from <Link to="/find-dating-profiles" className="text-primary underline underline-offset-4 hover:text-primary/80">dating profiles</Link> to professional networks.
            </p>
            
            <p>
              For a structured approach to understanding your own exposure, try a{" "}
              <Link to="/audit-your-digital-footprint" className="text-primary underline underline-offset-4 hover:text-primary/80">digital footprint audit</Link> or{" "}
              <Link to="/check-my-digital-footprint" className="text-primary underline underline-offset-4 hover:text-primary/80">check your digital footprint</Link> to see everything that's publicly visible about you online.
            </p>

            <h3>Why Find People by Username?</h3>
            
            <p>
              There are several legitimate reasons to find people by username:
            </p>
            
            <ol>
              <li>
                <strong>Audit your own exposure.</strong> See where your usernames appear online. 
                Discover forgotten accounts that still contain your personal information.
              </li>
              <li>
                <strong>Verify online identities.</strong> Check if someone you're interacting with 
                has a consistent online presence across platforms.
              </li>
              <li>
                <strong>Research for security purposes.</strong> Understand how usernames can be 
                correlated to build a profile of someone's online activity.
              </li>
              <li>
                <strong>Claim your brand identity.</strong> Check if a username is available across 
                platforms before committing to it for business purposes.
              </li>
            </ol>

            <h3>Free vs. Paid Username Search Tools</h3>
            
            <p>
              Free username search tools provide basic lookup functionality. You enter a username, 
              and the tool tells you where it was found. This works well for simple queries and 
              personal audits.
            </p>
            
            <p>
              Paid tools add features like batch searching (checking multiple usernames at once), 
              historical data (seeing when accounts were created), and correlation analysis 
              (understanding how different usernames might belong to the same person). FootprintIQ 
              offers both free single searches and Pro features for deeper investigation.
            </p>

            <h3>Understanding False Positives</h3>
            
            <p>
              Not every match is meaningful. Common usernames like "alex" or "gaming123" exist on 
              nearly every platform—owned by completely different people. This creates false positives: 
              results that match your query but belong to someone else entirely.
            </p>
            
            <p>
              Quality username search tools filter these false positives using confidence scoring. 
              A high-confidence match on an unusual username is more significant than a low-confidence 
              match on a common one. Always verify results before drawing conclusions.
            </p>

            <h3>Ethical Username Search Practices</h3>
            
            <p>
              Ethical OSINT tools only access publicly available information. We don't bypass login 
              screens, guess passwords, or access private accounts. If a profile is set to private, 
              we can detect that the username exists but not see its contents—exactly like any 
              visitor to that platform.
            </p>
            
            <p>
              This matters because privacy is a right. Username search is a tool for understanding 
              public exposure, not for surveillance or stalking. We encourage users to search their 
              own usernames to understand their digital footprint, and to use results responsibly 
              when researching others.
            </p>
          </div>
        </section>

        {/* SEO Long-Form: What Is a Username Search? */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>What Is a Username Search?</h2>

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
              This is why username search has become a foundational technique in open-source intelligence
              (OSINT). Security researchers, privacy auditors, and everyday users rely on it to map online
              presence, identify forgotten accounts, and assess exposure risk. The technique is entirely
              passive — it queries publicly accessible profile URLs without interacting with accounts,
              bypassing authentication, or accessing private data.
            </p>

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
              standalone tools like Sherlock or Maigret used in isolation.
            </p>

            <h2>Why People Search Usernames Online</h2>

            <p>
              Username searching serves a range of legitimate purposes. Understanding <em>why</em> people
              run these scans helps clarify the value of the results — and the ethical boundaries that
              apply.
            </p>

            <h3>Checking Your Own Digital Footprint</h3>
            <p>
              The most common use case is self-assessment. You may have created accounts on platforms you
              no longer use — forums, social networks, dating sites, or gaming communities. These dormant
              accounts often retain personal information: profile photos, bios, location data, and post
              history. A username search reveals which of these accounts still exist publicly, giving you a
              clear starting point for cleanup. Running a quarterly scan is a recommended practice for
              anyone concerned about online privacy.
            </p>

            <h3>Investigating Suspicious Accounts</h3>
            <p>
              Parents, employers, and cybersecurity teams use username searches to investigate suspicious
              online activity. If a suspicious account contacts you, checking whether that username appears
              elsewhere can reveal whether it's a genuine person or a throwaway alias. Consistent presence
              across multiple platforms suggests authenticity; a username that exists only on one platform
              may warrant caution.
            </p>

            <h3>Verifying Online Identities</h3>
            <p>
              Before engaging with someone online — whether for business, dating, or collaboration — a
              reverse username search can help verify their identity. If the person claims to be a
              software developer, do they have matching GitHub and Stack Overflow profiles? If they claim
              to be a photographer, does their handle appear on Behance or 500px? Cross-platform consistency
              is a strong signal of authenticity.
            </p>

            <h3>Cybersecurity Research</h3>
            <p>
              Security professionals use username enumeration as part of threat surface analysis. During
              authorised penetration testing or risk assessments, mapping an organisation's employees'
              public usernames can reveal shadow IT accounts, credential reuse risks, and social
              engineering vectors. This is standard practice in ethical security auditing.
            </p>

            <h2>Find Social Media Profiles With a Username</h2>

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
              For targeted searches, FootprintIQ also offers platform-specific scanners. You can run an{" "}
              <Link to="/instagram-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Instagram username search</Link>,{" "}
              <Link to="/tiktok-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">TikTok username search</Link>, or{" "}
              <Link to="/reddit-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Reddit username search</Link>{" "}
              to focus on a specific network while still benefiting from cross-platform correlation data.
            </p>

            <h2>Protecting Your Digital Footprint</h2>

            <p>
              Understanding your exposure is only valuable if you act on it. Once a username search reveals
              where your handle appears, the next step is reducing unnecessary exposure. Here are
              practical, prioritised steps:
            </p>

            <ol>
              <li>
                <strong>Delete unused accounts.</strong> Dormant profiles are low-hanging fruit for data
                brokers and social engineers. If you haven't used a platform in over a year, consider
                deleting the account entirely. FootprintIQ provides direct links to account deletion
                pages where available.
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
                <strong>Monitor regularly.</strong> Digital footprints grow over time. Set a reminder to
                run a username scan quarterly, or after any data breach notification. Continuous monitoring
                catches new exposure before it becomes entrenched.
              </li>
            </ol>

            <p>
              For a comprehensive approach, combine a username search with an{" "}
              <Link to="/email-breach-check" className="text-primary underline underline-offset-4 hover:text-primary/80">email breach check</Link>{" "}
              and a full{" "}
              <Link to="/digital-footprint-scanner" className="text-primary underline underline-offset-4 hover:text-primary/80">digital footprint scan</Link>{" "}
              to cover all exposure vectors — not just social media profiles.
            </p>
          </div>
        </section>

        {/* Ethical OSINT Explanation */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
             <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Our Deep Username Search Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our free social media finder checks public profile pages across 500+ platforms 
                to find people by username. This deep username search uses ethical OSINT techniques — 
                only querying publicly accessible URLs that anyone can visit. Think of it as a social search 
                engine designed specifically for discovering social media profiles and user accounts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What we check */}
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

              {/* What we don't do */}
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

        {/* C) How It Works — Scan → Act → Verify → Measure */}
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

        {/* Why Username Reuse Matters */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 md:p-8 border-l-4 border-l-primary">
              <h2 className="text-2xl font-bold mb-4">Why Username Reuse Matters</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Usernames are often reused across platforms — creating a traceable pattern</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>This can link accounts together and reveal interests or identity patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Attackers and data brokers commonly use usernames as a starting point for investigations</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Differentiation Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Beyond Basic Username Search Tools</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free username search tools simply tell you "found" or "not found" — they don't explain 
                what that means for your online presence or digital exposure. FootprintIQ is the best username search tool because it goes beyond basic lookups: 
                we use open source intelligence methods to discover social media profiles, correlate search results across platforms, and provide actionable context.
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

        {/* Secondary CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Want the Full Picture?</h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Username search is just the beginning. A full <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint scan</Link> checks email breach exposure, 
                  data broker listings, public records, domain/WHOIS exposure, and more. You can also{" "}
                  <Link to="/best-people-lookup-sites" className="text-primary hover:underline">compare people lookup sites</Link> or learn{" "}
                  <Link to="/how-to-delete-facebook-account" className="text-primary hover:underline">how to delete your Facebook account</Link> and{" "}
                  <Link to="/how-to-delete-tiktok-account" className="text-primary hover:underline">how to delete your TikTok account</Link> to reduce exposure.
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

        {/* D) FAQ Section — new 5 Qs with FAQPage JSON-LD */}
        <section className="py-16 px-6 bg-muted/30">
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

        {/* Common Misconceptions */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <HelpCircle className="w-8 h-8 text-primary" />
                Common Misconceptions About Username Search
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Many assumptions about username lookup tools are wrong. Here's what people often misunderstand.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "If a username is found, it definitely belongs to the person I'm looking for"
                </h3>
                <p className="text-muted-foreground mb-3">
                  <strong className="text-foreground">Reality:</strong> Common usernames like "alex," "gaming," or "john123" 
                  exist on every platform — owned by different, unrelated people. A username match is a 
                  <em> hypothesis</em>, not a conclusion. Our{" "}
                  <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline">
                    technical guide
                  </Link>{" "}
                  explains why approximately 41% of automated matches are false positives.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "More results means a better tool"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> Volume isn't quality. A tool that returns 
                  200 matches with no filtering is less useful than one that returns 30 verified, contextualised 
                  results. Mass data without accuracy creates confusion, not clarity.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "Username search can find anyone's private information"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> Ethical username search only accesses 
                  publicly visible data — profile pages that anyone can visit without logging in. 
                  It cannot bypass privacy settings, access private accounts, or retrieve hidden information.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "If no results are found, the username doesn't exist anywhere"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> No tool checks every platform on the internet. 
                  Some sites actively block automated queries. A "not found" result means the username wasn't 
                  detected on the platforms checked — not that it doesn't exist elsewhere.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "Old accounts don't matter"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> Abandoned accounts often remain indexed 
                  and searchable. A dormant profile from 2015 can still appear in search results, 
                  potentially with outdated but still-public information. Understanding this temporal dimension 
                  is key to interpreting results correctly.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Accuracy & Ethics */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <Scale className="w-8 h-8 text-primary" />
                Accuracy & Ethics: Our Approach
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We believe ethical OSINT requires transparency about methods, honest acknowledgment of 
                limitations, and respect for privacy boundaries.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Our Accuracy Commitments
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Confidence scores on every result — not just "found/not found"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>False positive filtering to reduce noise from coincidental matches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Transparent source attribution — you know where data comes from</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Clear limitations — we tell you what we can't determine</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Our Ethical Principles
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Self-audit focus — designed for checking your own exposure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Public data only — no hacking, scraping, or unauthorised access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Data minimisation — we don't store or sell your search queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>No fear-based marketing — honest information, not alarm</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-6 border-l-4 border-l-primary bg-muted/30">
              <div className="flex items-start gap-4">
                <BookOpen className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Learn More About Ethical OSINT</h4>
                  <p className="text-muted-foreground mb-4">
                    We've published detailed resources explaining our methodology, the limitations 
                    of username search, and the principles that guide ethical open-source intelligence.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to="/ethical-osint" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                    >
                      What Is Ethical OSINT? <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link 
                      to="/guides/how-username-search-tools-work" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                    >
                      How Username Tools Work <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link 
                      to="/trust-safety" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                    >
                      Trust & Safety <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* How to Lookup a Username Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How to Search User Names Online</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-4">
                A social media user search is a common OSINT (open source intelligence) technique used to find user accounts and map online presence. Here's how to perform a deep user search across dozens of platforms:
              </p>
              <ol className="space-y-4 text-muted-foreground">
                <li><strong>Enter the username or nickname:</strong> Type the exact username you want to look up. Our social search tool checks social media platforms like Instagram, LinkedIn, and Facebook, plus gaming networks, forums, and professional sites.</li>
                <li><strong>Wait for search results:</strong> Our search engine queries 500+ platforms simultaneously to find where the username is registered.</li>
                <li><strong>Review findings:</strong> Each result includes the platform name, profile URL, and confidence level. This helps you find user profiles by username effectively.</li>
                <li><strong>Analyse your online presence:</strong> See which social media profiles are linked together through username reuse — a key part of understanding digital exposure.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* What a Deep Username Search Reveals */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What a Deep Username Search Reveals</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p className="text-muted-foreground">
                A comprehensive username lookup reveals more than just account existence. When you search for a username, you can discover:
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Social Media Profiles</h3>
                <p className="text-sm text-muted-foreground">Discover social media profiles across Twitter, Instagram, LinkedIn, TikTok, Reddit, and 100+ other social media platforms. Our social search covers the most popular networks.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Gaming Profiles</h3>
                <p className="text-sm text-muted-foreground">Discover accounts on Steam, Discord, Xbox, PlayStation, and gaming communities where username reuse is common.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Professional Presence</h3>
                <p className="text-sm text-muted-foreground">Locate professional profiles on LinkedIn, GitHub, Behance, and developer platforms. Find user accounts across professional networks.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Online Presence Patterns</h3>
                <p className="text-sm text-muted-foreground">Understand how social media profiles link together through shared usernames. See search results that reveal digital footprint exposure across dozens of platforms.</p>
              </Card>
            </div>
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

        {/* Related Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Learn More</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/username-search-tools" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Username Search Tools Explained
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compare Sherlock, Maigret, and other username lookup tools
                  </p>
                </Card>
              </Link>
              <Link to="/blog/free-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Free Username Search: What It Shows — and What It Misses
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understanding the limitations of username lookup tools
                  </p>
                </Card>
              </Link>
              <Link to="/blog/username-reuse" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Username Reuse: Why It's a Privacy Risk
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    How using the same username everywhere can expose you
                  </p>
                </Card>
              </Link>
              <Link to="/blog/what-is-digital-exposure" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    What Is Digital Exposure?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understanding your online footprint and risk surface
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
