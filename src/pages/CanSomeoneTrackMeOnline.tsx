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
  ArrowRight,
  CheckCircle,
  XCircle,
  Lock,
  Network,
  ChevronRight,
  BookOpen,
  MapPin,
  Phone,
  Camera,
  UserCheck,
  Globe,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/can-someone-track-me-online";

/* ────────────── FAQs ────────────── */
const faqs = [
  {
    q: "Can someone find my real name from my username?",
    a: "Potentially, yes — if you've used the same username on platforms where you've shared your real name. Cross-platform correlation links usernames to profiles containing biographical details. This is why using unique usernames per platform significantly reduces identity correlation risk.",
  },
  {
    q: "Can someone track my location through social media?",
    a: "Not in real-time through publicly available data. However, geotagged photos, location check-ins, and metadata in uploaded images can reveal places you've been. Disabling geotagging and reviewing privacy settings reduces this exposure substantially.",
  },
  {
    q: "Can a phone number be used to find my address?",
    a: "Data brokers and people-search sites often link phone numbers to home addresses through public records aggregation. The phone number itself doesn't reveal your location in real-time, but the data broker ecosystem makes correlating phone numbers to physical addresses straightforward.",
  },
  {
    q: "Can someone hack me just by knowing my username?",
    a: "No. Knowing a username alone doesn't grant access to any account. However, it does enable credential-stuffing attacks if you've reused passwords across platforms. A username combined with a breached password is where the real risk lies.",
  },
  {
    q: "Does FootprintIQ track people?",
    a: "No. FootprintIQ is a self-audit and authorised investigation tool that queries publicly accessible data. It does not track, monitor, or surveil anyone. It maps publicly visible exposure so users can understand and reduce their own digital footprint.",
  },
  {
    q: "Can someone see my browsing history?",
    a: "Not through OSINT or publicly available data. Your browsing history is stored locally on your device and by your ISP. It is not publicly accessible unless you've voluntarily shared it (e.g., public browser bookmark lists). Network-level monitoring requires direct access to your connection.",
  },
  {
    q: "How often should I check my online exposure?",
    a: "We recommend scanning at least quarterly, or immediately after a data breach notification. Pro users benefit from continuous monitoring that alerts them when new public exposure is detected.",
  },
  {
    q: "Is it possible to be completely untraceable online?",
    a: "Practically, no — but you can dramatically reduce your exposure. Using unique usernames, strong passwords, VPNs, privacy-focused browsers, and regularly auditing your digital footprint collectively make you a significantly harder target for both automated and manual profiling.",
  },
];

/* ────────────── Myth vs Fact ────────────── */
const mythVsFact = [
  { myth: "Anyone can track your exact location from your IP address", fact: "IP addresses typically resolve to a city or ISP region, not a specific address. Precision geolocation requires law enforcement access to ISP records." },
  { myth: "Hackers can access your camera through your username", fact: "Knowing a username provides zero access to device hardware. Camera access requires malware installation or exploiting specific software vulnerabilities." },
  { myth: "Your phone number reveals your live GPS location", fact: "Phone number lookups show carrier information and data broker listings — not real-time location. Live tracking requires carrier-level or law enforcement access." },
  { myth: "Deleting a social media account removes all traces", fact: "Cached pages, archived versions, screenshots, and data broker records may persist after account deletion. A full audit reveals what remains." },
  { myth: "VPNs make you completely anonymous online", fact: "VPNs mask your IP address but don't prevent tracking through cookies, browser fingerprinting, account logins, or username correlation across platforms." },
  { myth: "Someone can read your private messages with OSINT", fact: "OSINT only accesses publicly available data. Private messages, DMs, and encrypted communications are inaccessible through any legitimate OSINT technique." },
];

