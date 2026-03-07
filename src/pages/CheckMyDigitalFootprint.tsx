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
import { BlurredRiskGauge } from "@/components/results/BlurredRiskGauge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Globe,
  Database,
  ArrowRight,
  Lock,
  BookOpen,
  AlertTriangle,
  UserCheck,
  Fingerprint,
} from "lucide-react";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";

const SLUG = "/check-my-digital-footprint";
const CANONICAL = `${CANONICAL_BASE}${SLUG}`;
const TITLE = "Check My Digital Footprint – Free Online Exposure Scan | FootprintIQ";
const DESC = "Check your digital footprint with a free exposure scan. Discover what personal data is publicly visible online, understand how it's exploited, and learn practical steps to reduce your digital exposure.";

const FAQS = [
  {
    q: "How do I check my digital footprint?",
    a: "The fastest way is to run a username or email scan using an OSINT tool like FootprintIQ. Enter your most-used handle, and the platform queries 500+ public sources — social media, forums, data brokers, breach databases — to produce an exposure report in minutes. You can start with a free scan and upgrade to Pro for deeper analysis.",
  },
  {
    q: "Can someone track my online identity?",
    a: "Yes. Anyone with access to OSINT tools can search a username, email address, or phone number to discover linked accounts, breach exposure, and data broker listings. The more platforms that share the same identifier, the easier it becomes to build a composite profile. This is why checking your digital footprint regularly is essential.",
  },
  {
    q: "How much personal information is online about me?",
    a: "More than most people expect. The average internet user has accounts on 100+ platforms, many of which are forgotten but still publicly indexed. Add data broker aggregation, breach records, and archived forum posts, and the volume of discoverable information can be significant — even for privacy-conscious individuals.",
  },
  {
    q: "What is an active vs passive digital footprint?",
    a: "An active digital footprint consists of data you deliberately share — social media posts, account registrations, public comments. A passive footprint is collected without your explicit action — data broker aggregation, website tracking cookies, leaked credentials from breaches, and metadata embedded in shared files.",
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
    q: "How is FootprintIQ different from Have I Been Pwned?",
    a: "Have I Been Pwned checks whether your email appeared in known data breaches. FootprintIQ goes further — scanning usernames across 500+ platforms, mapping identity correlation patterns, identifying data broker listings, and producing a comprehensive exposure report with actionable remediation steps.",
  },
  {
    q: "How often should I check my digital footprint?",
    a: "We recommend scanning at least quarterly, or immediately after a known data breach. Pro users benefit from continuous monitoring that alerts them when new exposure is detected, so threats can be addressed before they escalate.",
  },
  {
    q: "Can I reduce my digital footprint once it exists?",
    a: "Yes, but it requires sustained effort. Start by deleting unused accounts, opting out of data brokers, using unique usernames per platform, and tightening privacy settings on active accounts. FootprintIQ Pro provides a structured remediation roadmap with direct opt-out links to accelerate this process.",
  },
];

const reductionSteps = [
  { name: "Audit your existing accounts", text: "Run a FootprintIQ scan to identify every public account, profile, and data broker listing connected to your identity. Start with your most-used username and email address." },
  { name: "Delete or deactivate unused accounts", text: "Prioritise removing accounts you no longer use. Dormant profiles are often the first targets in credential-stuffing attacks because they retain old, potentially compromised passwords." },
  { name: "Opt out of data broker sites", text: "Submit removal requests to major data brokers like Spokeo, BeenVerified, and MyLife. FootprintIQ Pro provides direct opt-out links and tracks removal progress over time." },
  { name: "Use unique usernames per platform", text: "Stop reusing the same username everywhere. When multiple platforms share an identical username, attackers can correlate your identity across services in minutes." },
  { name: "Enable two-factor authentication", text: "Activate 2FA on all critical accounts — especially email, banking, and social media. This adds a second verification layer even if passwords are compromised through breaches." },
  { name: "Review privacy settings on active accounts", text: "Tighten visibility settings on platforms you continue to use. Restrict who can see your posts, contact information, friend lists, and activity history." },
  { name: "Set up continuous monitoring", text: "Schedule regular scans or enable FootprintIQ Pro's continuous monitoring to catch new exposure as it appears — before it can be exploited." },
];

