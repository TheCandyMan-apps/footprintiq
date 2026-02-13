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
  AlertTriangle,
  Fingerprint,
  Globe,
  Eye,
  Users,
  Code,
  FileText,
  MessageSquare,
  Archive,
  RefreshCw,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";

const UsernameLookup = () => {
  const faqs = [
    {
      question: "Is username lookup accurate?",
      answer:
        "No username lookup is 100% accurate. FootprintIQ uses confidence scoring and false-positive filtering to improve reliability, but results reflect publicly indexed data. Common or generic usernames may return coincidental matches. Always verify results directly on the platform.",
    },
    {
      question: "Can it find private accounts?",
      answer:
        "No. FootprintIQ only searches publicly accessible information. Private, locked, or deactivated accounts are never included. The platform does not attempt to bypass authentication or access data behind privacy settings.",
    },
    {
      question: 'Why do I see "possible match"?',
      answer:
        "A 'possible match' means the username was found on a platform but the confidence score is below our verification threshold. This happens frequently with common usernames or platforms with limited public profile data. We recommend verifying these matches manually.",
    },
    {
      question: "Is it legal to run a username lookup?",
      answer:
        "Yes. Searching for publicly available information is legal in most jurisdictions. FootprintIQ only accesses data already visible to anyone on the public internet. However, how you use the results is your responsibility — always respect applicable privacy laws and platform terms of service.",
    },
    {
      question: "How can I reduce false positives?",
      answer:
        "Use unique or distinctive usernames when searching — generic handles like 'user123' will naturally appear on many platforms. FootprintIQ's confidence scoring helps prioritise likely matches, and our verification checklist provides steps to confirm whether a result is genuine.",
    },
    {
      question: "How do I remove my info from the internet?",
      answer:
        "FootprintIQ does not host or store your public profiles — it discovers where they already exist. To reduce your exposure, adjust privacy settings on individual platforms, delete unused accounts, and request removal from data brokers and search engines. Our privacy guides provide detailed instructions.",
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
      { "@type": "ListItem", position: 2, name: "Username Lookup", item: "https://footprintiq.app/username-lookup" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Username Lookup: Search Where a Username Appears Online",
    description: "Run a username lookup to find public profiles and mentions across social platforms, forums, and communities. Ethical OSINT scanning with verification guidance.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/username-lookup" },
  };

  const discoveryItems = [
    { icon: Users, label: "Public social profiles" },
    { icon: MessageSquare, label: "Forum accounts" },
    { icon: Code, label: "Developer profiles" },
    { icon: FileText, label: "Public comments / mentions" },
    { icon: Archive, label: "Archived references (where public)" },
    { icon: RefreshCw, label: "Username reuse patterns" },
  ];

  const comparisonRows = [
    { tool: "Username Lookup", best: "Discover where it appears", output: "Profiles + mentions" },
    { tool: "Username Checker", best: "Cross-platform presence", output: "Platform matches" },
    { tool: "Reverse Username Search", best: "Deeper public discovery", output: "Expanded public sources" },
  ];

  return (
    <>
      <Helmet>
        <title>Username Lookup – Search Where a Username Appears Online | FootprintIQ</title>
        <meta name="description" content="Run a username lookup to find public profiles and mentions across social platforms, forums, and communities. Ethical OSINT scanning with verification guidance." />
        <link rel="canonical" href="https://footprintiq.app/username-lookup" />

        <meta property="og:title" content="Username Lookup – Search Where a Username Appears Online | FootprintIQ" />
        <meta property="og:description" content="Run a username lookup to find public profiles and mentions across social platforms, forums, and communities. Ethical OSINT scanning with verification guidance." />
        <meta property="og:url" content="https://footprintiq.app/username-lookup" />
        <meta property="og:type" content="article" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Username Lookup – Search Where a Username Appears Online | FootprintIQ" />
        <meta name="twitter:description" content="Run a username lookup to find public profiles and mentions across social platforms, forums, and communities. Ethical OSINT scanning with verification guidance." />

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
                <span className="text-foreground">Username Lookup</span>
              </nav>
            </div>
          </div>

          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Username Lookup Tool</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Username Lookup: Search Where a Username Appears Online
                </h1>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                  Enter a username to discover where it appears across public social platforms, forums, developer sites, and communities. Ethical OSINT scanning with confidence scoring.
                </p>

                <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
                  The same username on different platforms does not confirm they belong to the same person. Always verify matches directly on the platform.
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

          {/* What Is a Username Lookup? */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What Is a Username Lookup?
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  <p>
                    A username lookup discovers public accounts and mentions tied to a specific username across the internet. It's useful for personal exposure checks, brand monitoring, and security hygiene.
                  </p>
                  <p>
                    This is not a background check and does not access private data. FootprintIQ uses{" "}
                    <Link to="/what-is-osint" className="text-primary hover:underline">OSINT methodology</Link>{" "}
                    to query only publicly accessible information — no login credentials, no bypassing privacy settings, no scraping behind authentication.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What a Username Lookup Can Find */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What a Username Lookup Can Find
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discoveryItems.map((item) => (
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

          {/* How FootprintIQ Performs Username Lookup */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How FootprintIQ Performs Username Lookup
                  </h2>
                </div>

                <div className="space-y-6 mt-8">
                  {[
                    { step: 1, title: "Normalise variations", desc: "We account for case differences, separators (underscores, dots, hyphens), and common substitutions." },
                    { step: 2, title: "Public-source checks", desc: "Our engine queries publicly accessible profile URLs and platform endpoints across hundreds of services." },
                    { step: 3, title: "Confidence scoring signals", desc: "Each match is scored based on exact match quality, profile metadata, and cross-platform linking signals." },
                    { step: 4, title: "False-positive reduction", desc: "Common names, generic usernames, and placeholder profiles are flagged and deprioritised." },
                    { step: 5, title: "Verification checklist", desc: "Every result includes a confidence level and tips to confirm whether a match is genuine." },
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

                <p className="text-muted-foreground mt-8 text-sm">
                  All scanning is performed using publicly available data. FootprintIQ does not access private accounts, bypass authentication, or store personal data from scanned profiles.
                </p>
              </div>
            </div>
          </section>

          {/* Common Reasons Results Differ */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Common Reasons Results Differ
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    "Private accounts — locked or restricted profiles are not included in results.",
                    "Region restrictions — some platforms limit visibility by geography.",
                    "Platform anti-bot limits — aggressive rate limiting may reduce coverage on certain sites.",
                    "Username collisions — common usernames will appear on many platforms coincidentally.",
                    "Deleted or renamed accounts — previously active profiles may no longer be accessible.",
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

          {/* Protect Yourself From Username Exposure */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Protect Yourself From Username Exposure
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    "Use different usernames for high-risk services (banking, email, healthcare).",
                    "Enable multi-factor authentication on all important accounts.",
                    "Audit old accounts — delete or deactivate profiles you no longer use.",
                    "Remove data broker listings — request opt-out from people-search sites.",
                    "Reduce public profile data — limit what's visible to anonymous visitors.",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">{tip}</p>
                    </div>
                  ))}
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

          {/* Comparison Table */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                  Username Lookup vs Username Checker vs Reverse Username Search
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 px-4 text-foreground font-semibold">Tool</th>
                        <th className="py-3 px-4 text-foreground font-semibold">Best For</th>
                        <th className="py-3 px-4 text-foreground font-semibold">Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.tool} className="border-b border-border/50">
                          <td className="py-3 px-4 text-foreground font-medium">{row.tool}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.best}</td>
                          <td className="py-3 px-4 text-muted-foreground">{row.output}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                  <Link to="/username-checker" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Try Username Checker <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link to="/reverse-username-search" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Try Reverse Username Search <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link to="/social-media-finder" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Social Media Finder <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQs */}
          <section className="py-16 md:py-20">
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
                  Run a Free Username Lookup
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
                    <Link to="/username-checker">Username Checker</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/reverse-username-search">Reverse Username Search</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Related Tools & Guides */}
          <RelatedToolsGrid currentPath="/username-lookup" />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default UsernameLookup;
