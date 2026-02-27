import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, CheckCircle, ArrowRight, Eye, Users, Lock, Heart } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Use a unique username on dating platforms that doesn't match your other social media handles",
  "Avoid uploading photos already used on public social profiles — reverse image search can link accounts",
  "Disable 'show me in search results' options where available to limit discoverability",
  "Review what personal details (occupation, location, education) your dating profile exposes publicly",
  "Regularly audit which dating accounts are still active — forgotten profiles stay indexed",
];

const FAQS = [
  {
    question: "Can you search dating profiles by username?",
    answer: "Yes. Many dating platforms use public or semi-public usernames. FootprintIQ checks whether a known username exists across 500+ platforms, including popular dating services. Only publicly accessible profile data is checked — private messages and match information are never accessed.",
  },
  {
    question: "Is it legal to look up dating profiles?",
    answer: "Viewing publicly accessible dating profile information is legal. FootprintIQ only accesses data that the platform makes publicly available. We never bypass authentication, access private messages, or scrape data behind login walls. Ethical use includes self-audits, identity verification, and authorised investigations.",
  },
  {
    question: "Why would someone search for dating profiles?",
    answer: "Common legitimate reasons include: checking your own dating profile exposure, verifying someone's identity before meeting in person, conducting authorised background research, and assessing whether old dating profiles are still publicly visible after deactivation.",
  },
  {
    question: "Can FootprintIQ access private dating messages?",
    answer: "No. FootprintIQ only detects whether a username exists on dating platforms and retrieves publicly visible metadata. Private messages, match lists, swipe history, and conversation content are never accessed. Our Ethical OSINT Charter prohibits accessing any non-public data.",
  },
  {
    question: "How do I check if my dating profile is publicly visible?",
    answer: "Enter your dating username in FootprintIQ's scanner. The scan reveals whether your handle exists across dating platforms and other services, showing you exactly what's publicly discoverable. This helps you identify and lock down profiles you thought were private.",
  },
];

export default function DatingProfileLookupPage() {
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
      { "@type": "ListItem", position: 2, name: "Dating Profile Lookup", item: "https://footprintiq.app/dating-profile-lookup" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Dating Profile Lookup — Find Dating Profiles by Username | FootprintIQ</title>
        <meta name="description" content="Search dating profiles by username across Tinder, Bumble, Hinge, and 500+ platforms. Free dating profile lookup tool with ethical OSINT methodology." />
        <link rel="canonical" href="https://footprintiq.app/dating-profile-lookup" />
        <meta property="og:title" content="Dating Profile Lookup | FootprintIQ" />
        <meta property="og:description" content="Find dating profiles and connected accounts. Free username search across dating platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Heart className="h-3 w-3 mr-1.5" />
              Dating Profile Search
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Dating Profile Lookup
              <span className="block text-primary mt-2">Find Dating Profiles by Username</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search a username to discover dating profiles across Tinder, Bumble, Hinge, 
              and hundreds of other platforms. Verify identities ethically.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Dating platform check
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
              What Our Dating Profile Lookup Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Profile Existence</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify if a username exists on dating platforms. We check profile availability across Tinder, Bumble, Hinge, OkCupid, and more.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Connected Identities</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover where the same username appears on social media, forums, and 500+ other services — revealing the full digital identity behind a dating profile.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Exposure Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how username reuse between dating apps and social media creates identity exposure. See what someone could discover about you from a single handle.
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
              Why Dating Profile Exposure Matters
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Dating profiles often contain personal details that users assume are private. Understanding your dating exposure is essential for personal safety.
            </p>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                Dating platforms represent some of the most sensitive digital exposure points. Users willingly share age, location, occupation, photos, and personal preferences — often under the assumption that this information is only visible to potential matches. In reality, many dating platforms expose profile data more broadly than users realise.
              </p>
              <p>
                Username reuse is particularly risky in the dating context. If someone uses the same handle on Tinder and Instagram, a simple <Link to="/usernames" className="text-primary hover:underline">username search</Link> can link their dating activity to their real identity. This creates risks ranging from embarrassment to stalking and harassment.
              </p>
              <p>
                FootprintIQ — Ethical Digital Footprint Intelligence Platform — helps users understand these connections before someone else discovers them. Our <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint scan</Link> maps username exposure across dating platforms and social media simultaneously, giving you the intelligence to protect your privacy proactively.
              </p>
              <p>
                For those concerned about romance scams, cross-referencing a dating profile username across other platforms can reveal inconsistencies that indicate fraudulent accounts. Our guide on <Link to="/romance-scam-warning-signs" className="text-primary hover:underline">romance scam warning signs</Link> covers what to look for.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Tips */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Dating Profile Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Concerned about your dating profile exposure? Follow these steps to reduce your risk.
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
              Related searches: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Username Search</Link> · <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Guides: <Link to="/romance-scam-warning-signs" className="text-primary hover:underline">Romance Scam Warning Signs</Link> · <Link to="/find-dating-profiles" className="text-primary hover:underline">Find Dating Profiles</Link> · <Link to="/search-dating-sites-by-email" className="text-primary hover:underline">Search Dating Sites by Email</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Check Your Dating Profile Exposure
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter a username above to discover dating profiles and connected accounts across 500+ platforms. Free and instant.
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