/* ────────────── Reduction checklist ────────────── */
const reductionSteps = [
  { name: "Audit your username exposure", text: "Run a FootprintIQ scan to identify every platform where your usernames appear publicly. This reveals the full scope of your cross-platform visibility." },
  { name: "Use unique usernames per platform", text: "Break correlation chains by using different usernames for different services. This prevents someone from linking your accounts across platforms automatically." },
  { name: "Disable photo geotagging", text: "Turn off location services for your camera app. Geotagged photos embed GPS coordinates in image metadata that anyone can extract." },
  { name: "Review social media privacy settings", text: "Restrict who can see your posts, friend lists, contact information, and activity history on every platform you use." },
  { name: "Opt out of data broker sites", text: "Submit removal requests to major data brokers like Spokeo, BeenVerified, and MyLife. FootprintIQ Pro provides direct opt-out links and tracks removal progress." },
  { name: "Enable two-factor authentication", text: "Protect all critical accounts with 2FA. Even if credentials are compromised through breaches, 2FA prevents unauthorised access." },
  { name: "Delete dormant accounts", text: "Unused accounts with old passwords are low-hanging targets. Delete or deactivate any account you no longer actively use." },
  { name: "Set up continuous monitoring", text: "Enable FootprintIQ Pro's monitoring to catch new exposure as it appears — before it can be exploited by malicious actors." },
];

/* ────────────── Free vs Pro ────────────── */
const comparisonRows = [
  { feature: "Username scan across 500+ platforms", free: true, pro: true },
  { feature: "Signal count & platform matches", free: true, pro: true },
  { feature: "Confidence scoring per finding", free: false, pro: true },
  { feature: "Identity correlation graph", free: false, pro: true },
  { feature: "Metadata exposure analysis", free: false, pro: true },
  { feature: "Data broker listing detection", free: false, pro: true },
  { feature: "Breach exposure context", free: false, pro: true },
  { feature: "Risk score & tracking surface rating", free: false, pro: true },
  { feature: "Remediation roadmap & opt-out links", free: false, pro: true },
  { feature: "Continuous monitoring & alerts", free: false, pro: true },
];

