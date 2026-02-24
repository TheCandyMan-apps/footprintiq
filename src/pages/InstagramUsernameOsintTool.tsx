import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, Camera, Check, X, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What is Instagram username OSINT?",
    answer: "Instagram username OSINT (Open-Source Intelligence) is the process of gathering publicly available information associated with an Instagram handle. This includes checking whether the username exists on Instagram, finding the same handle across other platforms, and mapping the digital footprint created by username reuse. FootprintIQ performs this analysis ethically using only public data sources.",
  },
  {
    question: "Can you find someone's Instagram by username?",
    answer: "Yes. You can verify whether an Instagram profile exists by searching the username. FootprintIQ goes further by checking where that same username appears across 500+ platforms — revealing connected social media, gaming, forum, and developer accounts that share the same handle.",
  },
  {
    question: "Is Instagram username OSINT legal?",
    answer: "Yes. Searching for publicly available information about a username is legal in most jurisdictions. FootprintIQ only accesses public data — we don't bypass login walls, scrape private content, or use surveillance techniques. Our approach aligns with GDPR and responsible OSINT principles.",
  },
  {
    question: "What does a Pro scan reveal that Free doesn't?",
    answer: "A Free scan provides a snapshot of up to 10 platform matches. Pro scans unlock full platform coverage across 500+ sites, exposure prioritisation scoring, removal pathway mapping, curated opt-out database access, exportable remediation plans, and historical tracking to monitor exposure changes over time.",
  },
  {
    question: "How does username reuse increase my risk?",
    answer: "When you use the same username across multiple platforms, anyone who knows one of your accounts can discover all the others. This links your gaming profiles to professional accounts, dating profiles to social media, and forgotten forums to active identities — creating a traceable digital footprint.",
  },
  {
    question: "Can FootprintIQ access private Instagram accounts?",
    answer: "No. FootprintIQ only confirms whether a username exists on Instagram and checks public profile information. We never attempt to access private content, bypass authentication, or violate platform terms of service. Our value lies in cross-platform correlation, not single-platform surveillance.",
  },
  {
    question: "How accurate are Instagram OSINT scan results?",
    answer: "Accuracy depends on username specificity. Common usernames generate more false positives. FootprintIQ uses LENS, our AI confidence analysis engine, to score each match and reduce false positives. Pro users receive additional verification guidance and false-positive filtering.",
  },
  {
    question: "How often should I scan my Instagram username?",
    answer: "We recommend scanning quarterly, or whenever you change your username, create new accounts, or suspect exposure from a data breach. Pro users can set up continuous monitoring to receive alerts when new exposure is detected.",
  },
];

const COMPARISON_DATA = [
  { feature: "Platform matches", free: "Up to 10", pro: "500+ platforms" },
  { feature: "Confidence scoring", free: "Basic", pro: "LENS AI-powered" },
  { feature: "False-positive filtering", free: "—", pro: "✓" },
  { feature: "Exposure prioritisation", free: "—", pro: "✓" },
  { feature: "Removal pathway mapping", free: "—", pro: "✓" },
  { feature: "Curated opt-out database", free: "—", pro: "✓" },
  { feature: "Exportable reports", free: "—", pro: "✓" },
  { feature: "Historical tracking", free: "—", pro: "✓" },
  { feature: "Risk trend monitoring", free: "—", pro: "✓" },
];

