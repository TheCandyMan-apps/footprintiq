import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, Music } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Set your account to private if you don't want strangers viewing your content",
  "Disable 'Suggest your account to others' in privacy settings",
  "Consider using a unique username not linked to your other social profiles",
  "Review your linked accounts (Instagram, YouTube) for cross-platform exposure",
  "Check your profile visibility settings—bio, liked videos, and following list",
];

const FAQS = [
  {
    question: "Can you find a private TikTok account by username?",
    answer: "We can detect if a username exists on TikTok, but private accounts hide most content. Our scan shows whether the profile exists and links to other platforms where that username appears publicly.",
  },
  {
    question: "How do I find someone's TikTok profile?",
    answer: "Enter their username in our search tool. We'll check if that username exists on TikTok and show you where else it appears online, helping you find connected profiles across platforms.",
  },
  {
    question: "Is TikTok username search legal?",
    answer: "Yes. We only access publicly available profile information—the same data anyone can see by visiting TikTok directly. We don't access private accounts or bypass any security measures.",
  },
  {
    question: "What information can you find from a TikTok username?",
    answer: "Our scan checks if the username exists on TikTok and identifies the same username across 500+ other platforms. This reveals how the user's digital identity connects across social media, gaming, and forums.",
  },
  {
    question: "Can I check my own TikTok exposure?",
    answer: "Yes. Enter your TikTok username to see where that handle appears elsewhere online. This helps you understand your digital footprint and identify old accounts you may have forgotten.",
  },
];

export default function TikTokUsernameSearchPage() {
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
        name: "TikTok Username Search",
        item: "https://footprintiq.app/tiktok-username-search",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>TikTok Username Search — Find TikTok Profiles Free | FootprintIQ</title>
        <meta name="description" content="Search TikTok usernames and find connected profiles across 500+ platforms. Free TikTok profile lookup and username search tool." />
        <link rel="canonical" href="https://footprintiq.app/tiktok-username-search" />
        <meta property="og:title" content="TikTok Username Search | FootprintIQ" />
        <meta property="og:description" content="Find TikTok profiles and connected accounts. Free username search across platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Music className="h-3 w-3 mr-1.5" />
              TikTok Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              TikTok Username Search
              <span className="block text-primary mt-2">Find TikTok Profiles Free</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search any TikTok username to find the profile and discover where else 
              that username appears across social media and the web.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                TikTok profile check
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
              What Our TikTok Username Search Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Profile Existence</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify if a TikTok account exists with that username. We check profile availability without requiring login.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Connected Profiles</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover where the same username appears on Instagram, Twitter, Discord, gaming platforms, and 500+ other sites.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Privacy Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how username reuse connects online identities. See the digital footprint behind a single handle.
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
              TikTok Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Concerned about your TikTok exposure? Here's how to improve your privacy.
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
              Related searches: <Link to="/search-username" className="text-primary hover:underline">Search Username</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter Username Search</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search TikTok Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter a TikTok username above to find the profile and connected accounts. Free and instant.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Start TikTok Search
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
