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
  ArrowRight,
  CheckCircle,
  XCircle,
  Lock,
  Network,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Heart,
  Phone,
  Mail,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/check-if-someone-is-a-scammer";

/* ────────────── FAQ ────────────── */
const faqs = [
  {
    q: "Can you check if someone is a scammer online?",
    a: "Yes. While no single tool provides a definitive 'scammer' label, you can identify strong warning signs by cross-referencing usernames, profile photos, email addresses, and account histories across public sources. Inconsistencies in these signals — such as newly created accounts, stolen photos, or emails linked to known fraud databases — are reliable red flags.",
  },
  {
    q: "Is it legal to search someone's username to check for scams?",
    a: "Searching publicly available information about someone is legal in most jurisdictions. FootprintIQ only queries publicly accessible data — no accounts are accessed, no passwords are required, and no platforms are notified. The purpose of your search matters: personal safety and fraud prevention are legitimate and widely recognised reasons.",
  },
  {
    q: "What are the most common types of online scams?",
    a: "Romance scams, advance-fee fraud, impersonation scams, fake job offers, cryptocurrency investment fraud, and phishing schemes are among the most prevalent. Romance scams alone cost victims billions annually. Most rely on fabricated identities that can be detected through cross-platform OSINT analysis.",
  },
  {
    q: "How accurate is a username scam check?",
    a: "Accuracy depends on the depth of publicly available data. FootprintIQ assigns confidence scores to every finding based on signal strength and cross-source corroboration. No tool can definitively label someone a 'scammer' — but consistent red flags across multiple data points provide a strong basis for informed decisions.",
  },
  {
    q: "Does the person know I searched for them?",
    a: "No. FootprintIQ queries publicly accessible sources only. No notifications are sent, no accounts are accessed, and no platforms are contacted during a scan. The person has no way of knowing a scan was performed.",
  },
  {
    q: "What should I do if I think someone is a scammer?",
    a: "Document your findings, cease financial transactions, and report the individual to the relevant platform and local authorities. Do not confront the person directly — scammers may escalate tactics when challenged. Organisations like Action Fraud (UK), the FTC (US), and the ACCC (Australia) accept fraud reports.",
  },
  {
    q: "Can FootprintIQ detect romance scammers?",
    a: "FootprintIQ can identify many indicators associated with romance scam profiles: newly created accounts, usernames with no cross-platform history, profile photos linked to stock photography or other identities, and email addresses appearing in known fraud databases. These signals don't prove intent but provide the evidence needed to make safer decisions.",
  },
  {
    q: "How is this different from a background check?",
    a: "Background checks access regulated databases (criminal records, credit reports) and typically require consent. FootprintIQ maps publicly visible digital exposure — social profiles, username patterns, breach records, and data broker listings — without accessing any restricted or regulated data. It's a digital due diligence tool, not a legal background check.",
  },
];

/* ────────────── Scam Checklist ────────────── */
const scamChecklist = [
  { text: "Profile was created very recently (within last 30 days)", risk: "High" },
  { text: "Username exists on fewer than 2 platforms", risk: "High" },
  { text: "Profile photo appears on stock photo sites or other people's accounts", risk: "Critical" },
  { text: "Claims a profession or employer that can't be independently verified", risk: "High" },
  { text: "Refuses video calls or in-person meetings", risk: "High" },
  { text: "Asks for money, gift cards, or cryptocurrency early in the relationship", risk: "Critical" },
  { text: "Biographical details contradict each other across platforms", risk: "High" },
  { text: "Email address linked to known fraud or scam databases", risk: "Critical" },
  { text: "Shares overly personal stories very quickly to build emotional attachment", risk: "Medium" },
  { text: "Location or timezone inconsistencies with claimed identity", risk: "Medium" },
];

/* ────────────── Free vs Pro ────────────── */
const comparisonRows = [
  { feature: "Username scan across 500+ platforms", free: true, pro: true },
  { feature: "Signal count & platform matches", free: true, pro: true },
  { feature: "Confidence scoring per finding", free: false, pro: true },
  { feature: "Identity correlation graph", free: false, pro: true },
  { feature: "Account age & creation pattern analysis", free: false, pro: true },
  { feature: "Breach & fraud database cross-reference", free: false, pro: true },
  { feature: "Profile photo consistency indicators", free: false, pro: true },
  { feature: "Data broker listing detection", free: false, pro: true },
  { feature: "Safety assessment & risk score", free: false, pro: true },
  { feature: "PDF export for documentation", free: false, pro: true },
];

