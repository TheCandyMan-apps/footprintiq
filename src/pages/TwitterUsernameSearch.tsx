import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, Twitter } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Protect your tweets to control who sees your content",
  "Disable location sharing in tweets and profile settings",
  "Review connected apps and revoke access to unused ones",
  "Consider using a pseudonymous handle unconnected to your real identity",
  "Disable 'Discoverable by email' and 'Discoverable by phone number' settings",
];

const FAQS = [
  {
    question: "How do I find someone's Twitter/X profile by username?",
    answer: "Enter their handle (without the @) in our search tool. We verify if the profile exists and show you where that username appears across 500+ other platforms.",
  },
  {
    question: "Can you see protected Twitter accounts?",
    answer: "We can confirm if a protected account exists, but we can't view its content. Our scan shows where the same username appears on other platforms, often revealing the person's broader online presence.",
  },
  {
    question: "Is Twitter username search legal?",
    answer: "Yes. We access publicly available profile information—the same data visible to anyone visiting Twitter. We don't bypass privacy settings or access protected tweets.",
  },
  {
    question: "Why search for a Twitter handle across platforms?",
    answer: "Many people use the same username everywhere. Finding a Twitter handle on gaming platforms, forums, or professional sites reveals connections that help you understand the full picture of someone's online presence.",
  },
  {
    question: "Can I check if my Twitter username is exposed elsewhere?",
    answer: "Yes. Search your Twitter handle to discover where it appears across the web—old forums, gaming networks, or sites you've forgotten. This is essential for managing your digital footprint.",
  },
];

export default function TwitterUsernameSearchPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://footprintiq.app",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Twitter Username Search",
        item: "https://footprintiq.app/twitter-username-search",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Twitter Username Search — Find Twitter/X Profiles Free | FootprintIQ</title>
        <meta name="description" content="Search Twitter/X usernames and find connected profiles across 500+ platforms. Free Twitter user lookup and profile search tool." />
        <link rel="canonical" href="https://footprintiq.app/twitter-username-search" />
        <meta property="og:title" content="Twitter Username Search | FootprintIQ" />
        <meta property="og:description" content="Find Twitter/X profiles and connected accounts. Free username search across platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Twitter className="h-3 w-3 mr-1.5" />
              Twitter/X Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Twitter Username Search
              <span className="block text-primary mt-2">Find Twitter Users Free</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search any Twitter/X username to find the profile and discover connected 
              accounts across social media, gaming, and professional platforms.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Twitter/X profile check
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
              What Our Twitter Username Search Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Profile Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Confirm if a Twitter/X account exists with that exact handle. Instant verification without requiring login.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Platform Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Find where the same handle appears on Instagram, TikTok, GitHub, Discord, and 500+ other platforms.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Identity Mapping</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how a Twitter handle connects to a person's digital identity across professional and personal platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy Tips */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Twitter/X Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Want to reduce your Twitter exposure? Follow these privacy recommendations.
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

        {/* Internal Links */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground">
              Related searches: <Link to="/search-username" className="text-primary hover:underline">Search Username</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search Twitter Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter a Twitter handle above to find the profile and connected accounts. Free and instant.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Start Twitter Search
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
