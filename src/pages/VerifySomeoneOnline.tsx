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
  Scale,
  Fingerprint,
  MessageSquareWarning,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/verify-someone-online";

/* ────────────── FAQ data ────────────── */
const faqs = [
  {
    q: "Is it legal to verify someone's identity online?",
    a: "Yes, in most jurisdictions, searching publicly available information about someone is legal. However, the purpose matters — verifying someone for personal safety or due diligence is different from harassment or stalking. FootprintIQ only queries publicly accessible data and never accesses private accounts, protected databases, or systems requiring authentication.",
  },
  {
    q: "Can I find out if someone is using a fake identity?",
    a: "You can identify inconsistencies in someone's claimed identity by cross-referencing their username, profile photos, biographical details, and account history across platforms. Discrepancies — such as conflicting locations, mismatched profile ages, or recycled photos — are strong indicators of deception, though they are not definitive proof.",
  },
  {
    q: "How accurate is online identity verification?",
    a: "Accuracy depends on the depth of publicly available data. FootprintIQ assigns confidence scores to each finding based on signal strength and cross-source validation. High-confidence matches have been corroborated across multiple independent sources. We recommend treating results as investigative leads, not legal conclusions.",
  },
  {
    q: "Does the person know if I search for them?",
    a: "No. FootprintIQ queries publicly accessible data only. No accounts are accessed, no notifications are sent, and no platforms are contacted during a scan. The person being searched has no way to know a scan was performed.",
  },
  {
    q: "What's the difference between verification and surveillance?",
    a: "Verification is a one-time or periodic check of publicly available information for legitimate safety purposes — like confirming someone you're meeting is who they claim to be. Surveillance involves ongoing monitoring, tracking, or intrusion into private systems. FootprintIQ supports verification, not surveillance.",
  },
  {
    q: "Can FootprintIQ check dating app profiles?",
    a: "FootprintIQ can identify public profiles linked to a username or email address across hundreds of platforms, including some dating services that have publicly indexed profiles. It does not access private or authenticated dating app data. Results depend on the platform's public indexing policies.",
  },
  {
    q: "How is this different from a background check?",
    a: "Traditional background checks access regulated databases (criminal records, credit reports) and often require consent. FootprintIQ maps publicly visible digital exposure — social profiles, usernames, breach records, and data broker listings — without accessing any regulated or restricted data sources.",
  },
  {
    q: "What should I do if I find inconsistencies?",
    a: "Document the findings, consider the context, and evaluate the severity. Minor discrepancies (different display names across platforms) are normal. Significant inconsistencies (conflicting locations, stolen photos, fabricated employment) warrant caution. For serious concerns, consult appropriate authorities rather than confronting the individual directly.",
  },
];

/* ────────────── OSINT Signals List ────────────── */
const osintSignals = [
  { label: "Username matches across 500+ platforms", icon: UserCheck },
  { label: "Profile photo consistency check", icon: Eye },
  { label: "Account creation date analysis", icon: Globe },
  { label: "Bio & location cross-referencing", icon: Fingerprint },
  { label: "Breach exposure indicators", icon: AlertTriangle },
  { label: "Dating platform profile detection", icon: Heart },
  { label: "Social graph connection patterns", icon: Network },
  { label: "Data broker listing correlation", icon: Shield },
];

/* ────────────── Free vs Pro comparison ────────────── */
const comparisonRows = [
  { feature: "Username scan across 500+ platforms", free: true, pro: true },
  { feature: "Signal count & platform matches", free: true, pro: true },
  { feature: "Confidence scoring per finding", free: false, pro: true },
  { feature: "Identity correlation graph", free: false, pro: true },
  { feature: "Profile consistency analysis", free: false, pro: true },
  { feature: "Breach exposure context", free: false, pro: true },
  { feature: "Dating profile detection", free: false, pro: true },
  { feature: "Data broker listing check", free: false, pro: true },
  { feature: "Remediation & safety roadmap", free: false, pro: true },
  { feature: "PDF export for documentation", free: false, pro: true },
];

