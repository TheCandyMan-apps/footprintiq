import { Helmet } from "react-helmet-async";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
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
  AlertTriangle,
  Fingerprint,
  Globe,
  Eye,
  Users,
  Code,
  ShoppingBag,
  FileText,
  MessageSquare,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";

const ReverseUsernameSearch = () => {
  const faqs = [
    {
      question: "Is reverse username search accurate?",
      answer:
        "No reverse username search is 100% accurate. FootprintIQ applies confidence scoring and false-positive filtering to improve reliability, but a matching username on two platforms does not confirm they belong to the same person. Common or generic usernames will naturally appear across many services.",
    },
    {
      question: "Can it find private profiles?",
      answer:
        "No. FootprintIQ only searches publicly accessible information. Private, locked, or deactivated accounts are never included. The platform does not attempt to bypass authentication or access data behind privacy settings.",
    },
    {
      question: 'Why do I see "possible match"?',
      answer:
        "A 'possible match' means the username was found on a platform but the confidence score is below our verification threshold. This happens frequently with common usernames or platforms that expose limited public profile data. We recommend verifying these matches manually using bio links, profile photos, and posting history.",
    },
    {
      question: "Is it legal to search usernames?",
      answer:
        "Yes. Searching for publicly available information is legal in most jurisdictions. FootprintIQ only accesses data already visible to anyone on the public internet. However, how you use the results is your responsibility — always respect applicable privacy laws and platform terms of service.",
    },
    {
      question: "Can I remove my data from results?",
      answer:
        "FootprintIQ does not host or store your public profiles — it discovers where they already exist. To reduce your exposure, you can adjust privacy settings on individual platforms, delete unused accounts, or request content removal directly from the platforms and search engines where your data appears.",
    },
    {
      question: "What's the best way to protect my username?",
      answer:
        "Avoid reusing the same username across platforms. Use unique handles for sensitive accounts, enable two-factor authentication, and periodically audit your digital footprint. Our guides on reducing your digital footprint provide detailed, step-by-step instructions.",
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
        name: "Reverse Username Search",
        item: "https://footprintiq.app/reverse-username-search",
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Reverse Username Search: Find Public Accounts by Username",
    description:
      "Run a reverse username search to find public accounts and mentions across social platforms, forums, and communities. Privacy-first OSINT scanning.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://footprintiq.app/reverse-username-search",
    },
  };

  const comparisonRows = [
    { feature: "Platform-specific checks", footprint: true, google: "partial" },
    { feature: "Confidence guidance", footprint: true, google: false },
    { feature: "False positive warnings", footprint: true, google: false },
    { feature: "Privacy-first UX", footprint: true, google: false },
  ];

  const sourceItems = [
    { icon: Users, label: "Social platforms (public profiles)" },
    { icon: MessageSquare, label: "Forums & communities" },
    { icon: Code, label: "Developer platforms (GitHub-style)" },
    { icon: ShoppingBag, label: "Marketplaces (public listings)" },
    { icon: FileText, label: "Blogs / comment sections (public)" },
    { icon: Shield, label: "Public breach indicators (where lawful)" },
  ];

  return (
    <>
      <Helmet>
        <title>Reverse Username Search – Find Public Accounts by Username | FootprintIQ</title>
        <meta
          name="description"
          content="Run a reverse username search to find public accounts and mentions across social platforms, forums, and communities. Privacy-first OSINT scanning."
        />
        <link rel="canonical" href="https://footprintiq.app/reverse-username-search" />

        <meta property="og:title" content="Reverse Username Search – Find Public Accounts by Username | FootprintIQ" />
        <meta property="og:description" content="Run a reverse username search to find public accounts and mentions across social platforms, forums, and communities. Privacy-first OSINT scanning." />
        <meta property="og:url" content="https://footprintiq.app/reverse-username-search" />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reverse Username Search – Find Public Accounts by Username | FootprintIQ" />
        <meta name="twitter:description" content="Run a reverse username search to find public accounts and mentions across social platforms, forums, and communities. Privacy-first OSINT scanning." />

        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* Intent Alignment */}
          <IntentAlignmentBanner />
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b border-border/50">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Reverse Username Search</span>
              </nav>
            </div>
          </div>

          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Reverse Username Lookup</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Reverse Username Search: Find Public Accounts by Username
                </h1>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                  Enter a username to discover where it appears across public social platforms, forums,
                  developer sites, and communities. Powered by ethical OSINT methodology with confidence
                  scoring.
                </p>

                <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
                  Matches may be coincidental — the same username on different platforms does not confirm
                  they belong to the same person. Always verify results directly.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Start Free Scan
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/username-checker">Username Checker</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* What Is Reverse Username Search? */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What Is Reverse Username Search?
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    A reverse username search takes a known username and searches for public pages where
                    it appears — social media profiles, forum accounts, developer repositories, and more.
                    It's a way to understand the public visibility of a specific handle across the internet.
                  </p>
                  <p>
                    This is fundamentally different from "people search" or "background check" services.
                    A reverse username search does not attempt to identify individuals, access private data,
                    or compile personal dossiers. It only surfaces what is already publicly indexed.
                  </p>
                  <p>
                    FootprintIQ uses{" "}
                    <Link to="/what-is-osint" className="text-primary hover:underline">
                      OSINT methodology
                    </Link>{" "}
                    to perform these searches ethically — querying public endpoints without logging into
                    platforms, bypassing privacy settings, or scraping behind authentication.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What We Check */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What We Check (Public Sources)
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  FootprintIQ searches across a wide range of publicly accessible sources to find where
                  a username has been registered or mentioned:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sourceItems.map((item) => (
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

          {/* How FootprintIQ Reduces False Positives */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How FootprintIQ Reduces False Positives
                  </h2>
                </div>

                <div className="p-6 rounded-xl bg-card border border-border mb-8">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                    <p className="text-foreground font-medium">
                      Common usernames like "alex" or "admin" will appear on hundreds of platforms.
                      This does not mean they belong to the same person.
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    FootprintIQ uses confidence scoring based on exact match quality, profile metadata
                    availability, and cross-platform linking signals to help distinguish likely matches
                    from coincidental ones.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Verification Checklist
                </h3>

                <div className="space-y-3">
                  {[
                    "Check bio links — consistent cross-platform linking suggests the same person.",
                    "Review profile history — account age and posting patterns provide context.",
                    "Look for cross-links — some platforms display connected accounts.",
                    "Compare location references — geographic consistency across profiles is a signal.",
                    "Examine profile photos — reverse image search can confirm shared identity.",
                  ].map((tip, i) => (
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

          {/* Why This Matters */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why This Matters: Security &amp; Privacy
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    {
                      title: "Credential Stuffing",
                      desc: "Reused usernames paired with leaked passwords make automated account takeover trivial across platforms.",
                    },
                    {
                      title: "Impersonation",
                      desc: "Publicly visible usernames can be cloned on platforms where the original user doesn't have an account.",
                    },
                    {
                      title: "Doxxing Exposure",
                      desc: "Linking accounts across platforms can reveal personal details that were intended to stay separate.",
                    },
                    {
                      title: "Identity Stitching",
                      desc: "Data brokers aggregate public profiles to build comprehensive identity maps from individual accounts.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="p-5 rounded-xl bg-card border border-border"
                    >
                      <h3 className="text-foreground font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/digital-footprint-check"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    Check your digital footprint <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link
                    to="/ai-answers/why-username-reuse-is-risky"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    Why username reuse is risky <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Reverse Username Search vs Google */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Reverse Username Search vs Google
                  </h2>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                        <th className="text-center p-4 font-semibold text-foreground">FootprintIQ</th>
                        <th className="text-center p-4 font-semibold text-foreground">Google</th>
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
                            {row.google === true ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                            ) : row.google === "partial" ? (
                              <span className="text-sm text-muted-foreground italic">partial</span>
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
                    Run a Free Reverse Username Search
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Check where a username appears across publicly available platforms.
                    See the results — and decide what action to take.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg">
                      <Link to="/scan">
                        Start Free Scan
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/username-checker">Username Checker</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/social-media-finder">Social Media Finder</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools & Guides */}
          <RelatedToolsGrid currentPath="/reverse-username-search" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ReverseUsernameSearch;
