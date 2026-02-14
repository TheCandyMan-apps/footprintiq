import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/after-have-i-been-pwned-what-next";

const webPageSchema = buildWebPageSchema({
  name: "Checked Have I Been Pwned? Here's What To Do Next | FootprintIQ",
  description:
    "Found in a data breach? Learn what to do after Have I Been Pwned — secure accounts, map your full digital exposure, and take control of your privacy with FootprintIQ.",
  url: PAGE_URL,
  datePublished: "2026-02-12",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is FootprintIQ a breach checker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ is an ethical digital footprint intelligence platform. While breach signals are one data point, the primary focus is mapping your full public exposure — including username reuse, data broker listings, and public searchability across hundreds of platforms. FootprintIQ picks up where breach checking ends.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need both Have I Been Pwned and FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They complement each other. Have I Been Pwned tells you which breaches included your email. FootprintIQ maps the broader picture — where your identity is publicly visible, how identifiers connect across platforms, and what steps to take to reduce your exposure. Together, they provide a complete view of your digital risk.",
      },
    },
    {
      "@type": "Question",
      name: "What if I already use Have I Been Pwned?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "That means you've completed step one. FootprintIQ picks up where breach checking ends by scanning for username reuse, data broker listings, and public profile visibility. It turns breach awareness into a structured, prioritised remediation plan.",
      },
    },
    {
      "@type": "Question",
      name: "What does FootprintIQ do that breach checkers don't?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Breach checkers tell you what was leaked in past incidents. FootprintIQ maps what is publicly visible right now — across social platforms, data brokers, search engines, and public records. It also detects username reuse patterns, scores your overall exposure, and provides a prioritised remediation roadmap.",
      },
    },
    {
      "@type": "Question",
      name: "Is FootprintIQ free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — FootprintIQ offers free scans that reveal where your digital exposure exists. Pro plans provide deeper intelligence, false-positive filtering, exposure trend tracking, and structured remediation guidance.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ access private data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ only analyses publicly accessible information. The platform operates under a strict Ethical OSINT Charter — no private database access, no scraping behind logins, and no data brokerage. All intelligence is derived from public-data OSINT.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "After Have I Been Pwned", item: PAGE_URL },
  ],
};

const comparisonRows = [
  { feature: "Primary Focus", hibp: "Breach database lookup", fiq: "Full public exposure mapping" },
  { feature: "Data Sources", hibp: "Single breach index", fiq: "Hundreds of platforms & brokers" },
  { feature: "Approach", hibp: "Reactive — after breach occurs", fiq: "Proactive intelligence layer" },
  { feature: "Username Analysis", hibp: "Not included", fiq: "Cross-platform reuse detection" },
  { feature: "Data Broker Check", hibp: "Not included", fiq: "People-search & broker scanning" },
  { feature: "Exposure Scoring", hibp: "Not included", fiq: "Risk-weighted scoring system" },
  { feature: "Remediation Plan", hibp: "Not included", fiq: "Prioritised removal roadmap" },
  { feature: "Ethical OSINT Framework", hibp: "Not applicable", fiq: "Published Ethical Charter" },
  { feature: "Free Tier", hibp: "Yes", fiq: "Yes" },
];