const CanSomeoneTrackMeOnline = () => {
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Can Someone Track Me Online? What's Actually Possible in 2026",
    description: "Understand what's actually possible when it comes to online tracking. Separate myth from reality and learn how to reduce your digital exposure with practical steps.",
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
      { "@type": "ListItem", position: 3, name: "Can Someone Track Me Online?", item: PAGE_URL },
    ],
  };

  const howToLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Reduce Your Online Tracking Risk",
    description: "A step-by-step guide to reducing your online tracking surface by auditing exposure, breaking correlation chains, and enabling continuous monitoring.",
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
        <title>Can Someone Track Me Online? What's Actually Possible in 2026</title>
        <meta name="description" content="Understand what's actually possible when it comes to online tracking in 2026. Separate myth from reality and learn practical steps to reduce your digital exposure." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Can Someone Track Me Online? What's Actually Possible in 2026" />
        <meta property="og:description" content="Separate myth from reality on online tracking. Learn what public data can reveal, what requires hacking, and how to reduce your exposure." />
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
            <li className="text-foreground font-medium">Can Someone Track Me Online?</li>
          </ol>
        </nav>

        {/* ═══════════════ HERO ═══════════════ */}
        <header className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Education Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Can Someone Track Me Online? What's Actually Possible
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The internet is full of alarming claims about online tracking — some accurate, many exaggerated. This guide separates fact from fiction, explaining exactly what public data can reveal about you, what requires illegal access, and what practical steps you can take to reduce your exposure. No fear-mongering. Just clear, evidence-based privacy education.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Check Your Exposure Now
              </Link>
            </Button>
          </div>
        </header>

        {/* ═══════════════ 1. Can Someone Track You by Username? ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Can Someone Track You by Your Username?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Yes — to a significant extent. If you reuse the same username across multiple platforms, anyone can search that identifier across public databases and social networks to build a profile of your online presence. This doesn't grant access to your accounts, but it does reveal which platforms you use, what information those profiles contain publicly, and how your accounts connect to each other.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What Username Searches Can Reveal</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A username search across 500+ platforms can identify social media profiles, developer accounts, gaming profiles, forum registrations, and community memberships. When combined, these reveal interests, geographic indicators, professional information, and social connections — all from publicly accessible sources. The more platforms sharing the same username, the more comprehensive the profile becomes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is why FootprintIQ recommends using unique usernames per platform. Breaking the correlation chain is one of the most effective privacy measures available. For a full explanation, see our <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint scanning guide</Link>.
            </p>
          </div>
        </section>

        {/* ═══════════════ 2. Can Someone Find Your Address? ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Can Someone Find Your Home Address Online?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              In many cases, yes — but not through the methods most people assume. Your home address is unlikely to be exposed through your IP address (which typically resolves only to a city or ISP region). Instead, addresses become publicly visible through data broker aggregation, property records, voter registration databases, and information you've voluntarily shared on social media or online directories.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">How Addresses Become Publicly Visible</h3>
            <div className="space-y-3 mb-6">
              {[
                { icon: Globe, title: "Data broker aggregation", desc: "Sites like Spokeo, BeenVerified, and WhitePages compile addresses from public records, purchase history, and social media data." },
                { icon: MapPin, title: "Property records", desc: "Home ownership records are public in most jurisdictions and indexed by people-search engines." },
                { icon: Camera, title: "Geotagged social media posts", desc: "Photos with embedded GPS coordinates can pinpoint locations where you've been, including your home." },
                { icon: UserCheck, title: "Voluntary disclosure", desc: "Job applications, newsletter signups, and online purchases can all leak your address into aggregated databases." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <item.icon className="w-4 h-4 text-primary shrink-0" />
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ Pro detects data broker listings that include your address and provides direct opt-out links for removal. Proactively auditing these listings is far more effective than relying on IP-based privacy measures alone.
            </p>
          </div>
        </section>

        {/* ═══════════════ 3. Can Phone Numbers Reveal Location? ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Can Phone Numbers Reveal Your Location?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Not in real-time through publicly available means. A phone number can reveal your carrier, approximate registration region, and whether it's a mobile or VoIP number. However, data brokers frequently correlate phone numbers with home addresses, employment details, and linked social accounts — making a phone number one of the most powerful identity correlation points available.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">What a Phone Number Can Expose</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                { icon: Phone, text: "Carrier & registration region" },
                { icon: Globe, text: "Linked social media accounts" },
                { icon: MapPin, text: "Data broker address listings" },
                { icon: UserCheck, text: "Messaging app registrations" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground text-sm">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Real-time location tracking via phone number requires carrier-level access or law enforcement tools — neither of which are available through OSINT. The privacy risk from phone numbers lies in correlation, not tracking. For more on phone number exposure, see our phone number OSINT guide.
            </p>
          </div>
        </section>

        {/* ═══════════════ 4. What Social Media Metadata Exposes ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Does Social Media Metadata Expose About You?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Beyond the content you deliberately post, social media platforms generate and expose metadata that reveals patterns about your behaviour. This includes posting times (which indicate your timezone), device information (which reveals what hardware you use), tagged locations, and interaction patterns (which reveal your social graph). Most of this metadata is generated automatically without your explicit awareness.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Common Metadata Exposure Points</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Photo EXIF data</strong> can contain GPS coordinates, camera model, timestamp, and even altitude. While most social platforms strip EXIF data on upload, many forums, blogs, and messaging services do not. <strong>Posting timestamps</strong> reveal your active hours and timezone with high accuracy. <strong>Platform-specific metadata</strong> like LinkedIn's "People Also Viewed" or Instagram's "Suggested Users" can inadvertently reveal your social connections and browsing patterns.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Understanding what metadata you generate — and which platforms expose it — is essential for managing your tracking surface. FootprintIQ's cross-platform analysis identifies which of your accounts contribute most to your overall exposure profile.
            </p>
          </div>
        </section>

        {/* ═══════════════ MYTH VS FACT TABLE ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Myth vs. Fact: Online Tracking in 2026</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-4 font-semibold text-destructive/80 w-1/2">❌ Myth</th>
                      <th className="text-left p-4 font-semibold text-emerald-600 w-1/2">✓ Fact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mythVsFact.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                        <td className="p-4 text-muted-foreground align-top">{row.myth}</td>
                        <td className="p-4 text-foreground align-top">{row.fact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ 5. What Is NOT Possible Without Hacking ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Is NOT Possible Without Hacking or Illegal Access?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Many online tracking fears are based on capabilities that require illegal access to private systems. It's important to understand these boundaries — both to calibrate your actual risk level and to recognise when someone is making exaggerated claims about their ability to track you.
            </p>
            <h3 className="text-xl font-semibold text-foreground mb-3">Activities That Require Illegal or Authorised Access</h3>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "Reading your private messages or emails",
                "Accessing your device camera or microphone",
                "Tracking your real-time GPS location",
                "Viewing your browsing history",
                "Accessing your bank or financial accounts",
                "Reading encrypted communications",
                "Intercepting your phone calls",
                "Installing monitoring software on your devices",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border">
                  <XCircle className="w-4 h-4 text-muted-foreground/60 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              None of these are achievable through OSINT or publicly available data. If someone claims to offer these capabilities through a "service" or "tool," they are either lying or describing illegal surveillance. FootprintIQ operates exclusively within the boundaries of publicly accessible information — we never access private accounts, bypass authentication, or intercept communications.
            </p>
          </div>
        </section>

        {/* ═══════════════ LIVE EXPOSURE: MYTH-BUSTING ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">What Can Actually Be Discovered From a Username?</h2>
                <p className="text-sm text-muted-foreground mt-1">We scanned the username <code className="text-primary font-mono text-xs bg-primary/10 px-1.5 py-0.5 rounded">urban_explorer</code> across 500+ platforms. Here's what publicly accessible data revealed — and what it didn't:</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: "✓", label: "Public posts reveal city-level location", color: "text-yellow-600" },
                    { value: "✓", label: "Tagged photos link to employer page", color: "text-yellow-600" },
                    { value: "✓", label: "Old forum account exposes birth year", color: "text-muted-foreground" },
                    { value: "✗", label: "No direct GPS tracking possible", color: "text-primary" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                      <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  The reality of online tracking is more nuanced than most people fear. Publicly available data can reveal broad patterns — the city you live in, where you work, and approximate age — but it cannot provide real-time GPS coordinates, intercept your messages, or access your private accounts. The concern isn't that someone can track your every move; it's that small, scattered data points across platforms can be pieced together into a surprisingly detailed picture of your life. Understanding what's actually discoverable — and what isn't — helps you focus your privacy efforts where they matter most.
                </p>
                <div className="flex justify-center pt-2">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      <Search className="w-5 h-5 mr-2" />
                      Check My Public Exposure
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ CTA BLOCK ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Find Out What's Actually Visible About You</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Instead of worrying about hypothetical tracking, see exactly what's publicly accessible right now. A free scan takes minutes and gives you actionable results.
              </p>
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Run Free Exposure Scan
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ 6. How to Reduce Tracking Risk ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Can You Reduce Your Online Tracking Risk?</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              You can't eliminate your digital footprint entirely, but you can dramatically reduce it. The following steps address the most impactful exposure vectors — from username correlation to data broker listings — and can be implemented without technical expertise.
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

        {/* ═══════════════ 7. Run an Exposure Check ═══════════════ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Does an Exposure Check Actually Show You?</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Rather than speculating about what someone might find, run a scan and see for yourself. FootprintIQ queries 500+ public sources and produces a structured exposure report showing exactly which platforms, databases, and data brokers have your information. Free scans show platform matches and signal counts. Pro scans provide full analysis with confidence scoring, correlation graphs, and remediation guidance.
            </p>

            {/* Free vs Pro Table */}
            <h3 className="text-xl font-semibold text-foreground mb-4">Free Scan vs. Pro Scan</h3>
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
            <h3 className="text-xl font-semibold text-foreground mb-3">Your Tracking Surface Score</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Pro scans calculate a tracking surface score based on cross-platform visibility, metadata exposure, and data broker presence — giving you a single metric to measure and track your privacy posture over time.
            </p>
            <BlurredRiskGauge
              signalsCount={3}
              highConfidenceCount={1}
              exposuresCount={1}
              scoreOverride={29}
              contextLabel="Low tracking feasibility, moderate metadata exposure"
              className="mb-4"
            />
          </div>
        </section>

        {/* ═══════════════ Connections Preview Teaser ═══════════════ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Network className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Tracking Surface Connections</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Pro scans visualise how your accounts, identifiers, and data broker listings interconnect — revealing tracking vectors invisible in flat result lists.
                </p>
                <div className="relative">
                  <div
                    className="select-none pointer-events-none h-48 rounded-lg bg-muted/50 flex items-center justify-center"
                    style={{ filter: "blur(6px)" }}
                    aria-hidden="true"
                  >
                    <div className="flex gap-8">
                      {["Username", "Email", "Phone", "Broker", "Social"].map((n) => (
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

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Stop Guessing. Start Knowing.
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free exposure scan to see exactly what's publicly visible about you. Replace anxiety with actionable intelligence.
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
                FootprintIQ – Ethical Digital Footprint Intelligence Platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment, privacy awareness, and authorised research only.
              </p>
            </aside>
          </div>
        </section>

        <RelatedToolsGrid currentPath="/can-someone-track-me-online" />
      </main>

      <Footer />
    </>
  );
};

export default CanSomeoneTrackMeOnline;
