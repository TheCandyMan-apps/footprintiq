import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Eye, Users, Lock, Camera, BookOpen } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { GuideBackLink } from "@/components/guides/GuideBackLink";

const FAQS = [
  {
    question: "Can you search for someone on Instagram without an account?",
    answer: "Yes. You can view public Instagram profiles by visiting instagram.com/username directly. FootprintIQ's username search goes further — checking 500+ platforms simultaneously without requiring any login.",
  },
  {
    question: "How do I find someone's Instagram if I only know their name?",
    answer: "If you know their likely username, enter it in our search tool. We check Instagram and 500+ other platforms for that handle. If you only have a real name, try common username patterns (firstname_lastname, firstnamelastname) as starting points.",
  },
  {
    question: "Is it legal to search for people on Instagram?",
    answer: "Yes. Searching for publicly available Instagram profiles is completely legal. FootprintIQ only accesses public data — we never bypass private account settings or access protected content.",
  },
  {
    question: "What's the best way to find someone's Instagram profile?",
    answer: "Start with their username. Enter it in FootprintIQ's search tool to check Instagram and 500+ other platforms simultaneously. This cross-platform approach often reveals connected accounts that a simple Instagram search would miss.",
  },
  {
    question: "Can I see if someone has a secret Instagram account?",
    answer: "We can check whether a username is registered on Instagram, but we cannot access private accounts or content hidden behind privacy settings. Our tool only reveals publicly available information.",
  },
];

export default function HowToSearchForPeopleOnInstagram() {
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
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
      { "@type": "ListItem", position: 3, name: "How to Search for People on Instagram", item: "https://footprintiq.app/guides/how-to-search-for-people-on-instagram" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Search for People on Instagram (2026 Guide)",
    description: "Learn the best methods to search for people on Instagram using usernames, cross-platform tools, and ethical OSINT techniques.",
    author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    datePublished: "2026-02-28",
    dateModified: "2026-02-28",
    url: "https://footprintiq.app/guides/how-to-search-for-people-on-instagram",
  };

  return (
    <>
      <Helmet>
        <title>How to Search for People on Instagram (2026 Guide) | FootprintIQ</title>
        <meta name="description" content="Learn how to search for people on Instagram by username. Find Instagram profiles and connected accounts across 500+ platforms with our free guide." />
        <link rel="canonical" href="https://footprintiq.app/guides/how-to-search-for-people-on-instagram" />
        <meta property="og:title" content="How to Search for People on Instagram | FootprintIQ" />
        <meta property="og:description" content="Step-by-step guide to finding Instagram profiles by username. Free cross-platform search methods." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6">
            <GuideBackLink />
            <div className="text-center">
              <Badge variant="outline" className="mb-6 text-primary border-primary/30">
                <BookOpen className="h-3 w-3 mr-1.5" />
                Instagram Guide
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                How to Search for People on Instagram
                <span className="block text-primary mt-2">2026 Guide</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Instagram has over two billion users, making it one of the largest social networks in the world. Whether you're reconnecting with someone, verifying an identity, or auditing your own exposure, knowing how to search effectively is essential.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 prose prose-sm dark:prose-invert">
            <p>
              There are several ways to search for people on Instagram — from the platform's built-in search to third-party tools that check multiple platforms at once. This guide covers the most effective methods, their limitations, and how to do it ethically.
            </p>

            <h2>Method 1: Instagram's Built-In Search</h2>
            <p>
              Instagram's search bar lets you find users by username or display name. However, it only searches Instagram — and results are influenced by your existing connections, location, and engagement history. If you're looking for someone you're not connected to, results can be unreliable.
            </p>

            <h2>Method 2: Direct URL Access</h2>
            <p>
              If you know someone's username, you can visit <code>instagram.com/username</code> directly. This works without an account for public profiles. However, private accounts will only show limited information (profile picture and bio).
            </p>

            <h2>Method 3: Cross-Platform Username Search</h2>
            <p>
              The most effective method is using a <Link to="/usernames" className="text-primary hover:underline">username search tool</Link> that checks Instagram alongside 500+ other platforms. This reveals not just whether the username exists on Instagram, but where else it appears — TikTok, Twitter/X, Reddit, Discord, and more.
            </p>
            <p>
              FootprintIQ's <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram username search</Link> does exactly this. Enter a username and get instant results across all major platforms, filtered for accuracy using our false-positive detection pipeline.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">Search for people on Instagram in five simple steps.</p>
            <div className="space-y-4">
              {[
                "Enter the username or likely handle in FootprintIQ's search tool.",
                "Our engine checks Instagram for profile existence and public visibility.",
                "We simultaneously scan 500+ platforms including TikTok, Twitter/X, Discord, and Reddit.",
                "Results are filtered using confidence scoring to remove false positives.",
                "You receive a clear report with Instagram status and cross-platform matches.",
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">{idx + 1}</div>
                  <p className="text-sm text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* More Content */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 prose prose-sm dark:prose-invert">
            <h2>What You Can Find</h2>
            <p>
              A cross-platform Instagram search reveals more than just profile existence. You can discover connected accounts on other platforms, understand username reuse patterns, and assess exposure risk. This is particularly useful for:
            </p>
            <ul>
              <li><strong>Identity verification</strong> — confirm someone is who they claim to be by checking username consistency across platforms</li>
              <li><strong>Self-auditing</strong> — discover what your Instagram username reveals about you across the web</li>
              <li><strong>Reconnection</strong> — find someone's other social profiles when you only know their Instagram handle</li>
            </ul>

            <h2>Ethical Considerations</h2>
            <p>
              Searching for people on Instagram is legal when you're accessing publicly available information. FootprintIQ follows strict <Link to="/ethical-osint-charter" className="text-primary hover:underline">ethical OSINT principles</Link> — we never access private accounts, bypass login screens, or scrape content behind authentication. Our tools are designed for legitimate use cases: self-auditing, identity verification, and authorised research.
            </p>

            <h2>Limitations to Understand</h2>
            <p>
              No search tool can access private Instagram accounts. If an account is set to private, only the profile picture and bio are publicly visible. Username searches can confirm that a private account <em>exists</em> but cannot reveal its content. Tools that claim otherwise are either misleading or violating platform terms of service.
            </p>
            <p>
              For a broader view of your <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint</Link>, combine an Instagram search with checks on <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok</Link> and <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X</Link> to map your complete online presence.
            </p>
          </div>
        </section>

        {/* Search Box */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Try It Now</h2>
            <p className="text-muted-foreground mb-8">Enter an Instagram username to search across 500+ platforms.</p>
            <HeroInputField />
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
              Related searches: <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/instagram-user-search" className="text-primary hover:underline">Instagram User Search</Link> · <Link to="/instagram-search-without-account" className="text-primary hover:underline">Instagram Search Without Account</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Run a Free Scan</h2>
            <p className="text-muted-foreground mb-8">Search any Instagram username across 500+ platforms. Free and instant.</p>
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
