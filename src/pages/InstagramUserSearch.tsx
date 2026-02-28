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
    question: "Can you search for an Instagram user without an account?",
    answer: "Yes. Our tool checks whether an Instagram username exists and cross-references it across 500+ platforms — no Instagram login required. We only access publicly available data.",
  },
  {
    question: "How do I find someone on Instagram by username?",
    answer: "Enter the username in our search tool. We'll verify if the profile exists on Instagram and show you where else that handle appears online, including Twitter/X, TikTok, Reddit, and more.",
  },
  {
    question: "Is Instagram user search legal?",
    answer: "Yes. We only check publicly available profile information — the same data visible to any Instagram visitor. We never bypass private account settings or access protected content.",
  },
  {
    question: "What information can you find from an Instagram username?",
    answer: "Our scan checks whether the username is registered on Instagram and identifies the same handle across 500+ other platforms. This reveals cross-platform connections and potential digital footprint exposure.",
  },
  {
    question: "Can I check my own Instagram exposure?",
    answer: "Absolutely. Enter your Instagram username to see where that handle appears elsewhere online. This helps you audit your digital footprint and identify accounts you may have forgotten about.",
  },
];

export default function InstagramUserSearch() {
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
      { "@type": "ListItem", position: 2, name: "Instagram User Search", item: "https://footprintiq.app/instagram-user-search" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Instagram User Search — Find Instagram Profiles Free | FootprintIQ</title>
        <meta name="description" content="Search Instagram usernames and find connected profiles across 500+ platforms. Free Instagram user lookup and cross-platform identity search tool." />
        <link rel="canonical" href="https://footprintiq.app/instagram-user-search" />
        <meta property="og:title" content="Instagram User Search | FootprintIQ" />
        <meta property="og:description" content="Find Instagram profiles and connected accounts by username. Free cross-platform search." />
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
              Instagram User Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Instagram User Search
              <span className="block text-primary mt-2">Find Instagram Profiles by Username</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
              Search any Instagram username to check whether the profile exists and discover where that same handle appears across social media, forums, and the wider web.
            </p>
            <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
              FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search tool</Link> checks 500+ platforms in seconds. No login needed, no private data accessed — just clear, ethical intelligence about a username's online presence.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Instagram profile check</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Cross-platform scan</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-primary" />Free instant results</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">Five steps to a complete Instagram username search.</p>
            <div className="space-y-4">
              {[
                "Enter the Instagram username you want to search.",
                "Our engine checks Instagram for profile existence and public availability.",
                "We cross-reference the username against 500+ platforms including TikTok, Twitter/X, Reddit, and dating sites.",
                "Results are filtered using our false-positive detection pipeline to ensure accuracy.",
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
                  <h3 className="font-semibold mb-2">Profile Existence</h3>
                  <p className="text-sm text-muted-foreground">Verify if an Instagram account exists with that username. We check availability without requiring you to log in.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Connected Profiles</h3>
                  <p className="text-sm text-muted-foreground">Discover where the same username appears on <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok</Link>, <Link to="/discord-username-search" className="text-primary hover:underline">Discord</Link>, Reddit, gaming platforms, and 500+ other sites.</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Privacy Analysis</h3>
                  <p className="text-sm text-muted-foreground">Understand how username reuse connects online identities. See the <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint</Link> behind a single handle.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Body Content */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6 prose prose-sm dark:prose-invert">
            <h2>Why Instagram Usernames Reveal More Than You Think</h2>
            <p>
              Instagram is one of the most widely used social platforms globally, with over two billion monthly active users. Many people use the same username across Instagram, TikTok, Twitter/X, and other platforms — creating a traceable chain of connected accounts that's visible to anyone who knows where to look.
            </p>
            <p>
              Our Instagram user search identifies these connections by checking a username across 500+ platforms simultaneously. This isn't about accessing private photos or stories — it's about understanding how a single handle ties together a broader online identity.
            </p>

            <h3>Common Use Cases</h3>
            <p>
              Self-auditing before a job application. Verifying an online seller's identity. Checking whether a dating match uses the same username elsewhere. Investigating potential impersonation. All of these scenarios benefit from a cross-platform username search — and all are handled ethically by FootprintIQ.
            </p>

            <h3>Our Ethical Approach</h3>
            <p>
              FootprintIQ is built on <Link to="/ethical-osint-charter" className="text-primary hover:underline">ethical OSINT principles</Link>. We never access private accounts, bypass login screens, or scrape content behind authentication. Every result comes from publicly available data — the same information anyone can find by visiting a platform directly.
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
              Related searches: <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Username Search</Link> · <Link to="/usernames" className="text-primary hover:underline">Full Username Scanner</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Run a Free Scan</h2>
            <p className="text-muted-foreground mb-8">Enter an Instagram username above to find connected profiles across 500+ platforms.</p>
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
