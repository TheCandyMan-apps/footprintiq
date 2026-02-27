import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Eye, Users, Lock, Youtube } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Set your YouTube subscriptions and liked videos to private in channel settings",
  "Use a unique channel handle that doesn't match your other social media usernames",
  "Review your 'About' tab — linked social accounts, email, and location are publicly visible",
  "Check your comment history — comments on public videos are visible to anyone",
  "Consider whether your channel name reveals your real identity unnecessarily",
];

const FAQS = [
  {
    question: "Can you search YouTube by username?",
    answer: "Yes. YouTube channels have public handles (@username) and custom URLs. FootprintIQ checks whether a username exists on YouTube and across 500+ other platforms simultaneously, revealing cross-platform identity connections from publicly accessible data only.",
  },
  {
    question: "Is YouTube username searching legal?",
    answer: "Yes. YouTube channels and their public content are deliberately indexed by search engines. Viewing publicly available channel information is legal. FootprintIQ only accesses public data and never bypasses authentication or privacy settings.",
  },
  {
    question: "What can you find from a YouTube username?",
    answer: "Our scan confirms whether the username exists on YouTube and identifies the same handle across other platforms. Public YouTube channels reveal the channel name, description, subscriber count, upload history, playlists, and comment activity — all publicly visible information.",
  },
  {
    question: "Can someone find my identity from my YouTube channel?",
    answer: "Potentially — if your YouTube handle matches usernames on other platforms, cross-referencing can link your channel to personal profiles. Photos, voice, location mentions in videos, and linked social accounts all contribute to identifiability. A FootprintIQ scan reveals these connections.",
  },
  {
    question: "How do I reduce my YouTube exposure?",
    answer: "Set subscriptions and liked videos to private, use a unique handle not linked to personal accounts, remove personal details from the About tab, and review your comment history on public videos. Run a FootprintIQ scan to see what's discoverable externally.",
  },
];

export default function YouTubeUsernameSearchPage() {
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
      { "@type": "ListItem", position: 2, name: "YouTube Username Search", item: "https://footprintiq.app/youtube-username-search" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>YouTube Username Search — Find YouTube Channels Free | FootprintIQ</title>
        <meta name="description" content="Search YouTube usernames and find connected profiles across 500+ platforms. Free YouTube channel lookup and username search tool with ethical OSINT methodology." />
        <link rel="canonical" href="https://footprintiq.app/youtube-username-search" />
        <meta property="og:title" content="YouTube Username Search | FootprintIQ" />
        <meta property="og:description" content="Find YouTube channels and connected accounts. Free username search across platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Youtube className="h-3 w-3 mr-1.5" />
              YouTube Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              YouTube Username Search
              <span className="block text-primary mt-2">Find YouTube Channels Free</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search any YouTube username to find the channel and discover where else 
              that handle appears across social media and the web.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                YouTube channel check
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

        {/* What We Find */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              What Our YouTube Username Search Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Channel Existence</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify if a YouTube channel exists with that username or @handle. We check public availability without requiring a Google account.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Connected Profiles</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover where the same username appears on TikTok, Instagram, Twitter, Twitch, and 500+ other services — mapping the creator's digital identity.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Content Exposure</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how YouTube activity — comments, subscriptions, and playlists — contributes to your overall digital footprint when combined with other platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Why YouTube Exposure Matters
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              YouTube is the world's second-largest search engine. Your channel, comments, and activity are more discoverable than you might think.
            </p>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                YouTube channels are indexed aggressively by Google — the same company owns both platforms. This means your channel name, description, video titles, and even comments on other channels can appear in search results. For content creators and casual commenters alike, this creates significant exposure.
              </p>
              <p>
                Username reuse between YouTube and other platforms is particularly common among content creators. A handle used on YouTube, TikTok, and <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram</Link> creates a discoverable identity chain. Even users who only comment (rather than upload) may have their activity linked to other platforms through username correlation.
              </p>
              <p>
                FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">cross-platform username search</Link> checks YouTube alongside 500+ other services, revealing identity connections that aren't obvious from any single platform. Combined with a full <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint scan</Link>, this provides complete visibility into your public exposure.
              </p>
              <p>
                For creators concerned about separating personal and channel identities, understanding cross-platform username exposure is essential. Our <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok username search</Link> is also valuable for multi-platform creators who share handles across video platforms.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Tips */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              YouTube Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Reduce your YouTube exposure with these practical steps.
            </p>
            <div className="space-y-4">
              {PRIVACY_TIPS.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
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
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-background border border-border">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground mb-3">
              Related searches: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Guides: <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline">How Username Search Tools Work</Link> · <Link to="/guides/check-whats-publicly-visible" className="text-primary hover:underline">Check What's Publicly Visible</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search YouTube Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter a YouTube username above to find the channel and connected accounts. Free and instant.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Run a Free Scan
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
