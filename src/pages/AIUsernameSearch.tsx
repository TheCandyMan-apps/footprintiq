import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Eye, Users, Lock, Brain } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const FAQS = [
  {
    question: "What is an AI username search?",
    answer: "An AI username search uses machine learning and intelligent pattern matching to check whether a username exists across hundreds of platforms simultaneously. Unlike basic scrapers, AI-powered tools filter false positives, score confidence levels, and correlate results across platforms to produce more accurate, actionable intelligence.",
  },
  {
    question: "How accurate is AI-powered username searching?",
    answer: "AI significantly improves accuracy over traditional tools. FootprintIQ's pipeline uses confidence scoring, namespace collision detection, and contextual verification to filter out false positives — a common problem with basic username checkers that simply match strings without understanding context.",
  },
  {
    question: "Is AI username search legal?",
    answer: "Yes. FootprintIQ only accesses publicly available profile information — the same data anyone can see by visiting a platform directly. We never bypass private account settings, access protected content, or scrape behind authentication walls. Our approach follows strict ethical OSINT principles.",
  },
  {
    question: "Can AI find private or hidden accounts?",
    answer: "No. Our AI scans publicly available data only. Private accounts, hidden profiles, and content behind authentication are never accessed. If a username is registered but the account is private, we can confirm existence but cannot access any protected content.",
  },
  {
    question: "How is this different from a basic username checker?",
    answer: "Basic checkers query platforms one by one and return raw matches — often including false positives from abandoned accounts or namespace collisions. FootprintIQ's AI pipeline scores each result for confidence, correlates matches across platforms, and provides exposure analysis rather than a simple list of URLs.",
  },
];

export default function AIUsernameSearch() {
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
      { "@type": "ListItem", position: 2, name: "AI Username Search", item: "https://footprintiq.app/ai-username-search" },
    ],
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FootprintIQ AI Username Search",
    description: "AI-powered username search tool that checks profiles across 500+ platforms with intelligent false-positive filtering and confidence scoring.",
    url: "https://footprintiq.app/ai-username-search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    creator: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: "https://footprintiq.app",
    },
  };

  return (
    <>
      <Helmet>
        <title>AI Username Search — Check Profiles Across Platforms | FootprintIQ</title>
        <meta name="description" content="AI-powered username search tool. Check if a username exists across 500+ platforms with intelligent false-positive filtering. Free, ethical, and instant." />
        <link rel="canonical" href="https://footprintiq.app/ai-username-search" />
        <meta property="og:title" content="AI Username Search | FootprintIQ" />
        <meta property="og:description" content="Search usernames across 500+ platforms with AI-powered confidence scoring and false-positive filtering." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webAppSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1.5" />
              AI-Powered Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              AI Username Search Tool
              <span className="block text-primary mt-2">Check Profiles Across Platforms</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Most username search tools return noisy, unreliable results. FootprintIQ uses AI-powered confidence scoring and false-positive filtering to show you where a username <em>actually</em> exists — across 500+ platforms, in seconds.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Enter any username below to run an intelligent cross-platform scan. Our <Link to="/usernames" className="text-primary hover:underline">username search tool</Link> goes beyond simple string matching — it correlates results, scores confidence, and delivers clear, actionable intelligence. No login required.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />AI confidence scoring</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />500+ platforms</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Free instant results</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Five steps from username to intelligence — powered by AI at every stage.
            </p>
            <div className="space-y-4">
              {[
                "Enter the username you want to investigate.",
                "Our AI engine queries 500+ platforms simultaneously — social media, forums, gaming sites, developer platforms, and more.",
                "Results pass through our false-positive detection pipeline, which uses namespace analysis and contextual matching to eliminate noise.",
                "Each confirmed match is scored for confidence and categorised by platform type, risk level, and exposure severity.",
                "You receive a clean, prioritised report showing where the username exists, how accounts connect, and what the exposure means.",
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">{idx + 1}</div>
                  <p className="text-sm text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What You Can Find */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">What You Can Find</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Verified Profile Matches</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-scored results showing where a username is genuinely registered — not just where the string appears. Confidence levels help you distinguish real accounts from false positives.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Cross-Platform Correlation</h3>
                  <p className="text-sm text-muted-foreground">
                    See how a username connects identities across <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram</Link>, <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X</Link>, Discord, Reddit, and hundreds more. Understand the full digital footprint behind a single handle.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Exposure Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Each scan includes an exposure summary showing how username reuse creates traceable identity chains — and what that means for privacy and security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Body Content */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6 prose prose-sm dark:prose-invert">
            <h2>Why AI Makes Username Search Better</h2>
            <p>
              Traditional username search tools work by sending HTTP requests to platforms and checking whether a profile page returns a 200 status code. This approach is fast but fundamentally flawed — it produces high rates of false positives from namespace collisions, abandoned accounts, and platform-specific quirks that make results unreliable.
            </p>
            <p>
              FootprintIQ's AI pipeline addresses these problems at every stage. Our system analyses response patterns, compares profile metadata across platforms, and applies contextual matching to determine whether a username match is genuinely the same person or merely a coincidence. The result is significantly cleaner, more trustworthy intelligence.
            </p>

            <h3>The False-Positive Problem</h3>
            <p>
              A username like "alex_92" might exist on 200 platforms — but how many of those are the same person? Basic tools can't answer that question. They return a list of URLs and leave you to figure it out. Our AI scoring system analyses profile metadata, registration patterns, and cross-platform consistency to separate signal from noise. You can read more about this challenge in our guide on <Link to="/is-username-search-accurate" className="text-primary hover:underline">username search accuracy</Link>.
            </p>

            <h3>Beyond Detection: Understanding Exposure</h3>
            <p>
              Finding where a username exists is only the first step. What matters is understanding what that exposure means. FootprintIQ's <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint scan</Link> goes beyond detection to provide exposure analysis — showing how connected accounts create identity chains that could be exploited for social engineering, phishing, or identity theft.
            </p>
            <p>
              This is the intelligence layer that transforms raw OSINT data into actionable insight. Rather than handing you a list of 150 URLs, we show you the 12 that matter — scored, categorised, and prioritised by risk.
            </p>

            <h3>Who Uses AI Username Search?</h3>
            <p>
              Cybersecurity professionals investigating credential reuse. Parents checking what their children's usernames reveal. Job seekers auditing their online presence before interviews. Researchers studying cross-platform identity patterns. All of these use cases benefit from AI-powered accuracy — and all are supported ethically by FootprintIQ.
            </p>

            <h3>Built on Ethical OSINT Principles</h3>
            <p>
              FootprintIQ is built on a foundation of <Link to="/ethical-osint-charter" className="text-primary hover:underline">ethical OSINT principles</Link>. Our AI username search only accesses publicly available data. We never bypass authentication, access private accounts, or scrape content behind login walls. Every result comes from the same information anyone can find by visiting a platform directly — we simply do it faster, smarter, and at scale.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
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

        {/* Related Searches */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Related searches: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Username Search</Link> · <Link to="/discord-username-search" className="text-primary hover:underline">Discord Username Search</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Search Smarter, Not Harder</h2>
            <p className="text-muted-foreground mb-8">Enter a username above to run an AI-powered scan across 500+ platforms. Free, instant, and ethical.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild><Link to="/free-scan">Run a Free Scan <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to="/digital-footprint-scan">Check Your Exposure</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
