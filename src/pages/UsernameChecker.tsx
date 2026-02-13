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
  Users,
  AlertTriangle,
  Fingerprint,
  Globe,
  Eye,
  Code,
  ShoppingBag,
  FileText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const UsernameChecker = () => {
  const faqs = [
    {
      question: "Is a username checker accurate?",
      answer:
        "No username checker is 100% accurate. FootprintIQ uses confidence scoring and false-positive filtering to improve reliability, but results reflect publicly indexed data. Common or generic usernames may return matches that belong to different people. Always verify matches before drawing conclusions.",
    },
    {
      question: "Can it find private accounts?",
      answer:
        "No. FootprintIQ only searches publicly accessible information. Private, locked, or deactivated accounts are never included. The platform is built on ethical OSINT principles and does not attempt to access data behind authentication or privacy settings.",
    },
    {
      question: "Does it work for Instagram, TikTok, X, Reddit, and GitHub?",
      answer:
        "FootprintIQ checks usernames across 500+ platforms, including major social networks, forums, developer platforms, and community sites. Coverage depends on whether a platform exposes public profile pages. Some platforms with aggressive bot protection may have reduced accuracy.",
    },
    {
      question: 'Why do I see "possible match"?',
      answer:
        "A 'possible match' means the username was found on a platform but the confidence score is below our verification threshold. This can occur with common usernames, platforms with minimal public profile data, or when the profile lacks cross-referencing signals. We recommend verifying these matches manually.",
    },
    {
      question: "Is it legal to run a username check?",
      answer:
        "Yes. Searching for publicly available information is legal in most jurisdictions. FootprintIQ only accesses data that is already visible to anyone on the public internet. However, how you use the results matters — always respect privacy laws and platform terms of service in your jurisdiction.",
    },
    {
      question: "How do I reduce my online exposure?",
      answer:
        "Start by running a scan to see where your username appears. Then review each platform's privacy settings, delete unused accounts, and avoid reusing the same username across services. Our guides on reducing your digital footprint and data broker removal provide step-by-step instructions.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
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
        name: "Username Checker",
        item: "https://footprintiq.app/username-checker",
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Username Checker: Check a Username Across Social Platforms",
    description:
      "Check if a username exists across 500+ social media platforms and forums. Free OSINT username search with privacy-first methodology.",
    author: {
      "@type": "Organization",
      name: "FootprintIQ",
    },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: {
        "@type": "ImageObject",
        url: "https://footprintiq.app/og-image.png",
      },
    },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://footprintiq.app/username-checker",
    },
  };

  const comparisonRows = [
    { feature: "Finds existing public profiles", footprint: true, availability: false },
    { feature: "Checks brand handle availability", footprint: false, availability: true },
    { feature: "Confidence scoring", footprint: true, availability: false },
    { feature: "Verification guidance", footprint: true, availability: false },
    { feature: "Privacy-first / ethical positioning", footprint: true, availability: "varies" },
  ];

  const discoveryItems = [
    { icon: Users, label: "Public social profiles" },
    { icon: Globe, label: "Forums and communities" },
    { icon: Code, label: "Developer platforms" },
    { icon: ShoppingBag, label: "Marketplaces (public listings)" },
    { icon: FileText, label: "Mentions and indexed public pages" },
  ];

  const verifyTips = [
    "Check bio links — consistent cross-platform linking suggests the same person.",
    "Compare profile photos — reverse image search can confirm shared identity.",
    "Look for location consistency across profiles.",
    "Check connected accounts — some platforms display linked profiles.",
    "Review post history and writing style for consistency.",
  ];

  return (
    <>
      <Helmet>
        <title>Username Checker – Search Usernames Across 500+ Platforms | FootprintIQ</title>
        <meta
          name="description"
          content="Check if a username exists across 500+ social media platforms and forums. Free OSINT username search with privacy-first methodology."
        />
        <link rel="canonical" href="https://footprintiq.app/username-checker" />

        <meta property="og:title" content="Username Checker – Search Usernames Across 500+ Platforms | FootprintIQ" />
        <meta property="og:description" content="Check if a username exists across 500+ social media platforms and forums. Free OSINT username search with privacy-first methodology." />
        <meta property="og:url" content="https://footprintiq.app/username-checker" />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Username Checker – Search Usernames Across 500+ Platforms | FootprintIQ" />
        <meta name="twitter:description" content="Check if a username exists across 500+ social media platforms and forums. Free OSINT username search with privacy-first methodology." />

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
                <span className="text-foreground">Username Checker</span>
              </nav>
            </div>
          </div>

          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Username Search Tool</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Username Checker: Check a Username Across Social Platforms
                </h1>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                  Search for a username across 500+ public platforms to see where it appears.
                  Powered by ethical OSINT methodology with confidence scoring and false-positive filtering.
                </p>

                <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
                  Results are based on publicly accessible data only and may include false positives.
                  Always verify matches directly on the platform before drawing conclusions.
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

          {/* What a Username Checker Can Find */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What a Username Checker Can Find
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  A username checker scans publicly indexed pages and platform endpoints to identify where a
                  specific username has been registered or mentioned. Here's what it can surface:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discoveryItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
                    >
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

          {/* How FootprintIQ Checks a Username */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How FootprintIQ Checks a Username
                  </h2>
                </div>

                <div className="space-y-6 mt-8">
                  {[
                    {
                      step: 1,
                      title: "Normalise username variants",
                      desc: "We account for case variations, underscores, dots, and common substitutions to ensure broad coverage.",
                    },
                    {
                      step: 2,
                      title: "Search public pages and endpoints",
                      desc: "Our engine queries publicly accessible profile URLs and platform APIs across 500+ services.",
                    },
                    {
                      step: 3,
                      title: "Score confidence using signals",
                      desc: "Each match is scored based on exact match quality, profile metadata availability, and cross-platform linking signals.",
                    },
                    {
                      step: 4,
                      title: "Reduce false positives",
                      desc: "Common names, generic usernames, and placeholder profiles are flagged and deprioritised to improve result quality.",
                    },
                    {
                      step: 5,
                      title: 'Present results with "Verify" guidance',
                      desc: "Every result includes a confidence level and verification tips so you can confirm whether a match is genuine.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-6 rounded-xl bg-card border border-border"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground mt-8 text-sm">
                  All scanning is performed using publicly available data. FootprintIQ does not access private
                  accounts, bypass authentication, or store personal data from scanned profiles.
                </p>
              </div>
            </div>
          </section>

          {/* Accuracy & False Positives */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Accuracy &amp; False Positives
                  </h2>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border mb-8">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-foreground font-medium">
                      Same username ≠ same person. A matching username on two platforms does not confirm
                      they belong to the same individual.
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    Common usernames like "alex2024" or "john_doe" will naturally appear on many platforms.
                    FootprintIQ provides confidence scoring to help distinguish likely matches from coincidental ones,
                    but manual verification is always recommended.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-4">
                  How to Verify a Match
                </h3>

                <div className="space-y-3">
                  {verifyTips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Username Reuse Is Risky */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why Username Reuse Is Risky
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    Reusing the same username across platforms creates a{" "}
                    <strong className="text-foreground">visibility pattern</strong> that can be exploited.
                    When a single username links multiple accounts together, it becomes easier for malicious
                    actors to build a profile, attempt credential stuffing, or craft targeted social engineering attacks.
                  </p>
                  <p>
                    Data brokers and people-search sites amplify this risk by aggregating public profiles
                    and correlating them with other publicly available data — turning individual accounts
                    into a comprehensive identity map.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Link
                    to="/ai-answers/why-username-reuse-is-risky"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    Why username reuse is risky <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/digital-footprint-check"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    Check your digital footprint <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Username Checker vs Availability Tools */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Username Checker vs Username Availability Tools
                  </h2>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                        <th className="text-center p-4 font-semibold text-foreground">
                          FootprintIQ Username Checker
                        </th>
                        <th className="text-center p-4 font-semibold text-foreground">
                          Availability Checker
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.feature} className="border-t border-border">
                          <td className="p-4 text-muted-foreground">{row.feature}</td>
                          <td className="p-4 text-center">
                            {row.footprint === true ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {row.availability === true ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                            ) : row.availability === "varies" ? (
                              <span className="text-sm text-muted-foreground italic">varies</span>
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

                <Accordion type="single" collapsible className="space-y-3">
                  {faqs.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`faq-${i}`}
                      className="bg-card border border-border rounded-xl px-6"
                    >
                      <AccordionTrigger className="text-foreground font-medium text-left py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <div className="p-10 rounded-2xl bg-card border border-border shadow-lg">
                  <Fingerprint className="h-12 w-12 text-primary mx-auto mb-6" />
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Run a Free Username Scan
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Check your username across publicly available platforms in seconds.
                    See where you appear — and decide what to do about it.
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
            </div>
          </section>

          {/* Related Resources */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Related Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      to: "/social-media-finder",
                      title: "Social Media Finder",
                      desc: "Search for public profiles linked to a username across social platforms",
                    },
                    {
                      to: "/digital-footprint-check",
                      title: "Digital Footprint Check",
                      desc: "Discover what personal data is publicly visible about you online",
                    },
                    {
                      to: "/ai-answers-hub",
                      title: "AI Answers Hub",
                      desc: "Get answers to OSINT, digital privacy, and data exposure questions",
                    },
                    {
                      to: "/privacy/google-content-removal",
                      title: "Google Content Removal",
                      desc: "Learn how to request removal of personal information from Google",
                    },
                  ].map((resource) => (
                    <Link
                      key={resource.to}
                      to={resource.to}
                      className="p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                    >
                      <h3 className="text-foreground font-semibold mb-1 group-hover:text-primary transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{resource.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default UsernameChecker;
