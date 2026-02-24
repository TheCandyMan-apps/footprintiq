import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { BlurredRiskGauge } from "@/components/results/BlurredRiskGauge";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Shield,
  Eye,
  UserCheck,
  Globe,
  Database,
  ArrowRight,
  CheckCircle,
  XCircle,
  Lock,
  Link2,
  Phone,
  Network,
  ChevronRight,
  BookOpen,
  AlertTriangle,
} from "lucide-react";

/* ────────────── FAQ data ────────────── */
const faqs = [
  {
    q: "What does a digital footprint scan actually check?",
    a: "A digital footprint scan queries publicly accessible data sources — including social media platforms, forums, data broker databases, breach records, and people-search engines — to identify accounts, profiles, and personal information linked to a given username, email, or phone number. FootprintIQ correlates these signals across 500+ sources to build a unified exposure map.",
  },
  {
    q: "Is it free to check my digital footprint?",
    a: "Yes. FootprintIQ provides a free exposure scan that shows platform matches and signal counts. Pro plans unlock deeper analysis including identity correlation graphs, breach-specific context, risk scoring, and guided remediation steps.",
  },
  {
    q: "Will anyone know I scanned my digital footprint?",
    a: "No. FootprintIQ queries only publicly accessible data using ethical OSINT techniques. No accounts are accessed, no login credentials are required, and no notifications are sent to any platform or individual during a scan.",
  },
  {
    q: "How accurate are digital footprint scan results?",
    a: "Each finding includes a confidence score based on signal strength, profile metadata, and cross-source verification. High-confidence results have been validated against multiple independent sources. We always recommend manual review before acting on any match.",
  },
  {
    q: "Does FootprintIQ remove my data from the internet?",
    a: "FootprintIQ does not directly delete data from third-party platforms. Instead, it provides a structured remediation roadmap with official opt-out links, removal request templates, and prioritised guidance so you can efficiently reduce your exposure.",
  },
  {
    q: "How is this different from Have I Been Pwned?",
    a: "Have I Been Pwned checks whether your email appeared in known data breaches. FootprintIQ goes further — scanning usernames across 500+ platforms, mapping identity correlation patterns, identifying data broker listings, and producing a comprehensive exposure report with actionable remediation steps.",
  },
  {
    q: "Can I scan someone else's digital footprint?",
    a: "FootprintIQ is designed for self-audit, authorised corporate investigations, and risk assessments. Scanning another person's publicly visible information is permitted only where you have legitimate authorisation. Unauthorised surveillance or harassment violates our terms of service.",
  },
  {
    q: "How often should I check my digital footprint?",
    a: "We recommend scanning at least quarterly, or immediately after a known data breach. Pro users benefit from continuous monitoring that alerts them when new exposure is detected, so threats can be addressed before they escalate.",
  },
];

/* ────────────── Free vs Pro comparison ────────────── */
const comparisonRows = [
  { feature: "Username scan across 500+ platforms", free: true, pro: true },
  { feature: "Signal count & platform matches", free: true, pro: true },
  { feature: "Confidence scoring per finding", free: false, pro: true },
  { feature: "Identity correlation graph", free: false, pro: true },
  { feature: "Breach exposure context", free: false, pro: true },
  { feature: "Risk score & severity rating", free: false, pro: true },
  { feature: "Data broker listing detection", free: false, pro: true },
  { feature: "Remediation roadmap & opt-out links", free: false, pro: true },
  { feature: "Continuous monitoring & alerts", free: false, pro: true },
  { feature: "PDF export & case management", free: false, pro: true },
];

/* ────────────── HowTo steps (for reduction section & schema) ────────────── */
const reductionSteps = [
  {
    name: "Audit your existing accounts",
    text: "Run a FootprintIQ scan to identify every public account, profile, and data broker listing connected to your identity. Start with your most-used username and email address.",
  },
  {
    name: "Delete or deactivate unused accounts",
    text: "Prioritise removing accounts you no longer use. Dormant profiles are often the first targets in credential-stuffing attacks because they retain old, potentially compromised passwords.",
  },
  {
    name: "Opt out of data broker sites",
    text: "Submit removal requests to major data brokers like Spokeo, BeenVerified, and MyLife. FootprintIQ Pro provides direct opt-out links and tracks removal progress over time.",
  },
  {
    name: "Use unique usernames per platform",
    text: "Stop reusing the same username everywhere. When multiple platforms share an identical username, attackers can correlate your identity across services in minutes.",
  },
  {
    name: "Enable two-factor authentication",
    text: "Activate 2FA on all critical accounts — especially email, banking, and social media. This adds a second verification layer even if passwords are compromised through breaches.",
  },
  {
    name: "Review privacy settings on active accounts",
    text: "Tighten visibility settings on platforms you continue to use. Restrict who can see your posts, contact information, friend lists, and activity history.",
  },
  {
    name: "Set up continuous monitoring",
    text: "Schedule regular scans or enable FootprintIQ Pro's continuous monitoring to catch new exposure as it appears — before it can be exploited.",
  },
];