const AfterHaveIBeenPwned = () => {
  return (
    <>
      <Helmet>
        <title>Checked Have I Been Pwned? Here's What To Do Next | FootprintIQ</title>
        <meta
          name="description"
          content="Found in a data breach? Learn what to do after Have I Been Pwned — secure accounts, map your full digital exposure, and take control of your privacy with FootprintIQ."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Checked Have I Been Pwned? Here's What To Do Next | FootprintIQ" />
        <meta property="og:description" content="Checking breaches is step one. Mapping your full digital footprint is step two." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">After Have I Been Pwned</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Beyond Breach Checking</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Found in a Data Breach?{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Here's What To Do Next.
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Checking breaches is step one. Understanding your full digital exposure is step two. Here's how to move from awareness to action.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Run Your Ethical Footprint Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── What a Breach Result Means ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What a Breach Result Actually Means</h2>
            <p>
              If you've checked your email address on <strong>Have I Been Pwned</strong> (HIBP) and found it listed in one or more breaches, you're not alone. Troy Hunt's breach notification service has catalogued over 700 publicly known data breaches, covering billions of records. Finding your email in a breach means that a service you used at some point was compromised, and your data — which may include email addresses, passwords, IP addresses, or even physical addresses — was exposed.
            </p>
            <p>
              However, a breach result is a snapshot of the past. It tells you what leaked and when. It does <strong>not</strong> tell you what's publicly visible about you right now, where your identity can be found across the internet today, or how that exposure could be used to target you.
            </p>
            <p>
              That distinction matters. Breach checking is essential — but it's only the beginning of a proper digital risk assessment.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">Why Breach Checks Are Only Step One</h2>
            <p>
              The value of Have I Been Pwned is clear: it provides immediate awareness. You know which services were compromised, what data categories were exposed (emails, passwords, phone numbers), and whether your credentials appeared in paste dumps. This is critical information for anyone serious about personal security.
            </p>
            <p>
              But breach data represents a <strong>historical</strong> view of risk. The internet doesn't stand still. Your digital footprint — the sum of your public profiles, usernames, forum posts, data broker listings, and indexed content — changes continuously. New profiles are created, old accounts are forgotten, and data brokers aggregate information from public records and commercial databases without your awareness.
            </p>
            <p>
              A breach check answers: <em>"Was my data leaked?"</em> A digital footprint scan answers: <em>"What can someone find about me right now?"</em> Both are important. Together, they provide a complete picture of your digital exposure.
            </p>

            <h2 className="text-3xl font-bold mt-12 mb-4">Password Hygiene and Two-Factor Authentication</h2>
            <p>
              If your email appears in a breach result, the first priority is securing your accounts. Start with these immediate actions:
            </p>
            <ul>
              <li><strong>Change compromised passwords immediately.</strong> If you reused the breached password on other services, change those too. Every account should have a unique, strong password.</li>
              <li><strong>Use a password manager.</strong> Tools like Bitwarden, 1Password, or KeePass generate and store unique passwords for every service, eliminating the temptation to reuse credentials.</li>
              <li><strong>Enable two-factor authentication (2FA) on every account that supports it.</strong> App-based authenticators (such as Authy or Google Authenticator) are more secure than SMS-based 2FA, which can be vulnerable to SIM-swap attacks.</li>
              <li><strong>Review active sessions.</strong> Most major platforms (Google, Microsoft, Facebook) allow you to see where your account is currently logged in. Revoke any sessions you don't recognise.</li>
              <li><strong>Check email forwarding rules.</strong> Attackers sometimes set up silent email forwarding. Verify your email account settings to ensure no unauthorised forwarding rules exist.</li>
            </ul>
            <p>
              These steps address the direct consequences of a breach. But they don't address the broader exposure that exists beyond compromised credentials.
            </p>
          </div>
        </section>

        {/* ── Digital Footprint Risk Beyond Breaches ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Digital Footprint Risk Beyond Breaches</h2>
            <p>
              Breach exposure is one dimension of digital risk. But your public digital footprint extends far beyond leaked databases. Here are the exposure categories that breach checkers simply don't cover:
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Username Reuse</h3>
            <p>
              If you use the same username across multiple platforms, anyone who finds one profile can easily discover others. Username reuse creates a chain of linked identities that makes it trivial to build a comprehensive profile of your online activity. <Link to="/how-it-works" className="text-accent hover:underline">FootprintIQ's scanning pipeline</Link> detects these cross-platform connections automatically.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Data Broker Exposure</h3>
            <p>
              People-search sites and data brokers aggregate public records, social media data, and commercial databases to create detailed profiles. Your name, address, phone number, and sometimes even income estimates may be listed. These listings exist independently of any breach — they're built from publicly accessible sources. Removing yourself from data brokers requires identifying which sites list you and submitting individual opt-out requests.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Search Engine Indexing</h3>
            <p>
              Search engines index public profiles, forum posts, blog comments, and mentions across the web. Content you posted years ago may still appear in search results. Cached versions of deleted profiles can persist. Understanding what appears when someone searches your name is a critical part of exposure assessment.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">Aggregated Identity Risk</h3>
            <p>
              Individual data points — a username here, a profile photo there, a forum post from 2018 — may seem harmless in isolation. But when aggregated, they create a detailed identity profile. Threat actors, social engineers, and even unethical marketers can use this aggregated data to target individuals. The more data points that exist publicly, the higher the risk.
            </p>
            <p>
              This is why <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> exists. It maps these exposure categories comprehensively, providing a structured view of your public digital presence that no breach checker can offer.
            </p>
          </div>
        </section>

        {/* ── The 3-Step Risk Flow ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The 3-Step Digital Risk Flow
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From breach awareness to full exposure intelligence — a practical framework for taking control of your digital privacy.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: "01",
                  title: "Check Breach Databases",
                  tool: "Have I Been Pwned / Mozilla Monitor",
                  desc: "Start with breach awareness. Enter your email address into Have I Been Pwned or Mozilla Monitor to discover which data breaches included your credentials. This gives you a clear picture of what has been leaked in past incidents — the essential first step in any digital risk assessment.",
                  color: "text-yellow-500",
                  bg: "bg-yellow-500/10",
                },
                {
                  step: "02",
                  title: "Secure Accounts + Enable 2FA",
                  tool: "Password Manager + Authenticator App",
                  desc: "Change every compromised password immediately. Use a password manager to generate unique credentials for each service. Enable two-factor authentication wherever possible — preferably app-based, not SMS. Review active sessions and revoke anything unfamiliar. This step contains the damage from known breaches.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  step: "03",
                  title: "Map Your Full Public Exposure",
                  tool: "FootprintIQ",
                  desc: "Go beyond breaches. Discover where your username, email, and identity appear publicly — across social platforms, data brokers, search engines, and public records. FootprintIQ provides a prioritised remediation roadmap so you know exactly what to address first and why.",
                  color: "text-accent",
                  bg: "bg-accent/10",
                  cta: true,
                },
              ].map((s) => (
                <div
                  key={s.step}
                  className="flex gap-6 items-start rounded-xl border border-border/50 bg-card p-6 md:p-8 hover:border-accent/30 transition-all duration-200"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <span className={`text-xl font-bold ${s.color}`}>{s.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{s.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground/60 mb-2 uppercase tracking-wider">
                      {s.tool}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                    {s.cta && (
                      <Button asChild variant="outline" size="sm" className="mt-4">
                        <Link to="/run-scan">
                          Start Mapping <ArrowRight className="ml-1.5 w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Have I Been Pwned{" "}
                <span className="text-muted-foreground font-normal">vs</span>{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">FootprintIQ</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Different tools, complementary purposes. Here's how they compare across key capabilities.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              <div className="grid grid-cols-3 bg-muted/40 border-b border-border/50">
                <div className="p-4 text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="p-4 text-sm font-semibold text-center">Have I Been Pwned</div>
                <div className="p-4 text-sm font-semibold text-center text-accent">FootprintIQ</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                    {row.hibp === "Not included" || row.hibp === "Not applicable" ? (
                      <>
                        <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-muted-foreground/60">{row.hibp}</span>
                      </>
                    ) : (
                      row.hibp
                    )}
                  </div>
                  <div className="p-4 text-sm text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="font-medium">{row.fiq}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto mt-8 prose prose-lg dark:prose-invert">
              <p>
                Have I Been Pwned is an excellent, free resource — and we recommend it as the starting point for anyone concerned about data breaches. FootprintIQ is designed to work alongside breach checkers, not replace them. While HIBP answers <em>"Was my data leaked?"</em>, FootprintIQ answers <em>"What can someone find about me right now?"</em> — providing the intelligence layer that turns awareness into structured action.
              </p>
              <p>
                FootprintIQ operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>, ensuring all intelligence is derived from publicly accessible sources with full transparency. Learn more about <Link to="/how-it-works" className="text-accent hover:underline">how our scanning pipeline works</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.acceptedAnswer.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Go Beyond Breach Checking?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Discover where your identity is publicly visible — and get a prioritised plan to reduce your exposure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Ethical Footprint Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer Reinforcement Block ── */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AfterHaveIBeenPwned;