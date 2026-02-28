import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, MessageSquare } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const FAQS = [
  {
    question: "Can you search for someone on Discord by username?",
    answer: "Yes. Our tool checks whether a Discord username exists and identifies the same handle across 500+ other platforms. We only access publicly available data — no private servers or DMs are accessed.",
  },
  {
    question: "Is Discord username lookup legal?",
    answer: "Absolutely. We check publicly visible profile information, the same data available to anyone on the platform. We never bypass privacy settings, access private servers, or scrape protected content.",
  },
  {
    question: "What can a Discord lookup reveal?",
    answer: "Our scan detects whether a username is registered on Discord and cross-references it across social media, gaming platforms, forums, and more. This helps map a user's broader digital footprint ethically.",
  },
  {
    question: "Can I check my own Discord exposure?",
    answer: "Yes. Enter your Discord username to discover where that handle appears elsewhere online. This is useful for auditing your digital footprint and identifying forgotten or exposed accounts.",
  },
  {
    question: "Does this tool access private Discord servers?",
    answer: "No. FootprintIQ never accesses private servers, direct messages, or any content behind authentication. We only check publicly available username registrations and cross-platform matches.",
  },
];

export default function DiscordLookup() {
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
      { "@type": "ListItem", position: 2, name: "Discord Lookup", item: "https://footprintiq.app/discord-lookup" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Discord Lookup — Find Discord Profiles by Username | FootprintIQ</title>
        <meta name="description" content="Search Discord usernames and find connected profiles across 500+ platforms. Free Discord user lookup and cross-platform identity search." />
        <link rel="canonical" href="https://footprintiq.app/discord-lookup" />
        <meta property="og:title" content="Discord Lookup | FootprintIQ" />
        <meta property="og:description" content="Find Discord profiles and connected accounts by username. Free cross-platform search." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <MessageSquare className="h-3 w-3 mr-1.5" />
              Discord Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Discord Lookup
              <span className="block text-primary mt-2">Find Discord Profiles by Username</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Search any Discord username to check whether the profile exists and discover where that same handle appears across social media, gaming platforms, and the wider web.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search tool</Link> scans 500+ platforms in seconds — ethically, legally, and without accessing private data. Whether you're verifying an identity, auditing your own exposure, or investigating username reuse, our Discord lookup gives you a clear picture of a handle's online presence.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Discord profile check</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Cross-platform scan</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Free instant results</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Our Discord lookup runs in five simple steps — no login required.
            </p>
            <div className="space-y-4">
              {[
                "Enter the Discord username you want to search.",
                "Our engine checks Discord for profile existence and public metadata.",
                "We cross-reference the username against 500+ platforms including Reddit, Twitter/X, Instagram, and gaming sites.",
                "Results are filtered to remove false positives using our confidence-scoring pipeline.",
                "You receive a clear report showing where the username appears, along with an exposure summary.",
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
                  <h3 className="font-semibold mb-2">Profile Verification</h3>
                  <p className="text-sm text-muted-foreground">Confirm whether a Discord account exists with that username. We check registration status without accessing private servers or messages.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Cross-Platform Matches</h3>
                  <p className="text-sm text-muted-foreground">See where the same username appears on <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram</Link>, <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X</Link>, Reddit, gaming platforms, and hundreds more.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Exposure Analysis</h3>
                  <p className="text-sm text-muted-foreground">Understand the digital footprint behind a Discord handle. See how username reuse connects identities across the web.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Body Content */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6 prose prose-sm dark:prose-invert">
            <h2>Why Discord Usernames Matter for Digital Footprint Analysis</h2>
            <p>
              Discord has grown well beyond gaming into one of the most widely used communication platforms globally. With over 200 million monthly active users, Discord usernames frequently overlap with handles used on other platforms — creating a traceable digital footprint that most people don't realise exists.
            </p>
            <p>
              When someone reuses a Discord username on <Link to="/reddit-username-search" className="text-primary hover:underline">Reddit</Link>, Twitter/X, Instagram, or gaming platforms like Steam, those connections become publicly visible. Our <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint scan</Link> maps these connections ethically, using only publicly accessible data.
            </p>

            <h3>Who Uses Discord Lookup?</h3>
            <p>
              Parents verifying who their children interact with online. Professionals auditing their own exposure before job applications. Security teams investigating username reuse across corporate accounts. Researchers studying cross-platform identity patterns. All of these use cases are supported ethically by FootprintIQ — we never access private servers, DMs, or content behind authentication.
            </p>

            <h3>Ethical Boundaries</h3>
            <p>
              FootprintIQ is built on a foundation of <Link to="/ethical-osint-charter" className="text-primary hover:underline">ethical OSINT principles</Link>. Our Discord lookup only checks publicly available username registrations and cross-references them against our platform database. We do not scrape server member lists, read messages, or access any private content. Every scan respects user privacy and platform terms of service.
            </p>

            <h3>Understanding Username Reuse Risk</h3>
            <p>
              Username reuse is one of the most underestimated privacy risks online. A handle like "shadow_knight99" used on Discord, Reddit, and a dating site creates a chain of connections that anyone can follow. Our scan reveals these patterns so you can take action — whether that means changing handles, deleting old accounts, or adjusting privacy settings.
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
              Related searches: <Link to="/discord-username-search" className="text-primary hover:underline">Discord Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Run a Free Scan</h2>
            <p className="text-muted-foreground mb-8">Enter a Discord username above to check exposure across 500+ platforms. Free and instant.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/free-scan">Run a Free Scan <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/digital-footprint-scan">Check Your Exposure</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