const VerifySomeoneOnline = () => {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Verify Someone's Identity Online (Ethical OSINT Guide 2026)",
    description:
      "Learn how to ethically verify someone's identity online using OSINT techniques. Understand what public data reveals, spot red flags, and protect yourself from catfishing and fraud.",
    author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    datePublished: "2026-02-24",
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
      { "@type": "ListItem", position: 3, name: "Verify Someone Online", item: PAGE_URL },
    ],
  };

  return (
    <>
      <Helmet>
        <title>How to Verify Someone's Identity Online (Ethical OSINT Guide 2026)</title>
        <meta
          name="description"
          content="Learn how to ethically verify someone's identity online using OSINT. Understand what public data reveals, spot red flags, and protect yourself from catfishing and fraud."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="How to Verify Someone's Identity Online (Ethical OSINT Guide 2026)" />
        <meta
          property="og:description"
          content="Learn how to ethically verify someone's identity online using OSINT. Spot identity inconsistencies, check cross-platform profiles, and protect yourself from fraud."
        />
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
            <li className="text-foreground font-medium">Verify Someone Online</li>
          </ol>
        </nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <header className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Ethical OSINT Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              How to Verify Someone's Identity Online
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Whether you're meeting someone from a dating app, vetting a business contact, or confirming a social media connection, publicly available data can help you verify who you're actually dealing with. This guide explains how to use ethical OSINT techniques to check someone's online identity — what to look for, what the red flags are, and where the legal boundaries lie.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Run an Identity Scan
              </Link>
            </Button>
          </div>
        </header>

        {/* ═══════════════ 1. Can You Verify Someone Online? ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Can You Actually Verify Someone's Identity Online?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Yes — to a meaningful degree. While online verification cannot provide the same certainty as government-issued identification, publicly available data offers powerful signals for assessing whether someone is who they claim to be. By cross-referencing usernames, profile details, account histories, and breach records across hundreds of platforms, you can identify consistency patterns or surface red flags that warrant further investigation.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Online Verification Can and Cannot Do</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Online verification can reveal whether a username exists across multiple platforms, whether profile details are consistent, and whether associated email addresses have appeared in data breaches. It <strong>cannot</strong> confirm legal identity, access private accounts, or provide court-admissible proof. Think of it as due diligence — gathering enough evidence to make an informed decision about trust.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ approaches this ethically: we only query publicly accessible sources, assign confidence scores to every finding, and never access private data or authenticated systems. The goal is informed awareness, not surveillance. For a deeper understanding of what digital footprint analysis reveals, see our <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint scanning guide</Link>.
            </p>
          </div>
        </section>

        {/* ═══════════════ 2. What Public Data Can Reveal ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Can Public Data Reveal About Someone?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Publicly available information paints a surprisingly detailed picture. Social media profiles, forum registrations, developer accounts, gaming platforms, and people-search databases collectively reveal patterns of online behaviour, geographic indicators, professional history, and social connections — all without accessing any private or restricted systems.
            </p>

            {/* OSINT Signals Grid */}
            <h3 className="text-xl font-semibold text-foreground mb-4">Key OSINT Signals for Identity Verification</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {osintSignals.map((s) => (
                <div key={s.label} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <s.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{s.label}</span>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              The strength of OSINT verification lies in correlation — no single signal is conclusive, but when multiple independent data points align (or contradict), you gain a reliable assessment of identity consistency. FootprintIQ automates this correlation across 500+ public sources, presenting findings with confidence scores so you can evaluate each signal on its merits.
            </p>
          </div>
        </section>

        {/* ═══════════════ 3. Username Cross-Platform Checks ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Do Username Cross-Platform Checks Work?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Username cross-referencing is the foundation of online identity verification. When someone provides a username — or you find one on a dating app, social media profile, or messaging platform — scanning that identifier across hundreds of public services reveals the broader digital identity behind it. Consistent account creation patterns, matching biographical details, and linked email addresses all contribute to building a verification picture.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Username Consistency Tells You</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When the same username appears on Instagram, GitHub, Reddit, and Steam with consistent profile photos and biographical details, that's a strong indicator of a genuine, established identity. Conversely, a username that only exists on one or two platforms — particularly recently created accounts — may warrant additional scrutiny, especially in dating or financial contexts.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ's <Link to="/ai-answers/instagram-username-osint" className="text-primary hover:underline">Instagram username OSINT analysis</Link> demonstrates how a single platform-specific check fits into broader identity verification workflows. However, according to our <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">2026 Username Reuse Research</Link>, <strong>41% of automated matches</strong> represent false positives — making contextual verification essential rather than relying on raw match counts alone.
            </p>
          </div>
        </section>

        {/* ═══════════════ 4. Dating App Profile Correlation ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Can You Verify Dating App Profiles?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Dating app verification is one of the most common use cases for ethical OSINT. Romance scams account for billions in losses globally each year, and verifying someone's claimed identity before meeting in person is a reasonable safety precaution. While FootprintIQ cannot access private dating app data, it can identify whether the username, email, or photos someone provides have a consistent digital history across public platforms.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What to Check Before Meeting Someone</h3>
            <div className="space-y-3 mb-6">
              {[
                { title: "Username history", desc: "Does their username appear on other platforms with consistent biographical details, or is it brand new with no digital history?" },
                { title: "Profile photo verification", desc: "Reverse image search their profile photo to check if it appears on stock photo sites, other people's profiles, or has been circulated in known scam networks." },
                { title: "Location consistency", desc: "Do their claimed location, timezone indicators, and geographic references in their online history align with what they've told you?" },
                { title: "Professional claims", desc: "If they claim a specific employer or profession, do public platforms (LinkedIn, company directories) corroborate this?" },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-card border border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This is about personal safety, not surveillance. Verifying publicly available details before meeting a stranger is a responsible step that protects both parties. FootprintIQ's <Link to="/research/username-reuse-report-2026#dating-social-overlap" className="text-primary hover:underline">identity correlation study shows</Link> that <strong>67% of dating-app profiles</strong> share a username or bio fragment with a social media account — making cross-platform verification both practical and essential.
            </p>
          </div>
        </section>

        {/* ═══════════════ MID-PAGE CASE STUDY ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-accent/30 bg-card overflow-hidden">
              <div className="px-6 py-4 bg-accent/10 border-b border-accent/20">
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-foreground">Case Study: Identifying a Catfish Profile</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Scenario:</strong> A user received a connection request on a dating app from someone claiming to be a software engineer in London. The profile featured professional photos, a detailed bio, and convincing conversation. Before meeting in person, the user ran a FootprintIQ scan on the provided username.
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Findings:</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span>Username only existed on 2 platforms — both created within the last 30 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span>Profile photos matched a stock photography portfolio with a different attribution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span>Claimed employer had no public record of anyone with that name</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <span>Email address associated with the username had appeared in 3 known scam databases</span>
                    </li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Outcome:</strong> The user reported the profile and avoided a potential romance scam. The entire verification process took under five minutes using FootprintIQ's automated cross-platform scan.
                </p>
                <p className="text-xs text-muted-foreground/70 italic">
                  This is a representative scenario based on common patterns. Names and details are illustrative.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ LIVE EXPOSURE: IDENTITY CROSS-CHECK ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">What Happens When We Cross-Check a Profile Identity?</h2>
                <p className="text-sm text-muted-foreground mt-1">We ran a verification scan on the username <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">sarah_fitlife</code> across 500+ platforms. Here's what surfaced:</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: "2", label: "Instagram & TikTok share identical profile photos", color: "text-primary" },
                    { value: "1", label: "Dating app uses cropped version of same image", color: "text-yellow-600" },
                    { value: "1", label: "Linked bio points to unrelated domain", color: "text-destructive" },
                    { value: "3", label: "Location inconsistencies across platforms", color: "text-amber-500" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Identity verification isn't about finding exposure — it's about spotting inconsistencies. When a profile photo is recycled across social and dating platforms but the bio link leads to an unrelated domain, or when claimed locations shift between profiles, these discrepancies suggest the identity may not be what it appears. Genuine people tend to have organic, evolving digital trails. Fabricated profiles display a patchwork of borrowed details that don't hold up under cross-platform scrutiny.
                </p>
                <div className="flex justify-center pt-2">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      <Search className="w-5 h-5 mr-2" />
                      Verify This Identity Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ 5. Red Flags of Identity Inconsistencies ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Are the Red Flags of a Fake Online Identity?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Identity inconsistencies fall on a spectrum — from minor discrepancies that are perfectly normal (different display names across platforms) to serious red flags that suggest deliberate deception. Understanding what to look for helps you evaluate OSINT findings objectively and avoid both false alarms and missed warnings.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">High-Risk Indicators</h3>
            <div className="space-y-3 mb-6">
              {[
                { flag: "No digital history before recent months", severity: "High" },
                { flag: "Profile photos found on stock sites or other people's accounts", severity: "High" },
                { flag: "Conflicting biographical details across platforms", severity: "High" },
                { flag: "Email associated with known fraud or scam databases", severity: "Critical" },
                { flag: "Username exists on only 1–2 platforms with no history", severity: "Medium" },
                { flag: "Claimed employer or credentials cannot be independently verified", severity: "Medium" },
                { flag: "Timezone or language inconsistencies with claimed location", severity: "Medium" },
              ].map((item) => (
                <div key={item.flag} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${
                      item.severity === "Critical" ? "text-destructive" : item.severity === "High" ? "text-destructive/80" : "text-amber-500"
                    }`} />
                    <span className="text-sm text-foreground">{item.flag}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                    item.severity === "Critical"
                      ? "bg-destructive/10 text-destructive"
                      : item.severity === "High"
                        ? "bg-destructive/10 text-destructive/80"
                        : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {item.severity}
                  </span>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Normal Variations (Not Red Flags)</h3>
            <p className="text-muted-foreground leading-relaxed">
              Different display names across platforms, varying profile photos over time, and accounts on different types of services are all normal. People naturally maintain different identities for professional and personal contexts. The key differentiator is <em>consistency over time</em> — genuine identities leave a gradual, organic digital trail. Fabricated ones tend to appear suddenly with no history.
            </p>
          </div>
        </section>

        {/* ═══════════════ CTA BLOCK 1 ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Verify Before You Trust</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Cross-check a username or email against 500+ public platforms to see whether someone's online identity holds up under scrutiny.
              </p>
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run Identity Check
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ 6. Ethical & Legal Considerations ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Are the Ethical and Legal Boundaries?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The power of OSINT comes with responsibility. Just because information is publicly available doesn't mean every use of it is ethical or legal. FootprintIQ operates under a strict <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link> that defines clear boundaries between legitimate verification and harmful surveillance.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Legitimate Uses of Online Identity Verification</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "Personal safety before meeting someone in person",
                "Due diligence on business contacts or partners",
                "Self-audit to understand your own exposure",
                "Authorised corporate investigations",
                "Parental safety assessments (with appropriate boundaries)",
                "Pre-employment screening (with candidate consent)",
              ].map((use) => (
                <div key={use} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{use}</span>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Activities We Do Not Support</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "Stalking, harassment, or intimidation",
                "Doxxing or publishing someone's private details",
                "Bypassing authentication or accessing private accounts",
                "Discrimination based on online activity",
              ].map((use) => (
                <div key={use} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border">
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{use}</span>
                </div>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Legal Framework</h3>
            <p className="text-muted-foreground leading-relaxed">
              In most jurisdictions, accessing publicly available information is legal. However, how you <em>use</em> that information matters. Laws such as GDPR (EU), CCPA (California), and various anti-harassment statutes regulate what you can do with personal data once obtained. FootprintIQ provides exposure intelligence — actionable awareness of what's publicly visible — and explicitly does not support activities that violate privacy laws, platform terms of service, or ethical standards.
            </p>
          </div>
        </section>

        {/* ═══════════════ 7. How to Protect Yourself from Catfishing ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Can You Protect Yourself from Catfishing and Online Fraud?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Prevention is more effective than reaction. By building verification habits into your online interactions, you can significantly reduce your vulnerability to catfishing, romance scams, and impersonation fraud. These steps don't require technical expertise — just consistent awareness and the willingness to verify before you trust.
            </p>
            <div className="space-y-4 mb-6">
              {[
                { step: "1", title: "Verify usernames before deepening connections", desc: "Run a quick cross-platform check on any username you're given. Genuine people leave digital trails; fabricated identities typically don't." },
                { step: "2", title: "Reverse-search profile photos", desc: "Use reverse image search to check whether their photos appear elsewhere online — on stock photo sites, other social profiles, or known scam databases." },
                { step: "3", title: "Check for breach exposure on associated emails", desc: "If you have their email address, checking breach databases reveals whether the email has a legitimate history or was recently created for a specific purpose." },
                { step: "4", title: "Request a video call before meeting in person", desc: "This simple step eliminates the vast majority of catfish attempts, as scammers using stolen photos cannot replicate a live video conversation." },
                { step: "5", title: "Monitor your own exposure proactively", desc: "Understanding what's publicly visible about you helps you recognise when someone references details they shouldn't know. Run regular self-audits with FootprintIQ." },
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
            <p className="text-muted-foreground leading-relaxed">
              For more on how <Link to="/how-username-reuse-exposes-you-online" className="text-primary hover:underline">username reuse creates exploitable patterns</Link>, and how to break those chains, see our companion guide.
            </p>
          </div>
        </section>

        {/* ═══════════════ Free vs Pro Table + Risk Gauge ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Free Scan vs. Pro Scan: What's Included?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Free scans reveal signal counts and platform matches — enough to assess whether a username has a meaningful digital presence. Pro scans provide the full verification picture: confidence scoring, identity correlation graphs, breach context, and a structured safety assessment.
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
            <h3 className="text-xl font-semibold text-foreground mb-3">Identity Verification Risk Score</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Pro scans generate an identity consistency score based on cross-platform signal density, account age patterns, and breach exposure — giving you a single metric to evaluate how trustworthy someone's online presence appears.
            </p>
            <BlurredRiskGauge
              signalsCount={5}
              highConfidenceCount={2}
              exposuresCount={1}
              scoreOverride={38}
              contextLabel="Low-to-moderate inconsistency risk"
              className="mb-4"
            />
          </div>
        </section>

        {/* ═══════════════ Connections Graph Teaser ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Identity Connections Preview</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Pro scans generate an interactive connections graph mapping how accounts, usernames, and data points link together — revealing identity patterns invisible in flat result lists.
                </p>
                <div className="relative">
                  <div
                    className="select-none pointer-events-none h-48 rounded-lg bg-muted/50 flex items-center justify-center"
                    style={{ filter: "blur(6px)" }}
                    aria-hidden="true"
                  >
                    <div className="flex gap-8">
                      {["Dating App", "Instagram", "Email", "GitHub", "Forum"].map((n) => (
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
        <section className="py-20 px-6 bg-accent/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trust, but Verify
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              A free identity scan reveals cross-platform consistency in minutes. Upgrade to Pro for full verification graphs, confidence scoring, and safety assessments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Verify a Profile
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/pricing">
                  Unlock Full Reports <ArrowRight className="ml-2 w-5 h-5" />
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
                FootprintIQ – Ethical Digital Footprint Intelligence Platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment, personal safety, and authorised investigation purposes only.
              </p>
            </aside>
          </div>
        </section>

        <RelatedToolsGrid currentPath="/verify-someone-online" />
      </main>

      <Footer />
    </>
  );
};

export default VerifySomeoneOnline;