const PAGE_URL = "https://footprintiq.app/check-my-digital-footprint";

const CheckMyDigitalFootprint = () => {
  /* ── JSON-LD Schemas ── */
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Check My Digital Footprint: Free Exposure Scan 2026 Guide",
    description:
      "Learn how to check your digital footprint with a free exposure scan. Discover what personal data is publicly visible, how hackers exploit it, and how to reduce your risk.",
    author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    datePublished: "2026-02-13",
    dateModified: "2026-02-24",
    mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
    inLanguage: "en",
    wordCount: 2000,
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
      { "@type": "ListItem", position: 2, name: "Resources", item: "https://footprintiq.app/resources" },
      { "@type": "ListItem", position: 3, name: "Check My Digital Footprint", item: PAGE_URL },
    ],
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Reduce Your Digital Footprint",
    description:
      "A step-by-step guide to reducing your online exposure by auditing accounts, removing data broker listings, and enabling continuous monitoring.",
    totalTime: "PT2H",
    step: reductionSteps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Check My Digital Footprint (Free Exposure Scan 2026 Guide)</title>
        <meta
          name="description"
          content="Check your digital footprint with a free exposure scan. See what personal data is publicly visible, understand how identity correlation works, and learn how to reduce your online risk."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Check My Digital Footprint (Free Exposure Scan 2026 Guide)" />
        <meta
          property="og:description"
          content="Check your digital footprint with a free exposure scan. See what personal data is publicly visible, understand how identity correlation works, and learn how to reduce your online risk."
        />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={howToLd} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-3xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/resources" className="hover:text-foreground transition-colors">Resources</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Check My Digital Footprint</li>
          </ol>
        </nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <header className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Exposure Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Check My Digital Footprint: See What's Publicly Visible About You
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Your online activity leaves traces across hundreds of platforms. A digital footprint scan reveals exactly what personal data is publicly accessible — so you can take control of your exposure before someone else exploits it. This guide explains what a digital footprint is, how attackers use public information, and how to reduce your risk with a structured, ethical approach.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Run Your Free Scan Now
              </Link>
            </Button>
          </div>
        </header>

        {/* ═══════════════ SECTION 1: What Is a Digital Footprint? ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Is a Digital Footprint?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A digital footprint is the cumulative trail of data you leave behind when using the internet. It includes every social media profile, forum account, blog comment, app registration, and data broker listing connected to your identity. Some traces are intentional — profiles you created. Others are passive — records collected and published about you without your direct involvement.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Active vs. Passive Digital Footprints</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Active footprints</strong> are data you deliberately share: social media posts, account registrations, and public comments. <strong>Passive footprints</strong> are collected without your explicit action: data broker aggregation, website tracking cookies, leaked credentials from breaches, and metadata embedded in files you share online.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The average internet user has accounts on 100+ platforms, many of which are long forgotten. These dormant accounts remain publicly discoverable and often contain outdated personal information — making them low-hanging fruit for identity profiling and correlation attacks.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Why Should You Care About Your Digital Footprint?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Every piece of publicly visible information — a username, an old forum post, an email address in a breach database — contributes to a profile that can be assembled by employers, advertisers, scammers, or malicious actors. Understanding what's out there is the essential first step toward controlling it. FootprintIQ helps you map this exposure quickly, ethically, and comprehensively.
            </p>
          </div>
        </section>

        {/* ═══════════════ SECTION 2: How Can I See What's Online About Me? ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Can I See What's Online About Me?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Manually searching for yourself across hundreds of platforms is time-consuming and unreliable. An automated digital footprint scan queries 500+ public sources simultaneously — including social networks, developer platforms, gaming communities, data brokers, and breach databases — to produce a comprehensive exposure report in minutes rather than hours.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Does a Digital Footprint Scan Check?</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: UserCheck, text: "Username matches across 500+ platforms" },
                { icon: Globe, text: "Public social media profiles & bios" },
                { icon: Database, text: "Data broker & people-search listings" },
                { icon: Eye, text: "Breach exposure indicators" },
                { icon: Link2, text: "Cross-platform identity correlation patterns" },
                { icon: Phone, text: "Phone number exposure on public directories" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ uses ethical, publicly accessible OSINT methods — no accounts are accessed, no passwords are required, and no platforms are notified during a scan. Results include confidence scores so you can evaluate the reliability of every finding before taking action. For a deeper dive into how <Link to="/how-username-reuse-exposes-you-online" className="text-primary hover:underline">username reuse creates exposure risks</Link>, see our companion guide.
            </p>
          </div>
        </section>

        {/* ═══════════════ LIVE EXPOSURE EXAMPLE ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">What Does a Typical Digital Footprint Reveal?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              We scanned the username <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono">traveler_jay</code> across 500+ platforms. Here's what a typical self-exposure audit uncovers:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { value: "8", label: "Platform matches detected", color: "text-primary" },
                { value: "2", label: "Inactive legacy accounts still indexed", color: "text-muted-foreground" },
                { value: "1", label: "Data broker listing with outdated address", color: "text-destructive" },
                { value: "3", label: "Social platforms sharing identical bio text", color: "text-yellow-600" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Most people don't realise how much exposure they create through everyday activity. Signing up for a travel forum five years ago, leaving the same bio across three social platforms, or forgetting about an old account that still lists a previous address — these small, routine actions accumulate into a detailed profile that anyone can piece together. When platforms share identical bio text or profile photos, it becomes trivial to link accounts and build a composite picture of your habits, location history, and personal details.
            </p>
            <div className="flex justify-center">
              <Button size="lg" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run My Free Exposure Check
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 3: How Hackers Use Public Information ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Do Hackers Use Publicly Available Information?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Publicly visible personal data is the starting point for most targeted attacks. Threat actors use open-source intelligence techniques to build detailed profiles of potential victims — combining usernames, email addresses, social media activity, and breach data into actionable intelligence for social engineering, phishing, and credential-stuffing campaigns.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Common Attack Vectors Using Public Data</h3>
            <div className="space-y-3 mb-6">
              {[
                { title: "Spear phishing", desc: "Crafting personalised emails using details from your social profiles — job title, employer, interests — to bypass your suspicion." },
                { title: "Credential stuffing", desc: "Testing username/password combinations leaked in breaches across other services where you reuse credentials." },
                { title: "Social engineering", desc: "Calling support desks using your publicly visible personal details to impersonate you and reset account access." },
                { title: "Identity profiling", desc: "Aggregating data points from multiple sources to build a comprehensive identity file for fraud or impersonation." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The more data points linked to your identity, the easier it becomes for an attacker to succeed. Reducing your publicly visible exposure directly reduces your attack surface.
            </p>
          </div>
        </section>

        {/* ═══════════════ SECTION 4: Username Reuse & Identity Correlation ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Does Username Reuse Lead to Identity Correlation?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Reusing the same username across multiple platforms creates a linkable identity chain. When a single username appears on Instagram, GitHub, Reddit, and Steam simultaneously, anyone — including automated scrapers — can correlate these accounts to the same individual in seconds. This correlation reveals patterns: interests, locations, professional history, and social connections that would otherwise remain compartmentalised.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Why Is Username Reuse Dangerous?</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each additional platform sharing the same username exponentially increases your exposure surface. A breach on one platform doesn't just compromise that account — it potentially exposes every other service where you've used the same identifier. Attackers routinely use username enumeration tools to map these connections and identify high-value targets.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ's <Link to="/instagram-username-search-tool" className="text-primary hover:underline">Instagram username search tool</Link> and cross-platform scanning reveal exactly how many services share your identifier — giving you the visibility needed to break these correlation chains. Read our full analysis on <Link to="/how-username-reuse-exposes-you-online" className="text-primary hover:underline">how username reuse exposes you online</Link>.
            </p>
          </div>
        </section>

        {/* ═══════════════ MINI CONNECTIONS GRAPH TEASER ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Identity Connections Graph</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Pro scans generate an interactive connections graph showing how your accounts, usernames, and exposures link together — revealing correlation patterns invisible in flat result lists.
                </p>
                {/* Blurred teaser */}
                <div className="relative">
                  <div
                    className="select-none pointer-events-none h-48 rounded-lg bg-muted/50 flex items-center justify-center"
                    style={{ filter: "blur(6px)" }}
                    aria-hidden="true"
                  >
                    <div className="flex gap-8">
                      {["Instagram", "GitHub", "Reddit", "Steam", "Email"].map((n) => (
                        <div key={n} className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/20" />
                          <span className="text-xs text-muted-foreground">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/90 rounded-lg">
                    <Lock className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium text-foreground mb-2">Available in Pro scans</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/pricing">
                        View Plans <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 5: Phone Number & Data Broker Exposure ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Are Phone Numbers and Data Broker Listings Used Against You?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Phone numbers are among the most powerful correlation identifiers. A single phone number can link social media accounts, messaging apps, delivery services, and financial platforms together. Data brokers aggregate this information alongside home addresses, employment history, and family connections — then sell it openly through people-search websites.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Are Data Brokers?</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Data brokers are companies that collect, aggregate, and sell personal information from public records, social media, purchase history, and other sources. Sites like Spokeo, BeenVerified, and MyLife compile detailed dossiers that anyone can access — often including your current address, phone number, email addresses, relatives, and estimated income.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">How Can I Remove Myself From Data Brokers?</h3>
            <p className="text-muted-foreground leading-relaxed">
              Removal requires submitting opt-out requests to each broker individually — a process that can take weeks per site. FootprintIQ Pro identifies which data brokers list your information and provides direct opt-out links with step-by-step removal guidance. For a comprehensive walkthrough, see our <Link to="/privacy/data-broker-removal-guide" className="text-primary hover:underline">data broker removal guide</Link>.
            </p>
          </div>
        </section>

        {/* ═══════════════ CTA BLOCK 1 ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">See What's Publicly Visible About You</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Enter a username or email to discover which platforms, breach databases, and data brokers have your information. No credit card required.
              </p>
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Start Free Exposure Scan
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 6: How to Reduce Your Exposure ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Can I Reduce My Digital Footprint?</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Reducing your digital footprint is a systematic process — not a one-time action. It involves auditing your current exposure, removing unnecessary data, and establishing ongoing monitoring to catch new risks as they appear. Follow these steps to meaningfully reduce your online visibility and attack surface.
            </p>
            <div className="space-y-4">
              {reductionSteps.map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">{step.name}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ SECTION 7: What a Digital Footprint Scan Shows ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Does a Digital Footprint Scan Show You?</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              A FootprintIQ scan produces a structured exposure report covering platform matches, breach indicators, and identity correlation patterns. Free scans reveal signal counts and platform matches. Pro scans provide the full picture — confidence scoring, risk assessment, connections graph, and a prioritised remediation roadmap with direct action links.
            </p>

            {/* ── Free vs Pro Comparison Table ── */}
            <h3 className="text-xl font-semibold text-foreground mb-4">Free Scan vs. Pro Scan: What's Included?</h3>
            <div className="rounded-xl border border-border overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                      <th className="text-center p-4 font-semibold text-foreground w-24">Free</th>
                      <th className="text-center p-4 font-semibold text-primary w-24">Pro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <td className="p-4 text-muted-foreground">{row.feature}</td>
                        <td className="p-4 text-center">
                          {row.free ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <CheckCircle className="w-4 h-4 text-primary mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mb-8">
              <Button variant="outline" asChild>
                <Link to="/pricing">
                  Compare Plans & Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* ── Blurred Risk Gauge ── */}
            <h3 className="text-xl font-semibold text-foreground mb-4">Your Identity Risk Score</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Pro scans calculate an Identity Risk Score based on signal volume, breach exposure, and cross-platform correlation — giving you a single metric to track your exposure over time.
            </p>
            <BlurredRiskGauge
              signalsCount={7}
              highConfidenceCount={3}
              exposuresCount={2}
              scoreOverride={61}
              contextLabel="Moderate exposure from legacy accounts"
              className="mb-4"
            />
          </div>
        </section>

        {/* ═══════════════ FAQs ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-base group-hover:text-accent transition-colors">
                      {faq.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ═══════════════ CTA BLOCK 2 ═══════════════ */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Take Control of Your Digital Footprint
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free scan to see what's publicly visible. Upgrade to Pro for full exposure analysis, identity correlation mapping, and guided remediation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run Free Scan
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/pricing">
                  View Pro Plans <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ About & Citation ═══════════════ */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto space-y-8">
            <AboutFootprintIQBlock />
            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ – Ethical Digital Footprint Intelligence Platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment and authorised research only.
              </p>
            </aside>
          </div>
        </section>

        <RelatedToolsGrid currentPath="/check-my-digital-footprint" />
      </main>

      <Footer />
    </>
  );
};

export default CheckMyDigitalFootprint;
