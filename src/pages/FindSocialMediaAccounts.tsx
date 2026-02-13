import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Search,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shield,
  Globe,
  Eye,
  Users,
  Code,
  MessageSquare,
  Layers,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";

const FindSocialMediaAccounts = () => {
  const faqs = [
    {
      question: "Can I find private social media accounts?",
      answer:
        "No. FootprintIQ only searches publicly accessible profiles. Private, locked, or deactivated accounts are never included in results. The platform does not attempt to bypass authentication or access restricted content.",
    },
    {
      question: "Is it anonymous?",
      answer:
        "FootprintIQ queries publicly available data — it does not interact with or notify the accounts being searched. Your search query is processed securely and is not shared with third parties.",
    },
    {
      question: "Why are some matches uncertain?",
      answer:
        "Common usernames naturally appear on many platforms. When a username is found but there isn't enough supporting evidence to confirm it belongs to the same person, it's labelled as a 'possible match' with a lower confidence score.",
    },
    {
      question: "Does this work for Instagram/TikTok/X/Reddit?",
      answer:
        "FootprintIQ checks hundreds of platforms including major social networks. Coverage depends on whether the platform exposes public profile data. Some platforms restrict public access more than others, which may limit results.",
    },
    {
      question: "Is this legal?",
      answer:
        "Yes. Searching for publicly available information is legal in most jurisdictions. FootprintIQ only accesses data already visible to anyone on the public internet. How you use the results is your responsibility — always respect applicable privacy laws.",
    },
    {
      question: "How do I remove my info?",
      answer:
        "FootprintIQ does not host or store your profiles — it discovers where they already exist publicly. To reduce exposure, adjust privacy settings on individual platforms, delete unused accounts, and request removal from data brokers.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
      { "@type": "ListItem", position: 2, name: "Find Social Media Accounts", item: "https://footprintiq.app/find-social-media-accounts" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Find Social Media Accounts by Username",
    description: "Discover public social media accounts linked to a username. Ethical OSINT scanning with verification guidance and privacy-first methodology.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/find-social-media-accounts" },
  };

  const platformCategories = [
    { icon: Users, label: "Major social platforms (Facebook, X, Instagram, TikTok, LinkedIn)" },
    { icon: MessageSquare, label: "Forums and discussion boards (Reddit, Stack Exchange)" },
    { icon: Code, label: "Developer sites (GitHub, GitLab, Codepen)" },
    { icon: Layers, label: "Community networks (Discord servers, Mastodon instances)" },
    { icon: Globe, label: "Public listings and directories" },
  ];

  const verificationChecklist = [
    "Does the profile bio match known information?",
    "Are there cross-links to other confirmed profiles?",
    "Is the account creation date consistent with the person's history?",
    "Does the profile picture appear on other verified accounts?",
    "Is the location or language consistent across platforms?",
    "Does the posting style or content match expectations?",
  ];

  return (
    <>
      <Helmet>
        <title>Find Social Media Accounts by Username | FootprintIQ</title>
        <meta name="description" content="Discover public social media accounts linked to a username. Ethical OSINT scanning with verification guidance and privacy-first methodology." />
        <link rel="canonical" href="https://footprintiq.app/find-social-media-accounts" />

        <meta property="og:title" content="Find Social Media Accounts by Username | FootprintIQ" />
        <meta property="og:description" content="Discover public social media accounts linked to a username. Ethical OSINT scanning with verification guidance and privacy-first methodology." />
        <meta property="og:url" content="https://footprintiq.app/find-social-media-accounts" />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Find Social Media Accounts by Username | FootprintIQ" />
        <meta name="twitter:description" content="Discover public social media accounts linked to a username. Ethical OSINT scanning with verification guidance and privacy-first methodology." />

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b border-border/50">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Find Social Media Accounts</span>
              </nav>
            </div>
          </div>

          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Social Media Account Finder</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Find Social Media Accounts by Username
                </h1>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                  Enter a username to discover where public social media accounts exist across platforms, forums, and communities. Privacy-first OSINT methodology with confidence scoring.
                </p>

                <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
                  Results show publicly indexed profiles only. The same username on different platforms does not confirm they belong to the same person. Always verify matches.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Start Free Scan
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/social-media-finder">Social Media Finder</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* How to Find Social Media Accounts */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How to Find Social Media Accounts
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Most people reuse the same username across multiple platforms. This makes it possible to discover public accounts by searching for a specific handle across hundreds of services simultaneously.
                  </p>
                  <p>
                    Manual searching is time-consuming and misses platforms you may not know about. FootprintIQ automates this process by querying public profile endpoints, applying confidence scoring, and filtering out likely false positives — all without accessing private data or requiring login credentials.
                  </p>
                  <p>
                    Public profile indexing varies by platform. Some services expose profile pages to search engines, while others restrict visibility. FootprintIQ checks a wide range of sources to maximise coverage while respecting each platform's public access policies.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What Platforms Are Checked */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What Platforms Are Checked
                  </h2>
                </div>

                <p className="text-muted-foreground mb-6">
                  FootprintIQ scans publicly accessible endpoints across a wide range of platform categories. We do not claim partnerships with any platform — all checks use publicly available data.
                </p>

                <div className="space-y-3">
                  {platformCategories.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Common Challenges */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <XCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Common Challenges
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    "Private accounts — locked or restricted profiles are not visible to public queries.",
                    "Username collisions — common usernames will appear on many platforms coincidentally.",
                    "Regional differences — some platforms limit content visibility by geography.",
                    "Deleted accounts — previously active profiles may no longer be accessible.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                      <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* How to Verify Matches */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How to Verify Matches
                  </h2>
                </div>

                <p className="text-muted-foreground mb-6">
                  Use this checklist to evaluate whether a matched profile is genuinely linked to the username you're investigating:
                </p>

                <div className="space-y-3">
                  {verificationChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why It Matters for Security */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why It Matters for Security
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Discovering where your username appears publicly is a critical step in understanding your digital exposure. Reused usernames across platforms create a traceable pattern that can be exploited for credential stuffing, social engineering, or identity stitching.
                  </p>
                  <p>
                    By auditing your public social media footprint, you can identify accounts you've forgotten about, reduce your attack surface, and take proactive steps to protect your privacy.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Link to="/digital-footprint-check" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Check your digital footprint <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link to="/privacy/google-content-removal" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Google content removal guide <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                  Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left text-foreground">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* CTA Block */}
          <section className="py-16 md:py-20 bg-gradient-to-b from-primary/5 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Find Social Media Accounts Now
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Discover where your username appears across public social platforms, forums, and communities.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Start Free Scan
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/social-media-finder">Social Media Finder</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools & Guides */}
          <RelatedToolsGrid currentPath="/find-social-media-accounts" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default FindSocialMediaAccounts;
