import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, Camera, AlertTriangle, Fingerprint } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";

const PRIVACY_TIPS = [
  "Switch your account to private to control who sees your posts",
  "Disable 'Show activity status' to hide when you're online",
  "Review 'Accounts you follow' visibility in privacy settings",
  "Remove your profile from third-party apps in Security settings",
  "Consider unlinking Facebook to reduce cross-platform data sharing",
];

const FAQS = [
  {
    question: "Can someone find my other accounts using my Instagram username?",
    answer: "If you reuse the same username across platforms, it may be possible to identify linked accounts through publicly indexed data. A cross-platform username search reveals these connections, helping you understand and reduce your exposure.",
  },
  {
    question: "Is Instagram username searching legal?",
    answer: "Yes. Analysing publicly available information — such as whether a username exists on a platform — is legal. FootprintIQ only accesses public data and does not bypass privacy settings or access protected content.",
  },
  {
    question: "Does this access private Instagram accounts?",
    answer: "No. Only publicly available information is analysed. We can confirm if a username exists on Instagram, but we cannot view private content, stories, or direct messages. Our Ethical OSINT Charter prohibits accessing non-public data.",
  },
  {
    question: "Can I remove my digital footprint?",
    answer: "You can reduce exposure by removing or anonymising old accounts, using unique usernames per platform, and adjusting privacy settings. A digital footprint scan identifies where to focus your efforts.",
  },
  {
    question: "How often should I check my Instagram exposure?",
    answer: "Periodic checks are recommended — particularly before job applications, after data breaches, or when creating a new professional brand. Digital exposure changes as platforms update indexing and privacy defaults.",
  },
];

export default function InstagramUsernameSearchPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Instagram Username Search", item: "https://footprintiq.app/instagram-username-search" },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FootprintIQ Instagram Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", ratingCount: "312", bestRating: "5" },
    description: "Find Instagram usernames and user profiles across 500+ platforms. Free Instagram user search and account finder tool.",
  };

  return (
    <>
      <Helmet>
        <title>Instagram Username Search – Check Linked Accounts & Exposure | FootprintIQ</title>
        <meta name="description" content="Search Instagram usernames to find linked accounts and public exposure across 500+ platforms. Free Instagram username lookup and digital footprint intelligence tool." />
        <link rel="canonical" href="https://footprintiq.app/instagram-username-search" />
        <meta property="og:title" content="Instagram Username Search – Check Linked Accounts & Exposure | FootprintIQ" />
        <meta property="og:description" content="Find Instagram profiles, check linked accounts, and discover cross-platform exposure. Free instant results." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={productSchema} />

      <Header />

      <main>
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Camera className="h-3 w-3 mr-1.5" />
              Instagram Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Instagram Username Search
              <span className="block text-primary mt-2">Check Linked Accounts &amp; Public Exposure</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Instagram usernames are often reused across multiple platforms. If you use the same handle on Discord, Reddit, TikTok, or forums, it may create visible links between accounts.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              An Instagram username search helps identify publicly indexed profiles and potential digital footprint exposure.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Instagram profile check
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Cross-platform scan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Free instant results
              </span>
            </div>
          </div>
        </section>

        {/* What Is an Instagram Username Search */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">What Is an Instagram Username Search?</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
              <p>An Instagram username search checks whether a handle appears:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>On other social media platforms</li>
                <li>In public forum posts</li>
                <li>In archived content</li>
                <li>In breach-related datasets</li>
                <li>In indexed search results</li>
              </ul>
              <p>
                Because usernames are frequently reused, they can act as identity anchors — connecting disparate accounts into a single discoverable profile. FootprintIQ checks a username across <Link to="/usernames" className="text-primary hover:underline font-medium">500+ platforms</Link> simultaneously.
              </p>
            </div>
          </div>
        </section>

        {/* Why Username Reuse Creates Risk */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Why Username Reuse Creates Risk</h2>
            <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
              <p>Using the same Instagram handle across platforms can:</p>
              <div className="grid sm:grid-cols-2 gap-4 my-6">
                {[
                  { icon: Users, text: "Connect personal and professional identities" },
                  { icon: AlertTriangle, text: "Increase impersonation risk" },
                  { icon: Eye, text: "Reveal old or forgotten accounts" },
                  { icon: Fingerprint, text: "Expose forgotten content and activity" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card">
                    <Icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{text}</p>
                  </div>
                ))}
              </div>
              <p>
                A structured search allows you to understand exposure patterns before they become a liability. Learn more about <Link to="/username-reuse-risk" className="text-primary hover:underline">username reuse risk</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">How FootprintIQ's Instagram Username Search Works</h2>
            <div className="space-y-4">
              {[
                "Enter an Instagram username",
                "Scan across publicly indexed data sources",
                "Identify cross-platform matches",
                "Highlight exposure indicators",
                "Provide privacy recommendations",
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                The platform does not access private Instagram data or bypass any restrictions. Only publicly available information is analysed.
              </p>
            </div>
          </div>
        </section>

        {/* What We Find (Cards) */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              What Our Instagram Username Search Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Profile Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Confirm if an Instagram account exists with that exact username. Quick verification without needing to log in.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Linked Accounts</h3>
                  <p className="text-sm text-muted-foreground">
                    Find where the same username appears on TikTok, Twitter, Reddit, gaming platforms, and 500+ other sites.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Digital Footprint</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how one Instagram handle connects to a person's entire online presence across platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Instagram vs General Tools */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Instagram vs General Username Search Tools</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border p-6 bg-card">
                <h3 className="font-semibold mb-3 text-foreground">Basic Username Tools</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><span className="text-muted-foreground/50">—</span> Check limited availability</li>
                  <li className="flex items-center gap-2"><span className="text-muted-foreground/50">—</span> Focus on username registration</li>
                  <li className="flex items-center gap-2"><span className="text-muted-foreground/50">—</span> No exposure analysis</li>
                  <li className="flex items-center gap-2"><span className="text-muted-foreground/50">—</span> No privacy recommendations</li>
                </ul>
              </div>
              <div className="rounded-xl border border-primary/30 p-6 bg-primary/5">
                <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  FootprintIQ
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" /> Analyses exposure across 500+ platforms</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" /> Identifies cross-platform reuse</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" /> Highlights potential risk signals</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" /> Supports digital privacy decisions</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6 text-center">
              It functions as a <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">digital footprint intelligence platform</Link>, not just a checker.
            </p>
          </div>
        </section>

        {/* When Should You Run */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">When Should You Run an Instagram Username Search?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Before creating a professional brand",
                "When auditing online exposure",
                "If concerned about impersonation",
                "Before applying for jobs",
                "After discovering suspicious activity",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-card">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy Tips */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Instagram Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Want to reduce your Instagram exposure? Follow these privacy best practices.
            </p>
            <div className="space-y-4">
              {PRIVACY_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-muted/30 border border-border">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Run a Free Instagram Username Exposure Scan
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Understand what your username reveals across platforms. Check linked accounts and public exposure instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/scan">
                  Run a Free Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/digital-footprint-scan">
                  Check Your Exposure
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Related searches: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Username Search</Link> · <Link to="/discord-username-search" className="text-primary hover:underline">Discord Username Search</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Guides: <Link to="/guides/search-instagram-without-account" className="text-primary hover:underline">Search Instagram Without Account</Link> · <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link> · <Link to="/username-reuse-risk" className="text-primary hover:underline">Username Reuse Risk</Link>
            </p>
          </div>
        </section>

        {/* About + Citation */}
        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <AboutFootprintIQBlock />
            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ is an independent, ethical digital footprint intelligence platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment and authorised research only.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
