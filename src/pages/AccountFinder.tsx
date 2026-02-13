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
  Fingerprint,
  Globe,
  Eye,
  Users,
  Code,
  FileText,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";

const AccountFinder = () => {
  const faqs = [
    {
      question: "Is an account finder accurate?",
      answer:
        "No account finder is 100% accurate. FootprintIQ uses confidence scoring and false-positive filtering to improve reliability, but results reflect publicly indexed data. Common or generic usernames may return coincidental matches. Always verify results directly on the platform.",
    },
    {
      question: "Can it find private accounts?",
      answer:
        "No. FootprintIQ only searches publicly accessible information. Private, locked, or deactivated accounts are never included. The platform does not attempt to bypass authentication or access data behind privacy settings.",
    },
    {
      question: "Why do I see multiple possible matches?",
      answer:
        "Common usernames naturally appear across many platforms. A 'possible match' means the username was found but the confidence score is below our verification threshold. We recommend verifying these matches manually using our checklist.",
    },
    {
      question: "Is it legal to search usernames?",
      answer:
        "Yes. Searching for publicly available information is legal in most jurisdictions. FootprintIQ only accesses data already visible to anyone on the public internet. However, how you use the results is your responsibility — always respect applicable privacy laws and platform terms of service.",
    },
    {
      question: "How can I reduce online exposure?",
      answer:
        "Use unique usernames for sensitive services, enable multi-factor authentication, delete unused accounts, request removal from data brokers, and limit the personal information visible on your public profiles.",
    },
    {
      question: "Can I remove accounts from search engines?",
      answer:
        "You can request removal of specific URLs from Google using their content removal tool. For broader cleanup, adjust privacy settings on individual platforms and submit opt-out requests to data brokers. Our privacy guides provide step-by-step instructions.",
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
      { "@type": "ListItem", position: 2, name: "Account Finder", item: "https://footprintiq.app/account-finder" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Account Finder: Discover Public Online Accounts by Username",
    description: "Use our account finder to discover public online accounts linked to a username. Ethical OSINT-based scanning with verification guidance.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/account-finder" },
  };

  const revealItems = [
    { icon: Users, label: "Public social media accounts" },
    { icon: MessageSquare, label: "Forum and community profiles" },
    { icon: Code, label: "Developer and portfolio sites" },
    { icon: ShoppingBag, label: "Public marketplace listings" },
    { icon: FileText, label: "Mentions tied to the same username" },
    { icon: RefreshCw, label: "Reuse patterns across platforms" },
  ];

  const comparisonRows = [
    { feature: "Public data only", footprintiq: true, brokers: false },
    { feature: "Transparent methodology", footprintiq: true, brokers: false },
    { feature: "Confidence scoring", footprintiq: true, brokers: false },
    { feature: "Bulk background reports", footprintiq: false, brokers: true },
  ];

  return (
    <>
      <Helmet>
        <title>Account Finder – Search Public Online Accounts by Username | FootprintIQ</title>
        <meta name="description" content="Use our account finder to discover public online accounts linked to a username. Ethical OSINT-based scanning with verification guidance." />
        <link rel="canonical" href="https://footprintiq.app/account-finder" />

        <meta property="og:title" content="Account Finder – Search Public Online Accounts by Username | FootprintIQ" />
        <meta property="og:description" content="Use our account finder to discover public online accounts linked to a username. Ethical OSINT-based scanning with verification guidance." />
        <meta property="og:url" content="https://footprintiq.app/account-finder" />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Account Finder – Search Public Online Accounts by Username | FootprintIQ" />
        <meta name="twitter:description" content="Use our account finder to discover public online accounts linked to a username. Ethical OSINT-based scanning with verification guidance." />

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
                <span className="text-foreground">Account Finder</span>
              </nav>
            </div>
          </div>

          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Account Finder Tool</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Account Finder: Discover Public Online Accounts by Username
                </h1>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                  Enter a username to discover where public accounts exist across social platforms, forums, developer sites, and online communities. Ethical OSINT scanning with confidence scoring.
                </p>

                <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
                  An account finder searches publicly visible data only. It is not a background check and does not access private profiles. The same username on different platforms does not confirm they belong to the same person.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Start Free Scan
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/username-lookup">Username Lookup</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* What an Account Finder Can Reveal */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What an Account Finder Can Reveal
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {revealItems.map((item) => (
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

          {/* How FootprintIQ Finds Accounts */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How FootprintIQ Finds Accounts
                  </h2>
                </div>

                <div className="space-y-6 mt-8">
                  {[
                    { step: 1, title: "Normalise username variations", desc: "We account for case differences, separators (underscores, dots, hyphens), and common substitutions." },
                    { step: 2, title: "Scan public platform endpoints", desc: "Our engine queries publicly accessible profile URLs and platform endpoints across hundreds of services." },
                    { step: 3, title: "Detect pattern matches", desc: "Matching algorithms identify where the username appears, including partial and variant matches." },
                    { step: 4, title: "Apply confidence scoring", desc: "Each match is scored based on exact match quality, profile metadata, and cross-platform linking signals." },
                    { step: 5, title: "Reduce false positives", desc: "Common names, generic usernames, and placeholder profiles are flagged and deprioritised." },
                    { step: 6, title: "Provide verification checklist", desc: "Every result includes a confidence level and tips to confirm whether a match is genuine." },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-6 rounded-xl bg-card border border-border">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">{item.step}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Online Account Discovery Matters */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why Online Account Discovery Matters
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    "Credential stuffing risk — reused usernames make it easier to target accounts across services.",
                    "Impersonation exposure — discovering who else may be using a similar handle helps identify brand or identity risks.",
                    "Brand misuse — organisations can monitor for unauthorised use of their brand name as a username.",
                    "Identity stitching — multiple public profiles using the same handle can be correlated to build a more complete picture of someone's online presence.",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                      <XCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Link to="/digital-footprint-check" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Check your digital footprint <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link to="/ai-answers/why-username-reuse-is-risky" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Why username reuse is risky <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Account Finder vs People Search Sites */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                  Account Finder vs People Search Sites
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 px-4 text-foreground font-semibold">Feature</th>
                        <th className="py-3 px-4 text-foreground font-semibold">FootprintIQ</th>
                        <th className="py-3 px-4 text-foreground font-semibold">Data Brokers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.feature} className="border-b border-border/50">
                          <td className="py-3 px-4 text-foreground font-medium">{row.feature}</td>
                          <td className="py-3 px-4">
                            {row.footprintiq ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {row.brokers ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground" />
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
                  Run a Free Account Finder Scan
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Discover where your username appears across public platforms, forums, and communities.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Start Free Scan
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/username-lookup">Username Lookup</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/reverse-username-search">Reverse Username Search</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools & Guides */}
          <RelatedToolsGrid currentPath="/account-finder" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AccountFinder;