const CheckMyDigitalFootprint = () => {
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
      <JsonLd data={buildArticleSchema({ headline: "Check My Digital Footprint", description: DESC, url: SLUG, datePublished: "2026-02-13", dateModified: "2026-03-07" })} />
      <JsonLd data={buildFAQSchema(FAQS)} />
      <JsonLd data={buildBreadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: "Check My Digital Footprint" }])} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "HowTo",
        name: "How to Reduce Your Digital Footprint",
        description: "A step-by-step guide to reducing your online exposure by auditing accounts, removing data broker listings, and enabling continuous monitoring.",
        totalTime: "PT2H",
        step: reductionSteps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
      }} />
      <Header />

      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ContentBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/resources" }, { label: "Check My Digital Footprint" }]} />
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Fingerprint className="h-3 w-3 mr-1.5" />Digital Footprint Checker
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Check My Digital Footprint</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your online activity leaves traces across hundreds of platforms — social media profiles, forgotten forum accounts, data broker listings, and breach records. A digital footprint scan reveals exactly what information about you is publicly accessible, so you can take control of your exposure before someone else exploits it.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        {/* ═══════════════ WHAT IS A DIGITAL FOOTPRINT ═══════════════ */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What Is A Digital Footprint</h2>
            <p>
              A digital footprint is the cumulative trail of data you leave behind when using the internet. It encompasses every social media profile you've created, every forum account you've registered, every app you've signed up for, and every data broker that has collected and published information about you. Some traces are intentional — profiles you actively maintain. Others are passive — records aggregated about you without your direct involvement, including tracking cookies, metadata in shared files, and credentials exposed in data breaches.
            </p>
            <p>
              The distinction between active and passive footprints is important. <strong>Active footprints</strong> include social media posts, blog comments, product reviews, and account registrations — data you deliberately put online. <strong>Passive footprints</strong> are generated without your explicit action: data broker aggregation from public records, website analytics tracking, advertising cookies, and credentials leaked through third-party breaches. Both types contribute to a discoverable profile that can be assembled by employers, advertisers, investigators, or malicious actors.
            </p>
            <p>
              The average internet user maintains accounts on between 100 and 130 online services. Many of these are long forgotten — a travel forum joined five years ago, a gaming platform from university, a job board from a previous career. These dormant accounts remain publicly indexed and searchable. They often contain outdated personal information — old addresses, previous employers, photographs — that contributes to a richer, more exploitable identity profile than most people realise.
            </p>
            <p>
              Understanding what constitutes your digital footprint is the essential first step toward managing it. Without visibility into what's publicly accessible, you cannot make informed decisions about which accounts to close, which privacy settings to tighten, or which data broker listings to challenge.
            </p>
          </div>
        </section>

        {/* ═══════════════ WHAT INFORMATION ABOUT YOU EXISTS ONLINE ═══════════════ */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What Information About You Exists Online</h2>
            <p>
              The volume and variety of publicly discoverable personal data is consistently larger than people expect. A comprehensive digital footprint check typically reveals information across several categories, each carrying different levels of risk.
            </p>

            <h3>Social Media Profiles</h3>
            <p>
              Social media accounts are the most visible component of most digital footprints. Platforms like Instagram, Twitter/X, Facebook, TikTok, LinkedIn, and Snapchat all expose public profiles containing usernames, display names, photographs, bios, follower counts, and — depending on privacy settings — post history, location tags, and connections. Even private accounts leak metadata: the fact that an account exists under a specific username is itself a data point that enables cross-platform correlation.
            </p>

            <h3>Old Forum Accounts</h3>
            <p>
              Discussion forums are among the most underestimated sources of personal exposure. Unlike curated social media profiles, forum posts tend to be candid, detailed, and archived indefinitely. Platforms like Reddit, Stack Overflow, Quora, Hacker News, and thousands of niche phpBB and vBulletin communities maintain years of searchable post history tied to persistent usernames. Users frequently disclose personal opinions, locations, technical expertise, health information, and relationship details across years of posting — often without realising this information is permanently indexed.
            </p>

            <h3>Usernames Across Platforms</h3>
            <p>
              Username reuse is the single most powerful cross-platform correlation signal. When the same handle appears on Instagram, GitHub, Reddit, Steam, and a dating site, linking these accounts to a single individual becomes trivial. Our <Link to="/research/username-reuse-report-2026">2026 Username Reuse Report</Link> found that 72% of sampled users shared at least one username across five or more platforms. Each additional platform sharing the same handle exponentially increases the richness of the assembled profile. For a detailed explanation of this risk, see our guide on <Link to="/how-username-reuse-exposes-you-online">how username reuse creates exposure</Link>.
            </p>

            <h3>Public Records</h3>
            <p>
              Public records — voter registrations, property records, court filings, business registrations, and professional licences — are increasingly digitised and searchable. Data brokers like Spokeo, BeenVerified, and MyLife aggregate these records alongside social media data to create comprehensive dossiers that anyone can access for a small fee. These listings often include current and previous addresses, phone numbers, email addresses, estimated income, and family connections.
            </p>

            <h3>Data Breaches</h3>
            <p>
              When a service suffers a data breach, the leaked information — email addresses, passwords, security questions, payment details — enters circulation permanently. Breach databases are widely available to both security researchers and malicious actors. An email address that appears in multiple breaches signals an identity that is both active and potentially vulnerable. FootprintIQ checks breach exposure as part of its standard scan, flagging credentials that may be compromised. For users who have already checked breach exposure elsewhere, our guide on <Link to="/after-have-i-been-pwned-what-next">what to do after Have I Been Pwned</Link> explains the next steps.
            </p>
          </div>
        </section>

        {/* ═══════════════ WHY CHECKING YOUR DIGITAL FOOTPRINT MATTERS ═══════════════ */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Checking Your Digital Footprint Matters</h2>
            <p>
              Publicly visible personal information is the starting point for most targeted attacks and privacy violations. Understanding your exposure is not a theoretical exercise — it has direct, practical consequences for personal safety, professional reputation, and financial security.
            </p>

            <h3>Identity Theft</h3>
            <p>
              Identity theft begins with information gathering. Attackers assemble names, addresses, dates of birth, and account details from public sources to impersonate victims with banks, government agencies, and service providers. The more personal data available publicly, the more convincing the impersonation. A digital footprint scan reveals exactly which pieces of your identity are accessible — allowing you to remove or restrict them before they are exploited.
            </p>

            <h3>Impersonation</h3>
            <p>
              Impersonation attacks use publicly available photographs, bios, and personal details to create fake profiles that mimic a victim's identity. These fake accounts are used for fraud, social engineering, romance scams, and reputation damage. Platforms with public profile photos and bio information — Instagram, LinkedIn, dating sites — are the primary sources for impersonation material.
            </p>

            <h3>Online Stalking</h3>
            <p>
              Stalkers and harassers use digital footprints to track victims across platforms, monitor their activity, and identify physical locations. Username correlation makes this especially dangerous: a stalker who knows one username can discover accounts on dozens of platforms within minutes. Location-tagged posts, check-ins, and geotagged photographs provide physical tracking data that was never intended to be used this way.
            </p>

            <h3>Privacy Exposure</h3>
            <p>
              Even without malicious intent, the sheer volume of publicly accessible personal information creates discomfort and vulnerability. Employers screening candidates, landlords evaluating tenants, insurance companies assessing risk, and advertisers targeting consumers all use publicly available data. A comprehensive digital footprint check reveals what these entities can see — and empowers you to control the narrative.
            </p>
          </div>
        </section>

        {/* ═══════════════ HOW DIGITAL FOOTPRINT SCANNERS WORK ═══════════════ */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Digital Footprint Scanners Work</h2>
            <p>
              Digital footprint scanners use Open Source Intelligence (OSINT) techniques to aggregate publicly available data from hundreds of sources into a unified exposure report. Understanding how these tools work helps you interpret results and make informed decisions about your privacy.
            </p>
            <p>
              <strong>Username enumeration.</strong> The scanner checks whether a given username exists on each platform in its database by probing predictable URL patterns (e.g., <code>instagram.com/username</code>, <code>github.com/username</code>). FootprintIQ uses multiple scanning engines — including Sherlock, Maigret, and WhatsMyName — in parallel to maximise coverage and reduce false negatives. Each tool has different platform support and detection methods; combining their outputs produces broader, more reliable results than any single tool alone.
            </p>
            <p>
              <strong>False-positive filtering.</strong> Raw username enumeration results are noisy. A common handle like "alex" will match hundreds of accounts belonging to different people. FootprintIQ applies confidence scoring, page-type analysis, profile metadata comparison, and AI-assisted filtering to distinguish genuine identity matches from coincidental overlaps. Results are categorised by confidence level — high, medium, low — so you can prioritise your review.
            </p>
            <p>
              <strong>Cross-platform correlation.</strong> The real intelligence value comes from correlation. If the same username appears on GitHub, Twitter, and Steam with consistent profile photos or bio text, the scanner flags this as a likely identity cluster. This correlation step transforms a flat list of platform matches into a connected intelligence picture — revealing patterns that individual platform searches would miss.
            </p>
            <p>
              <strong>Breach and data broker checks.</strong> Beyond username enumeration, comprehensive scanners query breach databases and data broker APIs to identify email addresses, passwords, and personal details that have been exposed through third-party incidents. This provides a complete picture of both active exposure (accounts you maintain) and passive exposure (data leaked about you).
            </p>
            <p>
              All FootprintIQ scans use ethical, publicly accessible methods. No accounts are accessed, no passwords are tested, and no platforms are notified during a scan.
            </p>
          </div>
        </section>

        {/* ═══════════════ DIGITAL EXPOSURE SCORE ═══════════════ */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg dark:prose-invert mb-8">
              <h2>Understanding Your Digital Exposure Score</h2>
              <p>
                FootprintIQ quantifies your online visibility into a single metric: the <strong>Digital Exposure Score</strong>. Scored from 0 to 100, it measures how discoverable and exploitable your personal information is across the public internet. A higher score means greater exposure — and greater urgency to act.
              </p>
            </div>

            {/* Score display */}
            <div className="rounded-2xl border border-border bg-card p-8 mb-8">
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground mb-2 font-medium uppercase tracking-wide">Example Digital Exposure Score</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-6xl md:text-7xl font-bold text-orange-500">72</span>
                  <span className="text-2xl text-muted-foreground font-medium">/ 100</span>
                </div>
                <p className="text-sm text-orange-500 font-medium mt-2">High Exposure</p>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-4 max-w-lg mx-auto">
                {[
                  { label: "Profiles detected", value: 14, max: 20, color: "bg-primary" },
                  { label: "Data breaches", value: 3, max: 5, color: "bg-destructive" },
                  { label: "Public usernames", value: 8, max: 12, color: "bg-yellow-500" },
                  { label: "Exposed personal information", value: 5, max: 8, color: "bg-orange-500" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.value} found</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert">
              <h3>What Each Factor Means</h3>
              <p>
                <strong>Profiles detected</strong> counts the number of platforms where your username, email, or phone number was found on a public-facing profile page. More profiles mean more entry points for data collection and social engineering.
              </p>
              <p>
                <strong>Data breaches</strong> reflects how many known breach databases contain your credentials or personal details. Each breach increases the likelihood that your passwords, security questions, or payment information have been circulated among attackers.
              </p>
              <p>
                <strong>Public usernames</strong> measures how many distinct platforms share the same handle. Username reuse is the strongest cross-platform correlation signal — it allows anyone to link otherwise disconnected accounts into a single identity profile within minutes.
              </p>
              <p>
                <strong>Exposed personal information</strong> captures the presence of sensitive data — real names, addresses, phone numbers, email addresses, photographs — in data broker listings, people-search sites, and public directories. This is the category most directly linked to identity theft and impersonation risk.
              </p>

              <h3>Score Tiers</h3>
              <p>
                The score maps to five risk tiers: <strong>Low</strong> (0–20), <strong>Moderate</strong> (21–40), <strong>High</strong> (41–60), <strong>Very High</strong> (61–80), and <strong>Critical</strong> (81–100). Each tier reflects the combined density of discoverable signals and the ease with which an attacker could assemble a usable identity profile from public sources.
              </p>

              <h3>How To Lower Your Score</h3>
              <p>
                Reducing your Digital Exposure Score follows the <strong>Scan → Act → Verify → Measure</strong> lifecycle. After your initial scan identifies exposure, take action: delete dormant accounts, opt out of data brokers, switch to unique usernames per platform, and tighten privacy settings. Then verify by re-scanning to confirm removals took effect. Finally, measure your progress over time — Pro users can track their score trend and receive alerts when new exposure is detected.
              </p>
              <p>
                Every finding you mark as resolved or remove from public view directly reduces your score. FootprintIQ Pro tracks these changes through the Exposure Resolution Timeline, showing measurable privacy improvement over weeks and months.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Find out your real score — run a free scan now.</p>
              <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
                <Link to="/scan">
                  <Search className="w-5 h-5 mr-2" />
                  Check My Exposure Score
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Check Your Digital Footprint</h2>
            <p>
              Checking your digital footprint with FootprintIQ takes less than five minutes. Follow these steps to get a clear picture of your online exposure.
            </p>
            <ol>
              <li>
                <strong>Start with your primary username.</strong> Enter the username you use most frequently — typically your social media handle — into FootprintIQ's <Link to="/usernames">username search tool</Link>. The platform will scan 500+ public sources to identify where that handle appears.
              </li>
              <li>
                <strong>Review your results.</strong> The exposure report shows every platform where your username was detected, along with confidence scores indicating match reliability. High-confidence results have been validated against multiple signals; low-confidence results may be coincidental and warrant manual review.
              </li>
              <li>
                <strong>Scan additional identifiers.</strong> Repeat the process with your email address and, if applicable, phone number. Each identifier reveals different aspects of your exposure. Email scans surface breach records and newsletter subscriptions; phone scans identify directory listings and messaging app registrations.
              </li>
              <li>
                <strong>Run a reverse username search.</strong> Use FootprintIQ's <Link to="/reverse-username-search">reverse username lookup</Link> to trace connections between handles. If you've used different usernames on different platforms, this step reveals whether those handles can still be linked to the same identity through shared metadata.
              </li>
              <li>
                <strong>Assess your exposure.</strong> Use the <Link to="/digital-footprint-checker">digital footprint checker</Link> to generate a comprehensive exposure score. Pro users receive an Identity Risk Score that quantifies their overall exposure based on signal volume, breach history, and cross-platform correlation patterns.
              </li>
              <li>
                <strong>Explore the username search engine.</strong> For a deeper understanding of how multi-tool scanning works at scale, visit the <Link to="/username-search-engine">username search engine</Link> page, which explains FootprintIQ's scanning pipeline and the OSINT tools it orchestrates.
              </li>
            </ol>
            <p>
              Free scans reveal platform matches and signal counts. Pro scans unlock full correlation analysis, breach-specific context, remediation roadmaps, and continuous monitoring alerts.
            </p>

            {/* Risk Gauge Teaser */}
            <div className="not-prose my-8">
              <BlurredRiskGauge
                signalsCount={7}
                highConfidenceCount={3}
                exposuresCount={2}
                scoreOverride={61}
                contextLabel="Moderate exposure from legacy accounts"
              />
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW TO REDUCE YOUR DIGITAL FOOTPRINT ═══════════════ */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Reduce Your Digital Footprint</h2>
            <p>
              Reducing your digital footprint is a systematic, ongoing process — not a one-time action. It involves auditing your current exposure, removing unnecessary data, and establishing monitoring to catch new risks as they appear. The following steps provide a practical, prioritised framework.
            </p>
            <div className="not-prose space-y-4 my-6">
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
            <p>
              For a comprehensive walkthrough of the data broker removal process, see our <Link to="/privacy/data-broker-removal-guide">data broker removal guide</Link>. If you've recently discovered breach exposure, our <Link to="/data-breach-cleanup-checklist">data breach cleanup checklist</Link> provides a structured response framework.
            </p>
            <p>
              Start your audit now with the <Link to="/usernames">username search tool</Link>, run a <Link to="/reverse-username-search">reverse username lookup</Link>, check your overall exposure with the <Link to="/digital-footprint-checker">digital footprint checker</Link>, or explore the <Link to="/username-search-engine">username search engine</Link> to understand how multi-tool scanning works at scale.
            </p>
          </div>
        </section>

        {/* ═══════════════ FAQs ═══════════════ */}
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
};

export default CheckMyDigitalFootprint;