export default function InstagramUsernameOsintToolPage() {
  const origin = "https://footprintiq.app";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Instagram Username OSINT – How to Search & Analyse Instagram Usernames",
    description: "Learn how to use Instagram username OSINT to map digital exposure. Free and Pro scanning, cross-platform correlation, and ethical methodology explained.",
    url: `${origin}/instagram-username-search-tool`,
    datePublished: "2026-02-24",
    dateModified: "2026-02-24",
    author: { "@type": "Organization", name: "FootprintIQ", url: origin },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${origin}/instagram-username-search-tool` },
    inLanguage: "en",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Instagram Username OSINT Tool", item: `${origin}/instagram-username-search-tool` },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Run an Instagram Username OSINT Scan",
    description: "Step-by-step guide to scanning an Instagram username across platforms using FootprintIQ.",
    step: [
      { "@type": "HowToStep", position: 1, name: "Enter the username", text: "Type the Instagram username you want to analyse into the search field." },
      { "@type": "HowToStep", position: 2, name: "Run the scan", text: "Click scan to check the username across 500+ platforms." },
      { "@type": "HowToStep", position: 3, name: "Review matches", text: "Examine the cross-platform matches, confidence scores, and exposure level." },
      { "@type": "HowToStep", position: 4, name: "Take action", text: "Use the results to understand your exposure and follow removal pathways (Pro)." },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Instagram Username OSINT Tool – Search & Analyse Instagram Usernames | FootprintIQ</title>
        <meta name="description" content="Use our Instagram username OSINT tool to search Instagram usernames across 500+ platforms. Map digital exposure, detect username reuse, and get removal guidance. Free and Pro scanning." />
        <link rel="canonical" href={`${origin}/instagram-username-search-tool`} />
        <meta property="og:title" content="Instagram Username OSINT Tool – Search & Analyse Instagram Usernames | FootprintIQ" />
        <meta property="og:description" content="Search Instagram usernames across 500+ platforms. Map digital exposure, detect username reuse, and get actionable privacy intelligence." />
        <meta property="og:url" content={`${origin}/instagram-username-search-tool`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Camera className="h-3 w-3 mr-1.5" />
              Instagram OSINT Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Instagram Username OSINT
              <span className="block text-primary mt-2">Search, Analyse &amp; Map Exposure</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Enter any Instagram username to discover where it appears across 500+ platforms.
              Map cross-platform exposure, detect username reuse patterns, and get actionable
              privacy intelligence — all using ethical OSINT methods.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                500+ platforms scanned
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                AI confidence scoring
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Ethical &amp; privacy-first
              </span>
            </div>
          </div>
        </section>

        {/* What is Instagram Username OSINT? */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">What Is Instagram Username OSINT?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Instagram username OSINT is the practice of using open-source intelligence techniques to gather
              publicly available information about an Instagram handle. Unlike simple profile lookups, OSINT
              analysis maps where a username appears across the entire internet — revealing connected accounts,
              exposure patterns, and digital footprint risks that a single-platform search would miss.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              FootprintIQ automates this process by scanning an Instagram username across 500+ platforms,
              including social media, gaming networks, forums, developer sites, and data broker listings.
              Results are scored using our LENS AI confidence engine to reduce false positives and prioritise
              genuine matches.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This approach is useful for self-auditing your own digital exposure, verifying account ownership,
              or conducting authorised investigations within ethical and legal boundaries. Learn more about
              the <Link to="/ai-answers/instagram-username-osint" className="text-primary hover:underline">fundamentals of Instagram username OSINT</Link>.
            </p>
          </div>
        </section>

        {/* Why Does Instagram Username Search Matter? */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">Why Does Instagram Username Search Matter for Privacy?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most Instagram users don't realise that their username creates a traceable thread across the internet.
              When the same handle appears on TikTok, Twitter, Reddit, gaming platforms, and professional sites,
              anyone can connect those identities — revealing personal interests, locations, employment history,
              and relationship patterns from a single starting point.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Understanding this exposure is the first step toward controlling it. FootprintIQ shows you exactly
              what's visible — without surveillance or invasive methods. According to our
              <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline ml-1">
                2026 Username Reuse Research
              </Link>, <strong>89% of data broker entries</strong> reference outdated information — yet these records persist
              indefinitely unless explicitly removed. Read our full guide on
              <Link to="/how-username-reuse-exposes-you-online" className="text-primary hover:underline ml-1">
                how username reuse exposes you online
              </Link>.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Cross-Platform Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    See where your Instagram handle appears on 500+ platforms — social media, forums, gaming networks, and developer sites.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Identity Correlation</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover how your Instagram username links your professional, personal, and anonymous accounts into one traceable identity.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Risk Awareness</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand your exposure level before a stalker, employer, or threat actor does. Knowledge is the first line of defence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How Does It Work? */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">How Does Instagram Username OSINT Work?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ uses a multi-tool scanning pipeline to check an Instagram username across platforms.
              The process is automated, ethical, and designed to produce actionable intelligence in minutes.
            </p>
            <div className="space-y-4">
              {[
                { step: "1", title: "Username Input", desc: "Enter the Instagram username you want to investigate. No login or account access required." },
                { step: "2", title: "Multi-Platform Scan", desc: "Our OSINT pipeline checks the username across 500+ platforms using Maigret, Sherlock, WhatsMyName, and proprietary scanners." },
                { step: "3", title: "AI Confidence Scoring", desc: "Each match is scored by LENS, our AI confidence engine, to filter false positives and prioritise genuine results." },
                { step: "4", title: "Exposure Report", desc: "Results are presented in a structured exposure report showing platform matches, risk levels, and (for Pro) removal pathways." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mid-Page CTA */}
        <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to See Your Instagram Exposure?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Enter your Instagram username to discover where it appears across 500+ platforms.
              Free scan results in under 60 seconds. No login required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/scan">
                  Run Free Instagram Scan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">
                  Compare Free vs Pro
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Public sources only · Ethical OSINT · No login required
            </p>
          </div>
        </section>

        {/* Free vs Pro Comparison */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-4 text-center">Free vs Pro Instagram OSINT Scan</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              Free scans show where exposure exists. Pro scans explain how identifiers connect
              and provide evidence for removal.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Feature</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold">Free</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-primary">
                      <span className="flex items-center justify-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" /> Pro
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_DATA.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm">{row.feature}</td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">
                        {row.free === "—" ? (
                          <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          row.free
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {row.pro === "✓" ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-primary font-medium">{row.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <Button size="lg" asChild>
                <Link to="/pricing">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade to Pro Intelligence
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What Can You Learn */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">What Can You Learn from an Instagram Username?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A single Instagram username can reveal far more than a profile picture and bio. When
              searched across the internet, that handle often exposes a network of connected identities,
              forgotten accounts, and data broker listings that collectively form a detailed digital
              footprint.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Social media accounts", desc: "TikTok, Twitter/X, Reddit, Snapchat, and platform-specific communities using the same handle." },
                { title: "Gaming profiles", desc: "Steam, Xbox, PlayStation, Discord, and gaming forum accounts tied to the username." },
                { title: "Professional presence", desc: "GitHub, Stack Overflow, LinkedIn, and portfolio sites linked through username reuse." },
                { title: "Forum & community posts", desc: "Old forum accounts, niche communities, and archived discussions under the same username." },
                { title: "Data broker listings", desc: "People-search and data aggregator sites that have indexed the username alongside personal data." },
                { title: "Dating platform exposure", desc: "Dating site profiles using the same handle, potentially linking anonymous accounts to real identities." },
              ].map((item, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Who Should Use This */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6">Who Should Use an Instagram Username OSINT Tool?</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Individuals Checking Their Own Exposure</h3>
                <p className="text-muted-foreground">
                  If you've ever used the same username across platforms, scanning it reveals your full digital footprint.
                  This is the most common use case — understanding what's publicly visible before a potential employer, 
                  date, or threat actor finds it first.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Security Professionals & OSINT Practitioners</h3>
                <p className="text-muted-foreground">
                  For authorised investigations, username OSINT provides rapid cross-platform reconnaissance.
                  FootprintIQ automates what would otherwise require running multiple CLI tools manually — 
                  with AI-powered false-positive filtering built in.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Parents & Guardians</h3>
                <p className="text-muted-foreground">
                  Understanding where a child's Instagram username appears online helps identify accounts 
                  on platforms that may not be age-appropriate. Always use with the account holder's knowledge 
                  and consent.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Second CTA */}
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-6">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-lg font-semibold mb-2">Want the full picture?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Pro Intelligence unlocks full platform coverage, removal pathways, and exportable reports.
              </p>
              <Button asChild size="lg">
                <Link to="/pricing">
                  See Pro Plans <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* About FootprintIQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* Citation Block */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto px-6">
            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ is an independent, ethical digital footprint intelligence platform. It maps public
                exposure using open-source intelligence techniques and does not monitor, surveil, or access
                private accounts. Content on this page is educational and intended for self-assessment and
                authorised research only. Licensed under CC BY 4.0.
              </p>
            </aside>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Related: <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> ·{" "}
              <Link to="/ai-answers/instagram-username-osint" className="text-primary hover:underline">Instagram Username OSINT Explained</Link> ·{" "}
              <Link to="/how-username-reuse-exposes-you-online" className="text-primary hover:underline">How Username Reuse Exposes You</Link> ·{" "}
              <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Tools: <Link to="/search-username" className="text-primary hover:underline">Search Username</Link> ·{" "}
              <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Search</Link> ·{" "}
              <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter Search</Link> ·{" "}
              <Link to="/pricing" className="text-primary hover:underline">Pricing</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search Your Instagram Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter your username above or start a full scan. Free results in under 60 seconds.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Start Instagram OSINT Scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