const CheckIfSomeoneIsAScammer = () => {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Check If Someone Is a Scammer (Username & Profile Analysis)",
    description:
      "Learn how to check if someone is a scammer using ethical OSINT techniques. Identify red flags in usernames, profiles, and online behaviour to protect yourself from fraud.",
    author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    datePublished: "2026-02-24",
    dateModified: "2026-02-24",
    mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
    inLanguage: "en",
    wordCount: 2100,
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
      { "@type": "ListItem", position: 3, name: "Check If Someone Is a Scammer", item: PAGE_URL },
    ],
  };

  return (
    <>
      <Helmet>
        <title>How to Check If Someone Is a Scammer (Username & Profile Analysis)</title>
        <meta
          name="description"
          content="Learn how to check if someone is a scammer using ethical OSINT techniques. Identify red flags in usernames, profiles, and online behaviour to protect yourself from fraud."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="How to Check If Someone Is a Scammer (Username & Profile Analysis)" />
        <meta property="og:description" content="Identify scam red flags using cross-platform username analysis. Learn what OSINT reveals about suspicious profiles and how to protect yourself from fraud." />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={articleLd} />
      <JsonLd data={faqLd} />
      <JsonLd data={breadcrumbLd} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-3xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/resources" className="hover:text-foreground transition-colors">Resources</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Check If Someone Is a Scammer</li>
          </ol>
        </nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <header className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Scam Prevention Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              How to Check If Someone Is a Scammer
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Online scams cost victims billions every year — and most begin with a fabricated identity. This guide explains how to use publicly available data to identify red flags in usernames, profiles, and online behaviour before trusting someone with your time, money, or personal information. No hacking required. No private data accessed. Just ethical, informed due diligence.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Run a Free Scam Check
              </Link>
            </Button>
          </div>
        </header>

        {/* ═══════════════ 1. Common Online Scam Red Flags ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Are the Most Common Online Scam Red Flags?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Scammers follow predictable patterns. While individual tactics vary — from romance fraud to investment schemes — the underlying identity fabrication techniques are remarkably consistent. By understanding what to look for, you can identify suspicious profiles before they cause harm. The key is examining the <em>digital history</em> behind a profile, not just its surface appearance.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">The Scammer Identity Pattern</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Legitimate online identities develop organically over months and years across multiple platforms. Scammer identities are typically created quickly, exist on very few platforms, and lack the natural depth and consistency of genuine accounts. A real person's username will appear on GitHub, Reddit, Instagram, and gaming platforms with years of activity. A scammer's username will often exist only on the platform where they're targeting you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ automates this pattern analysis across 500+ public platforms, giving you a clear picture of whether someone's claimed identity has the digital depth you'd expect from a genuine person.
            </p>
          </div>
        </section>

        {/* ═══════════════ SCAM CHECKLIST ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <CircleAlert className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Scam Red Flag Checklist</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Use this checklist to evaluate suspicious profiles. Multiple matches significantly increase the likelihood of a fraudulent identity.
            </p>
            <div className="space-y-2">
              {scamChecklist.map((item) => (
                <div key={item.text} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${
                      item.risk === "Critical" ? "text-destructive" : item.risk === "High" ? "text-destructive/80" : "text-amber-500"
                    }`} />
                    <span className="text-sm text-foreground">{item.text}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                    item.risk === "Critical"
                      ? "bg-destructive/10 text-destructive"
                      : item.risk === "High"
                        ? "bg-destructive/10 text-destructive/80"
                        : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {item.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 2. Romance Scam Warning Signs ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Do You Spot a Romance Scammer?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Romance scams are among the most financially and emotionally devastating forms of online fraud. Scammers invest weeks or months building emotional connections before requesting money. The profiles they create are designed to appear genuine — but digital analysis reveals the cracks in the facade.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Key Romance Scam Indicators</h3>
            <div className="space-y-3 mb-6">
              {[
                { title: "Accelerated emotional intimacy", desc: "Professing love or deep connection within days or weeks, before any in-person meeting has occurred." },
                { title: "Convenient excuses to avoid video calls", desc: "Military deployment, broken camera, poor internet — repeated excuses to avoid showing their face live." },
                { title: "Financial requests disguised as emergencies", desc: "Sudden medical bills, travel costs, or investment 'opportunities' that require your money to resolve." },
                { title: "Too-perfect profile presentation", desc: "Professional-quality photos, flawless bio, and a story designed to match your interests precisely." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-destructive shrink-0" />
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              A simple username scan can often distinguish real profiles from fabricated ones in minutes. If the person's username only exists on one dating platform with no other digital history, that's a significant warning sign. For a deeper guide on <Link to="/verify-someone-online" className="text-primary hover:underline">verifying someone's identity online</Link>, see our companion article.
            </p>
          </div>
        </section>

        {/* ═══════════════ 3. Username Pattern Analysis ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Can Username Pattern Analysis Reveal?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Usernames are one of the most reliable indicators for scam detection. Genuine people tend to reuse usernames across platforms over time, creating a consistent digital trail. Scammers create disposable usernames for specific targets, resulting in thin or non-existent cross-platform presence. This distinction is detectable through automated scanning.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Legitimate Usernames Look Like</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A genuine username typically appears on 5–15+ platforms with accounts created over several years. The profile details — photos, bios, locations — show natural evolution over time. There's activity history: posts, comments, contributions, followers gained gradually. This organic digital trail is extremely difficult and time-consuming to fabricate.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Scammer Usernames Look Like</h3>
            <p className="text-muted-foreground leading-relaxed">
              Scammer usernames typically exist on 1–2 platforms, were created recently, have minimal or no activity history, and often follow formulaic naming patterns (first name + random numbers). When you scan a suspicious username and find it has no meaningful digital footprint beyond the platform where you encountered it, that absence of history is itself a powerful signal.
            </p>
          </div>
        </section>

        {/* ═══════════════ MID-PAGE EXPOSURE EXAMPLE ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">How Username Patterns Reveal Scam Signals</h2>
                <p className="text-sm text-muted-foreground mt-1">We scanned the username <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">mark_williams88</code> across 500+ platforms. Here's what the fraud-signal analysis uncovered:</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: "6", label: "Newly created accounts sharing this username", color: "text-destructive" },
                    { value: "2", label: "Platforms with stock photo reverse-match", color: "text-yellow-600" },
                    { value: "1", label: "Dating bio matching known scam script patterns", color: "text-destructive" },
                    { value: "0", label: "Long-term platform history found", color: "text-muted-foreground" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Scam profiles follow recognisable patterns when examined at scale. A username that appears across multiple freshly created accounts — but has zero long-term history — is a strong indicator of a fabricated identity. When profile photos match stock imagery and dating bios mirror known scam scripts, these signals compound into a clear red-flag profile. Legitimate users build digital histories gradually; scammers manufacture presence rapidly across disposable accounts designed to be abandoned once the fraud is complete.
                </p>
                <div className="flex justify-center pt-2">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      <Search className="w-5 h-5 mr-2" />
                      Check for Scam Indicators
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ 4. Cross-Platform Identity Checks ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Do Cross-Platform Identity Checks Help Detect Scams?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Cross-platform analysis is the most reliable method for evaluating identity legitimacy. By checking whether a username, email, or phone number appears consistently across multiple independent services, you can assess whether someone's claimed identity has genuine depth or was recently fabricated for a specific purpose.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Cross-Platform Consistency Reveals</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When the same username appears on Instagram, GitHub, Reddit, Steam, and LinkedIn with consistent biographical details, profile photos, and years of activity, that's a strong indicator of a genuine identity. When a username exists only on the platform where you encountered the person — with no corroborating presence elsewhere — that inconsistency deserves attention.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ scans 500+ public sources simultaneously, producing a comprehensive cross-platform identity map with confidence scoring for each finding. This gives you an evidence-based assessment rather than relying on intuition alone. For more on how digital footprint analysis works, see our <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint scanning guide</Link>.
            </p>
          </div>
        </section>

        {/* ═══════════════ CTA BLOCK 1 ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Suspicious of Someone? Check Before You Trust</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Run a free cross-platform scan on any username. See whether the person behind the profile has a genuine digital history — or a fabricated one.
              </p>
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run Free Scam Check
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ 5. Phone & Email Correlation ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Can Phone Numbers and Email Addresses Reveal?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Phone numbers and email addresses are high-value correlation identifiers. A phone number can link social media accounts, messaging apps, and financial services together. An email address connects registrations, breach histories, and data broker profiles. When someone provides either, scanning these identifiers can reveal whether they're associated with a legitimate digital history or known fraudulent activity.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: Mail, text: "Email breach history & fraud database matches" },
                { icon: Phone, text: "Phone number linked to messaging & social accounts" },
                { icon: Globe, text: "Data broker listings tied to contact details" },
                { icon: Shield, text: "VoIP / disposable number detection indicators" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Scammers frequently use disposable email addresses and VoIP phone numbers that lack the digital history associated with genuine identifiers. When a provided email or phone number has no linked social accounts, no breach history, and no data broker presence, that absence is itself a significant signal.
            </p>
          </div>
        </section>

        {/* ═══════════════ 6. What Legitimate OSINT Can Reveal ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Can Legitimate OSINT Reveal About Suspicious Profiles?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Open-source intelligence techniques provide structured, evidence-based analysis of publicly available data. When applied ethically — querying only publicly accessible sources without accessing private accounts — OSINT can reveal the digital depth, consistency, and history behind any online identity. This is fundamentally different from hacking, surveillance, or accessing restricted databases.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What FootprintIQ's OSINT Analysis Provides</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: UserCheck, text: "Cross-platform username presence mapping" },
                { icon: Eye, text: "Account age & activity depth indicators" },
                { icon: AlertTriangle, text: "Breach & fraud database cross-references" },
                { icon: Network, text: "Identity correlation graph (Pro)" },
                { icon: ShieldCheck, text: "Confidence scoring per finding" },
                { icon: Globe, text: "Data broker listing detection" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The strength of ethical OSINT lies in correlation, not speculation. No single finding proves fraud — but when multiple independent signals align (thin digital history, stolen photos, fraud database matches), the evidence becomes compelling. FootprintIQ presents findings with confidence scores so you can evaluate each signal objectively.
            </p>
          </div>
        </section>

        {/* ═══════════════ 7. How to Protect Yourself ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Can You Protect Yourself from Online Scammers?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Protection starts with awareness and consistent verification habits. You don't need technical expertise — just the willingness to check before you trust. These practical steps significantly reduce your vulnerability to common online scams.
            </p>
            <div className="space-y-4 mb-6">
              {[
                { step: "1", title: "Scan usernames before deepening any connection", desc: "Run a cross-platform check on any username you're given. Genuine people have digital histories; fabricated identities don't." },
                { step: "2", title: "Reverse-search profile photos", desc: "If a profile photo appears on stock photo sites or belongs to someone else, that's a definitive red flag." },
                { step: "3", title: "Never send money to someone you haven't met in person", desc: "This single rule prevents the vast majority of romance scam losses. No legitimate connection requires pre-meeting financial transfers." },
                { step: "4", title: "Request a live video call early", desc: "Video calls eliminate most catfish attempts immediately. Scammers using stolen photos cannot replicate a live conversation." },
                { step: "5", title: "Check email addresses against breach databases", desc: "Emails with no history in breach databases or linked accounts may be recently created disposable addresses — a common scammer tactic." },
                { step: "6", title: "Trust patterns over promises", desc: "Evaluate what the data shows, not what someone tells you. Consistent digital history across platforms over years is hard to fake; emotional stories are not." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ Free vs Pro + Risk Gauge ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Free Scan vs. Pro Scan: What's Included?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Free scans show platform matches and signal counts — enough to identify whether a username has meaningful digital presence. Pro scans provide the full scam detection toolkit: confidence scoring, fraud database cross-references, identity graphs, and detailed safety assessments.
            </p>
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

            {/* Blurred Risk Gauge */}
            <h3 className="text-xl font-semibold text-foreground mb-3">Scam Risk Assessment Score</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Pro scans generate a risk assessment score based on cross-platform signal density, account age patterns, and fraud database exposure — giving you a single metric to evaluate identity trustworthiness.
            </p>
            <BlurredRiskGauge
              signalsCount={11}
              highConfidenceCount={6}
              exposuresCount={2}
              scoreOverride={72}
              contextLabel="High anomaly indicators detected"
              className="mb-4"
            />
          </div>
        </section>

        {/* ═══════════════ Blurred Advanced Signals Preview ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Advanced Scam Signals Preview</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Pro scans map identity connections, account age patterns, and fraud indicator correlations in an interactive graph — revealing deception patterns invisible in flat result lists.
                </p>
                <div className="relative">
                  <div
                    className="select-none pointer-events-none h-48 rounded-lg bg-muted/50 flex items-center justify-center"
                    style={{ filter: "blur(6px)" }}
                    aria-hidden="true"
                  >
                    <div className="flex gap-8">
                      {["Dating App", "Email", "Breach DB", "VoIP", "Social"].map((n) => (
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

        {/* ═══════════════ FAQs ═══════════════ */}
        <section className="py-16 px-6">
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
              Don't Wait Until It's Too Late
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              A five-minute username scan can save you from weeks of manipulation, financial loss, or identity theft. Check before you trust.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run Free Scam Check
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
                FootprintIQ – Ethical Digital Footprint Intelligence Platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for scam prevention, personal safety, and authorised investigation purposes only.
              </p>
            </aside>
          </div>
        </section>

        <RelatedToolsGrid currentPath="/check-if-someone-is-a-scammer" />
      </main>

      <Footer />
    </>
  );
};

export default CheckIfSomeoneIsAScammer;
