import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, Camera } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Switch your account to private to control who sees your posts",
  "Disable 'Show activity status' to hide when you're online",
  "Review 'Accounts you follow' visibility in privacy settings",
  "Remove your profile from third-party apps in Security settings",
  "Consider unlinking Facebook to reduce cross-platform data sharing",
];

const FAQS = [
  {
    question: "How do I find someone's Instagram by username?",
    answer: "Enter their username in our search tool. We verify if the profile exists on Instagram and show you where that same username appears across 500+ other platforms.",
  },
  {
    question: "Can you find private Instagram accounts?",
    answer: "We can confirm if a username exists on Instagram, but we can't view private content. Our value is showing where that username appears on other platforms, revealing the person's broader digital footprint.",
  },
  {
    question: "Is Instagram username search legal?",
    answer: "Yes. We only access publicly available information—profile existence and public profile data. We don't bypass privacy settings or access protected content.",
  },
  {
    question: "What can you learn from an Instagram username?",
    answer: "By searching across platforms, you can see if the person uses the same handle on Twitter, TikTok, gaming networks, forums, and professional sites. This reveals how connected their online identity is.",
  },
  {
    question: "How do I check my own Instagram exposure?",
    answer: "Search your Instagram username to see where it appears elsewhere. You might find old accounts, gaming profiles, or forums you'd forgotten about—all linked to your current identity.",
  },
];

export default function InstagramUsernameSearchPage() {
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
        name: "Instagram Username Search",
        item: "https://footprintiq.app/instagram-username-search",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Instagram Username Search — Find Instagram Profiles Free | FootprintIQ</title>
        <meta name="description" content="Search Instagram usernames and find connected profiles across 500+ platforms. Free Instagram user lookup and profile search tool." />
        <link rel="canonical" href="https://footprintiq.app/instagram-username-search" />
        <meta property="og:title" content="Instagram Username Search | FootprintIQ" />
        <meta property="og:description" content="Find Instagram profiles and connected accounts. Free username search across platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Camera className="h-3 w-3 mr-1.5" />
              Instagram Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Instagram Username Search
              <span className="block text-primary mt-2">Find Instagram Users Free</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search any Instagram username to find the profile and discover connected 
              accounts across social media, gaming, and forums.
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

        {/* What We Find */}
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

        {/* Internal Links */}
        <section className="py-12 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground">
              Related searches: <Link to="/search-username" className="text-primary hover:underline">Search Username</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter Username Search</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search Instagram Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter an Instagram username above to find the profile and connected accounts. Free and instant.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Start Instagram Search
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
