import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Eye, Users, Lock, Send } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Set your phone number visibility to 'Nobody' in Settings → Privacy → Phone Number",
  "Use a unique username that doesn't match your handles on other platforms",
  "Disable 'Link to my account when forwarding my messages' to prevent attribution in shared messages",
  "Restrict who can add you to groups — Settings → Privacy → Groups → 'My Contacts'",
  "Review public channels you admin for personal information that could identify you",
];

const FAQS = [
  {
    question: "Can you search Telegram by username?",
    answer: "Yes. If someone has a public Telegram username (@handle), FootprintIQ can check whether that username exists on Telegram and across 500+ other platforms simultaneously. Only publicly visible profile information is accessed — private messages are never accessible.",
  },
  {
    question: "Is Telegram username searching legal?",
    answer: "Yes. Accessing publicly available Telegram profile information is legal in most jurisdictions. FootprintIQ only checks public usernames and metadata — it never accesses private messages, closed groups, or phone number data. Our Ethical OSINT Charter defines clear boundaries for responsible use.",
  },
  {
    question: "Can Telegram private messages be found through OSINT?",
    answer: "No. Private Telegram messages cannot be accessed through legitimate OSINT methods. Any tool claiming to provide access to private messages is either fraudulent or operating illegally. FootprintIQ only accesses publicly visible information.",
  },
  {
    question: "What information does a Telegram username search reveal?",
    answer: "Our scan confirms whether the username exists on Telegram and identifies the same handle across 500+ other platforms. For public Telegram profiles, display name, profile photo, and bio may be visible. Cross-platform correlation reveals the broader digital identity behind the handle.",
  },
  {
    question: "How do I check my own Telegram exposure?",
    answer: "Enter your Telegram username in FootprintIQ's scanner. The scan checks whether your handle exists across 500+ platforms, revealing cross-platform exposure you may not be aware of. Review the results to understand what's publicly discoverable about your Telegram identity.",
  },
];

export default function TelegramUsernameSearchPage() {
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
      { "@type": "ListItem", position: 2, name: "Telegram Username Search", item: "https://footprintiq.app/telegram-username-search" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Telegram Username Search — Find Telegram Profiles Free | FootprintIQ</title>
        <meta name="description" content="Search Telegram usernames and find connected profiles across 500+ platforms. Free Telegram profile lookup and username search tool with ethical OSINT methodology." />
        <link rel="canonical" href="https://footprintiq.app/telegram-username-search" />
        <meta property="og:title" content="Telegram Username Search | FootprintIQ" />
        <meta property="og:description" content="Find Telegram profiles and connected accounts. Free username search across platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Send className="h-3 w-3 mr-1.5" />
              Telegram Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Telegram Username Search
              <span className="block text-primary mt-2">Find Telegram Profiles Free</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search any Telegram username to find the profile and discover where else 
              that handle appears across social media, forums, and the web.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Telegram profile check
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
              What Our Telegram Username Search Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Profile Existence</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify if a Telegram account exists with that @handle. We check public profile availability without requiring a Telegram account.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Connected Profiles</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover where the same username appears on Discord, Twitter, Reddit, GitHub, and 500+ other services — revealing cross-platform identity patterns.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Messenger Exposure</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how Telegram username reuse connects your messenger identity to public social media profiles and other digital accounts.
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
              Why Telegram Exposure Matters
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Telegram sits at the intersection of private messaging and public broadcasting — creating unique exposure risks.
            </p>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                With over 900 million monthly active users, Telegram has become one of the most significant platforms for digital exposure analysis. Unlike traditional social networks, Telegram blurs the line between private and public — users can maintain private conversations whilst simultaneously running public channels that search engines index.
              </p>
              <p>
                A username that appears harmless on Twitter might be linked to public Telegram channels that reveal professional affiliations, political views, or geographic indicators. FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search</Link> identifies these cross-platform connections from publicly accessible data only.
              </p>
              <p>
                For a deeper understanding of Telegram OSINT techniques and ethical boundaries, read our comprehensive <Link to="/guides/telegram-osint-search" className="text-primary hover:underline">Telegram OSINT guide</Link>. For broad exposure mapping, run a full <Link to="/digital-footprint-scan" className="text-primary hover:underline">digital footprint scan</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Tips */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Telegram Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Reduce your Telegram exposure with these privacy settings.
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
              Related searches: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/discord-username-search" className="text-primary hover:underline">Discord Username Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Username Search</Link> · <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Guides: <Link to="/guides/telegram-osint-search" className="text-primary hover:underline">Telegram OSINT Guide</Link> · <Link to="/guides/monitor-online-exposure" className="text-primary hover:underline">Monitor Your Online Exposure</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search Telegram Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter a Telegram username above to find the profile and connected accounts. Free and instant.
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
