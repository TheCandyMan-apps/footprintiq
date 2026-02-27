import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Eye, Users, Lock, Briefcase } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const PRIVACY_TIPS = [
  "Use a professional headshot rather than social photos — reverse image search links accounts cross-platform",
  "Avoid using your personal email address as your LinkedIn username or URL slug",
  "Customise your public profile URL to control what appears in search engine results",
  "Review 'Profile viewing options' — anonymous browsing prevents others from seeing you viewed their profile",
  "Audit your 'Activity' section — likes, comments, and shares on posts are often publicly visible",
];

const FAQS = [
  {
    question: "Can you search LinkedIn profiles by username?",
    answer: "Yes. LinkedIn profiles have public URLs that often include a custom slug or username. FootprintIQ checks whether a username exists on LinkedIn alongside 500+ other platforms, revealing cross-platform identity connections from publicly accessible data only.",
  },
  {
    question: "Is LinkedIn profile searching legal?",
    answer: "Yes. Viewing publicly accessible LinkedIn profiles is legal — LinkedIn deliberately makes professional profiles discoverable by search engines. FootprintIQ only accesses publicly available information and never bypasses authentication or scrapes private data.",
  },
  {
    question: "What can you find from a LinkedIn username search?",
    answer: "Our scan confirms whether a username exists on LinkedIn and identifies where the same handle appears across other platforms. This reveals how professional and personal digital identities connect — useful for self-audits, verifying identities, and understanding digital exposure.",
  },
  {
    question: "Can employers see my LinkedIn activity?",
    answer: "If your profile is set to public, anyone — including employers — can view your profile, posts, comments, and endorsements. FootprintIQ helps you understand exactly what's publicly visible about your professional identity across LinkedIn and other platforms.",
  },
  {
    question: "How do I reduce my LinkedIn exposure?",
    answer: "Adjust privacy settings: set profile viewing to 'Private mode', limit connection list visibility, control activity broadcasting, and review your public profile settings. Run a FootprintIQ scan to see what's visible externally before making changes.",
  },
];

export default function LinkedInUsernameSearchPage() {
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
      { "@type": "ListItem", position: 2, name: "LinkedIn Username Search", item: "https://footprintiq.app/linkedin-username-search" },
    ],
  };

  return (
    <>
      <Helmet>
        <title>LinkedIn Username Search — Find LinkedIn Profiles Free | FootprintIQ</title>
        <meta name="description" content="Search LinkedIn usernames and find connected professional profiles across 500+ platforms. Free LinkedIn profile lookup and username search tool." />
        <link rel="canonical" href="https://footprintiq.app/linkedin-username-search" />
        <meta property="og:title" content="LinkedIn Username Search | FootprintIQ" />
        <meta property="og:description" content="Find LinkedIn profiles and connected accounts. Free username search across platforms." />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Briefcase className="h-3 w-3 mr-1.5" />
              LinkedIn Username Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              LinkedIn Username Search
              <span className="block text-primary mt-2">Find LinkedIn Profiles Free</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search any LinkedIn username to find the profile and discover where else 
              that professional identity appears across social media and the web.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                LinkedIn profile check
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
              What Our LinkedIn Username Search Reveals
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Profile Existence</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify if a LinkedIn profile exists with that username or custom URL slug. We check public availability without requiring login.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Connected Profiles</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover where the same username appears on Twitter, GitHub, personal websites, and 500+ other services — mapping professional digital identity.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Lock className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Professional Exposure</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how your LinkedIn presence connects to personal accounts. Username reuse between professional and personal platforms creates exposure risks.
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
              Why LinkedIn Exposure Matters
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              LinkedIn is the most publicly indexed professional network. Understanding what it reveals about you is essential for career protection and personal safety.
            </p>
            <div className="prose prose-sm max-w-none text-muted-foreground space-y-4">
              <p>
                LinkedIn profiles are intentionally public by design — the platform's value depends on discoverability. This means your professional history, location, skills, recommendations, and activity are often visible to anyone, including people outside your network and search engine crawlers.
              </p>
              <p>
                For professionals, this creates a double-edged sword. Visibility drives career opportunities, but it also exposes personal details to threat actors. Spear-phishing attacks frequently use LinkedIn data to craft convincing messages, and social engineering campaigns target employees whose roles and reporting structures are publicly listed.
              </p>
              <p>
                Username reuse compounds the risk. If your LinkedIn URL slug matches your handle on <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X</Link>, Reddit, or gaming platforms, an attacker can quickly build a comprehensive profile. FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">cross-platform username search</Link> reveals these connections before they're exploited.
              </p>
              <p>
                A <Link to="/digital-footprint-scan" className="text-primary hover:underline">full digital footprint scan</Link> maps your professional and personal exposure simultaneously — essential for executives, job seekers, and anyone in a public-facing role.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Tips */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              LinkedIn Privacy Tips
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Concerned about your LinkedIn exposure? Follow these steps to improve your privacy.
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
              Related searches: <Link to="/usernames" className="text-primary hover:underline">Username Scanner</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Guides: <Link to="/guides/employers-digital-footprint" className="text-primary hover:underline">How Employers Check Your Digital Footprint</Link> · <Link to="/for/job-seekers" className="text-primary hover:underline">For Job Seekers</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Search LinkedIn Username Now
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter a LinkedIn username above to find the profile and connected accounts. Free and instant.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Check Your Exposure
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
