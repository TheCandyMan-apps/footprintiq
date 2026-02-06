import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, User, Search, Globe, CheckCircle, ArrowRight, Eye, Database, Network } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const WHAT_WE_REVEAL = [
  "Social media profiles (Twitter, Instagram, TikTok, Facebook)",
  "Developer platforms (GitHub, GitLab, Stack Overflow)",
  "Gaming networks (Steam, Xbox, PlayStation)",
  "Forums and community sites (Reddit, Discord servers)",
  "Professional networks (LinkedIn, Behance, Dribbble)",
  "Data broker and people-search listings",
];

const FAQS = [
  {
    question: "Is searching for a username legal?",
    answer: "Yes. FootprintIQ only accesses publicly available information—the same data anyone could find by manually searching each platform. We don't access private accounts or bypass any security measures.",
  },
  {
    question: "Why would I search my own username?",
    answer: "Self-auditing helps you understand your digital footprint. You may have forgotten about old accounts, or your username may appear on platforms you didn't know about. This visibility helps you manage your online presence.",
  },
  {
    question: "Can I search for someone else's username?",
    answer: "You can search any username to see publicly available profiles. However, our service is designed for self-audit and professional OSINT research conducted within legal and ethical boundaries.",
  },
  {
    question: "How is this different from just Googling a username?",
    answer: "We scan hundreds of platforms simultaneously, including sites that don't appear in Google search results. Our tools check platform-specific APIs and databases that standard search engines don't index.",
  },
  {
    question: "What if I use different usernames on different platforms?",
    answer: "Run separate searches for each username you use. Our Pro plan includes unlimited scans, letting you check all your handles and understand how they might connect to each other.",
  },
  {
    question: "Is the search free?",
    answer: "Yes. Our free username search shows you where a username appears across major platforms. Pro unlocks detailed analysis, historical data, and recommendations for managing your digital presence.",
  },
];

const WHY_SEARCH_USERNAMES = {
  title: "Why Search for a Username?",
  content: `Usernames are digital identifiers that persist across platforms and time. The handle you chose years ago may still be active on sites you've forgotten about—revealing personal information, old posts, or connections to your current identity.

Understanding where a username appears helps with several goals. Privacy-conscious individuals can identify and clean up old accounts. Professionals can ensure their online presence aligns with their personal brand. Parents can check if their children's usernames appear in unexpected places. Security researchers can assess exposure as part of OSINT investigations.

Our free username search scans hundreds of platforms simultaneously, giving you a comprehensive view of where that identifier appears online. This is the same capability used by security professionals, investigators, and privacy-conscious individuals worldwide.`,
};

const HOW_IT_WORKS = {
  title: "How to Search for a Username Online",
  steps: [
    "Enter the username you want to search in the field above",
    "Our system queries hundreds of platforms simultaneously",
    "Results show which platforms have profiles matching that username",
    "Review the findings to understand the username's digital footprint",
    "Take action: secure, delete, or update accounts as needed",
  ],
};

export default function SearchUsernamePage() {
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
        name: "Search Username",
        item: "https://footprintiq.app/search-username",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Search Any Username — Free Username Lookup Tool | FootprintIQ</title>
        <meta name="description" content="Free username search across 500+ platforms. Find social media profiles, gaming accounts, and forums linked to any username. Search username in seconds." />
        <link rel="canonical" href="https://footprintiq.app/search-username" />
        <meta property="og:title" content="Free Username Search Tool | FootprintIQ" />
        <meta property="og:description" content="Search any username across 500+ platforms. Free username lookup for social media, gaming, forums, and more." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Search className="h-3 w-3 mr-1.5" />
              Free Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Search Any Username
              <span className="block text-primary mt-2">Free Username Lookup Tool</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find where a username appears across social media, gaming platforms, forums, 
              and developer sites. Free user name search in seconds.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                500+ platforms scanned
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Instant results
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                100% free basic search
              </span>
            </div>
          </div>
        </section>

        {/* Why Search Usernames */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {WHY_SEARCH_USERNAMES.title}
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              {WHY_SEARCH_USERNAMES.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              {HOW_IT_WORKS.title}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Our free username search tool makes it easy to discover where any username appears online.
            </p>
            <div className="space-y-4">
              {HOW_IT_WORKS.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What We Reveal */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              What Our Free Username Search Reveals
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              We scan across platform categories to give you a complete picture of a username's online presence.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {WHAT_WE_REVEAL.map((source, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-4">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Who Uses Username Search?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Privacy-Conscious Individuals</h3>
                  <p className="text-sm text-muted-foreground">
                    Audit your digital footprint. Find forgotten accounts and old profiles that may expose personal information you'd rather keep private.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Database className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Security Researchers</h3>
                  <p className="text-sm text-muted-foreground">
                    Conduct OSINT investigations efficiently. Our multi-platform scan replaces hours of manual searching across individual sites.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Network className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Brand Protection Teams</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor for impersonation. Check if someone is using your brand's name or executives' usernames on platforms you don't control.
                  </p>
                </CardContent>
              </Card>
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
            <p className="text-center text-sm text-muted-foreground mb-3">
              Related tools: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter Username Search</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Scan for: <Link to="/for/crypto" className="text-primary hover:underline">Crypto Holders</Link> · <Link to="/for/developers" className="text-primary hover:underline">Developers</Link> · <Link to="/for/job-seekers" className="text-primary hover:underline">Job Seekers</Link> · <Link to="/for/executives" className="text-primary hover:underline">Executives</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Start Your Free Username Search
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter any username above to see where it appears across 500+ platforms. Free, fast, and private.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Search Username Now
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
