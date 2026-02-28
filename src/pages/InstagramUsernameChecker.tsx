import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Eye, Users, Lock, Camera } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const FAQS = [
  {
    question: "How do I check if an Instagram username is taken?",
    answer: "Enter the username in our checker. We'll confirm whether the handle is registered on Instagram and show you where else it appears across 500+ platforms — helping you find available alternatives or verify ownership.",
  },
  {
    question: "Can I check Instagram username availability without an account?",
    answer: "Yes. Our tool checks Instagram username registration status without requiring you to log in or create an account. We only access publicly available data.",
  },
  {
    question: "What does Instagram username checker show?",
    answer: "Our checker reveals whether a username is registered on Instagram and cross-references it across social media, forums, gaming platforms, and more. This helps you understand the full digital footprint behind a handle.",
  },
  {
    question: "Is this tool free to use?",
    answer: "Yes. Basic username checks across Instagram and 500+ platforms are free. Advanced features like detailed exposure reports and ongoing monitoring are available with a paid plan.",
  },
  {
    question: "Can I use this to check my own Instagram username?",
    answer: "Absolutely. Enter your own handle to discover where it appears online. This is valuable for privacy audits, job preparation, or simply understanding your digital footprint.",
  },
];

export default function InstagramUsernameChecker() {
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
      { "@type": "ListItem", position: 2, name: "Instagram Username Checker", item: "https://footprintiq.app/instagram-username-checker" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Instagram Username Checker — Check Availability & Exposure | FootprintIQ</title>
        <meta name="description" content="Check if an Instagram username is taken and see where it appears across 500+ platforms. Free Instagram username availability checker and exposure tool." />
        <link rel="canonical" href="https://footprintiq.app/instagram-username-checker" />
        <meta property="og:title" content="Instagram Username Checker | FootprintIQ" />
        <meta property="og:description" content="Check Instagram username availability and cross-platform exposure. Free instant results." />
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
              Instagram Username Checker
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Instagram Username Checker
              <span className="block text-primary mt-2">Check Availability &amp; Exposure</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Check if an Instagram username is taken and discover where that same handle appears across 500+ social media platforms, forums, and websites.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're choosing a new handle or auditing your existing one, FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search tool</Link> gives you instant visibility into a username's digital footprint — ethically and without requiring login.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Availability check</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />500+ platform scan</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Free instant results</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">Five steps to check any Instagram username.</p>
            <div className="space-y-4">
              {[
                "Enter the Instagram username you want to check.",
                "Our engine verifies whether the username is registered on Instagram.",
                "We scan 500+ additional platforms for the same handle — including TikTok, Twitter/X, Discord, and Reddit.",
                "Results are scored for confidence and filtered to remove false positives.",
                "You receive a clear report showing availability status and cross-platform exposure.",
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
                  <h3 className="font-semibold mb-2">Availability Status</h3>
                  <p className="text-sm text-muted-foreground">Instantly check whether an Instagram username is taken or available, without needing to create an account or log in.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Cross-Platform Exposure</h3>
                  <p className="text-sm text-muted-foreground">See where the same handle appears on <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X</Link>, <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok</Link>, Discord, Reddit, and hundreds more.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Privacy Insights</h3>
                  <p className="text-sm text-muted-foreground">Understand how a username connects identities across platforms. Audit your <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint</Link> before it's exploited.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Body Content */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6 prose prose-sm dark:prose-invert">
            <h2>More Than an Availability Checker</h2>
            <p>
              Most Instagram username checkers simply tell you whether a handle is taken. FootprintIQ goes further — checking 500+ platforms simultaneously to show you the complete digital footprint behind a username. This matters because username reuse is one of the most overlooked privacy risks online.
            </p>
            <p>
              If a username is registered on Instagram, it's likely used elsewhere too. Our scan reveals these connections so you can make informed decisions about your online identity. For new accounts, choose a handle that isn't already tied to someone else's digital footprint. For existing accounts, understand what your username reveals about you.
            </p>

            <h3>Built for Privacy, Not Surveillance</h3>
            <p>
              FootprintIQ follows strict <Link to="/ethical-osint-charter" className="text-primary hover:underline">ethical OSINT principles</Link>. We don't access private accounts, bypass login screens, or scrape protected content. Every result comes from publicly available data. Our tools are designed for self-auditing, identity verification, and legitimate research — not surveillance.
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
              Related searches: <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/instagram-user-search" className="text-primary hover:underline">Instagram User Search</Link> · <Link to="/discord-username-search" className="text-primary hover:underline">Discord Username Search</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Check Your Username Now</h2>
            <p className="text-muted-foreground mb-8">Enter any Instagram username to check availability and cross-platform exposure.</p>
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
