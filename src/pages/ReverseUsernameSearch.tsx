import { Helmet } from "react-helmet-async";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { SimpleScanForm } from "@/components/maigret/SimpleScanForm";
import { JsonLd } from "@/components/seo/JsonLd";
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
  Zap,
  Lock,
  BarChart3,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "What is a reverse username lookup?",
    answer:
      "A reverse username lookup takes a known username and searches across hundreds of public platforms — social media, forums, developer sites, and communities — to find where that handle has been registered or mentioned. Unlike a people search, it only surfaces publicly accessible data and does not attempt to identify real-world individuals.",
  },
  {
    question: "Is reverse username search legal?",
    answer:
      "Yes. Searching for publicly available information is legal in most jurisdictions. FootprintIQ only queries data already visible on the public internet. It does not bypass authentication, access private accounts, or scrape behind login walls. How you use the results is your responsibility — always respect applicable privacy laws and platform terms of service.",
  },
  {
    question: "How accurate is a reverse username search?",
    answer:
      "No reverse username search is 100% accurate. Common usernames like 'alex' or 'admin' will appear on hundreds of platforms without belonging to the same person. FootprintIQ applies confidence scoring and false-positive filtering to improve reliability, but results should always be cross-validated using bio links, profile photos, and posting patterns.",
  },
  {
    question: "Can a reverse username lookup find private or deleted accounts?",
    answer:
      "No. FootprintIQ only searches publicly accessible information. Private, locked, deactivated, or deleted accounts are never included. The platform does not attempt to bypass authentication or access data behind privacy settings.",
  },
  {
    question: "What is the difference between reverse username search and a people search engine?",
    answer:
      "A reverse username search starts with a handle and finds public profiles. A people search engine typically starts with a real name, phone number, or address and compiles personal dossiers from data broker records. FootprintIQ is the former — it is an OSINT tool, not a background check or surveillance service.",
  },
  {
    question: "How can I protect my username from being found?",
    answer:
      "Use unique handles for sensitive accounts, avoid reusing the same username across platforms, enable two-factor authentication, and periodically audit your digital footprint. Our guide on reducing your digital footprint provides detailed, step-by-step instructions.",
  },
];

const comparisonTools = [
  {
    name: "FootprintIQ",
    platforms: "500+",
    confidence: true,
    falsePositiveFilter: true,
    apiAccess: true,
    free: "Yes (limited)",
    bestFor: "OSINT professionals & security audits",
  },
  {
    name: "Namechk",
    platforms: "100+",
    confidence: false,
    falsePositiveFilter: false,
    apiAccess: false,
    free: "Yes",
    bestFor: "Quick availability checks",
  },
  {
    name: "Sherlock (CLI)",
    platforms: "400+",
    confidence: false,
    falsePositiveFilter: false,
    apiAccess: false,
    free: "Yes (open source)",
    bestFor: "Technical users comfortable with CLI",
  },
  {
    name: "WhatsMyName",
    platforms: "600+",
    confidence: false,
    falsePositiveFilter: false,
    apiAccess: false,
    free: "Yes (open source)",
    bestFor: "OSINT researchers needing raw coverage",
  },
  {
    name: "Social Searcher",
    platforms: "12",
    confidence: false,
    falsePositiveFilter: false,
    apiAccess: true,
    free: "Freemium",
    bestFor: "Social media monitoring",
  },
];

const ReverseUsernameSearch = () => {
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
      { "@type": "ListItem", position: 2, name: "Reverse Username Lookup", item: "https://footprintiq.app/reverse-username-search" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Reverse Username Lookup: How to Find Accounts by Username (2026 Guide)",
    description: "Learn how reverse username lookup works and use our free tool to find accounts by username across 500+ platforms. Ethical OSINT methodology with confidence scoring.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" },
    },
    datePublished: "2026-02-13",
    dateModified: "2026-03-02",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/reverse-username-search" },
  };


  return (
    <>
      <Helmet>
        <title>Reverse Username Search – Find Linked Accounts Fast | FootprintIQ</title>
        <meta
          name="description"
          content="Free reverse username search across 500+ platforms. Discover linked accounts, map exposure, and reduce your digital footprint with ethical OSINT — no login required."
        />
        <link rel="canonical" href="https://footprintiq.app/reverse-username-search" />
        <meta property="og:title" content="Reverse Username Search – Find Linked Accounts Fast | FootprintIQ" />
        <meta property="og:description" content="Free reverse username search across 500+ platforms. Discover linked accounts, map exposure, and reduce your digital footprint." />
        <meta property="og:url" content="https://footprintiq.app/reverse-username-search" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Reverse Username Search – Find Linked Accounts Fast | FootprintIQ" />
        <meta name="twitter:description" content="Free reverse username search across 500+ platforms. Discover linked accounts, map exposure, and reduce your digital footprint." />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow">
          <IntentAlignmentBanner />

          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b border-border/50">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Reverse Username Lookup</span>
              </nav>
            </div>
          </div>

          {/* Hero */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Reverse Username Lookup Tool</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Reverse Username Lookup: How to Find Accounts by Username
                </h1>

                <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
                  Enter a username to discover where it appears across 500+ public social platforms, forums,
                  developer sites, and communities. Powered by ethical OSINT methodology with confidence scoring.
                </p>

                <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
                  Matches may be coincidental — the same username on different platforms does not confirm
                  they belong to the same person. Always verify results directly.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <a href="#lookup-tool">
                      Try Reverse Lookup Free
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/usernames">Username Search Tool</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 1: What Is a Reverse Username Lookup? */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What Is a Reverse Username Lookup?
                  </h2>
                </div>

                <div className="space-y-4 text-muted-foreground text-lg">
                  <p>
                    A <strong className="text-foreground">reverse username lookup</strong> takes a known handle and searches for public pages where it appears — social media profiles, forum accounts, developer repositories, marketplaces, and more. It is the most direct way to understand the public visibility of a specific username across the internet.
                  </p>
                  <p>
                    This is fundamentally different from "people search" or "background check" services. A reverse username search does not attempt to identify real-world individuals, access private data, or compile personal dossiers. It only surfaces what is already publicly indexed and accessible to anyone.
                  </p>
                  <p>
                    Common use cases for a <strong className="text-foreground">username OSINT lookup</strong> include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong className="text-foreground">Self-audit:</strong> Check where your own username appears before it's misused.</li>
                    <li><strong className="text-foreground">Threat assessment:</strong> Security teams investigate potential impersonation or credential-stuffing exposure.</li>
                    <li><strong className="text-foreground">Due diligence:</strong> Verify a contact's public presence across platforms.</li>
                    <li><strong className="text-foreground">Brand protection:</strong> Detect unauthorized use of brand handles.</li>
                  </ul>
                  <p>
                    FootprintIQ uses{" "}
                    <Link to="/what-is-osint" className="text-primary hover:underline">OSINT methodology</Link>{" "}
                    to perform these searches ethically — querying public endpoints without logging into platforms, bypassing privacy settings, or scraping behind authentication. Learn more about{" "}
                    <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline">how username search tools work</Link>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: How Reverse Username Search Works */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How Reverse Username Search Works
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  When you enter a username into a <strong className="text-foreground">reverse social media search</strong> tool, the system executes a multi-stage pipeline to find accounts by username:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { step: "1", title: "Username Normalisation", desc: "The input is cleaned, case-normalised, and prepared for multi-platform querying. Special characters are handled per platform requirements.", icon: Code },
                    { step: "2", title: "Platform Enumeration", desc: "The tool checks the username against 500+ public platform endpoints — social networks, forums, developer hubs, marketplaces, and blogs.", icon: Globe },
                    { step: "3", title: "Response Analysis", desc: "Each platform response is analysed for profile existence signals: HTTP status codes, page content patterns, and profile metadata indicators.", icon: BarChart3 },
                    { step: "4", title: "Confidence Scoring", desc: "Results are scored based on match quality, metadata availability, and cross-platform linking signals. False positives are flagged with lower confidence.", icon: Shield },
                  ].map((item) => (
                    <Card key={item.step} className="border-border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {item.step}
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="p-6 rounded-xl bg-card border border-border">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-foreground font-medium mb-2">Important: Username ≠ Identity</p>
                      <p className="text-muted-foreground text-sm">
                        Common usernames like "alex" or "admin" will appear on hundreds of platforms. A matching username does not confirm the accounts belong to the same person. Always cross-validate using bio links, profile photos, and posting history before drawing conclusions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Try Our Reverse Username Lookup Tool */}
          <section id="lookup-tool" className="py-16 md:py-20 scroll-mt-20">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Fingerprint className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Try Our Reverse Username Lookup Tool
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  Enter any username below to run a free <strong className="text-foreground">reverse username search</strong> across public platforms. Results include confidence scores and platform categories.
                </p>

                <Card className="border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Start Reverse Username Lookup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SimpleScanForm />
                  </CardContent>
                </Card>

                <div className="mt-6 flex flex-wrap gap-4 justify-center">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/usernames">
                      Full Username Search Tool <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/find-social-media-accounts">
                      Find Social Media Accounts <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Best Reverse Username Lookup Tools (2026) */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Best Reverse Username Lookup Tools (2026)
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  Comparing the leading tools for <strong className="text-foreground">reverse username search</strong> and username OSINT lookup in 2026. Each tool has different strengths depending on your use case.
                </p>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold text-foreground">Tool</th>
                        <th className="text-center p-4 font-semibold text-foreground">Platforms</th>
                        <th className="text-center p-4 font-semibold text-foreground">Confidence Scoring</th>
                        <th className="text-center p-4 font-semibold text-foreground">False-Positive Filter</th>
                        <th className="text-center p-4 font-semibold text-foreground">API Access</th>
                        <th className="text-center p-4 font-semibold text-foreground">Free Tier</th>
                        <th className="text-left p-4 font-semibold text-foreground">Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonTools.map((tool) => (
                        <tr key={tool.name} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{tool.name}</td>
                          <td className="p-4 text-center text-muted-foreground">{tool.platforms}</td>
                          <td className="p-4 text-center">
                            {tool.confidence ? <CheckCircle2 className="h-5 w-5 text-primary mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />}
                          </td>
                          <td className="p-4 text-center">
                            {tool.falsePositiveFilter ? <CheckCircle2 className="h-5 w-5 text-primary mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />}
                          </td>
                          <td className="p-4 text-center">
                            {tool.apiAccess ? <CheckCircle2 className="h-5 w-5 text-primary mx-auto" /> : <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />}
                          </td>
                          <td className="p-4 text-center text-muted-foreground">{tool.free}</td>
                          <td className="p-4 text-muted-foreground">{tool.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 p-6 rounded-xl bg-card border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why FootprintIQ Stands Out</h3>
                  <p className="text-muted-foreground mb-4">
                    While open-source tools like Sherlock and WhatsMyName provide broad coverage, they produce raw results without confidence scoring or false-positive filtering. FootprintIQ combines multi-tool OSINT coverage with intelligent post-processing — giving you actionable intelligence rather than a noisy list of possible matches.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="sm">
                      <a href="#lookup-tool">
                        Try It Free <ArrowRight className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/instagram-username-search">Instagram Username Search</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Guide CTA */}
          <section className="py-10 md:py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="p-6 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground font-medium">
                        Looking for a comparison of the best reverse username tools?{" "}
                        <Link to="/best-reverse-username-search-tools" className="text-primary hover:underline font-semibold">
                          See our 2026 comparison guide →
                        </Link>
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Security & Privacy Context */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why Reverse Username Lookup Matters
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  Understanding where your username appears publicly is essential for personal security. Here's why a <strong className="text-foreground">reverse social media search</strong> should be part of your security routine:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { title: "Credential Stuffing", desc: "Reused usernames paired with leaked passwords make automated account takeover trivial across platforms.", icon: Lock },
                    { title: "Impersonation", desc: "Publicly visible usernames can be cloned on platforms where the original user doesn't have an account.", icon: Users },
                    { title: "Identity Stitching", desc: "Data brokers aggregate public profiles to build comprehensive identity maps from individual accounts.", icon: Eye },
                    { title: "Doxxing Exposure", desc: "Linking accounts across platforms can reveal personal details intended to stay separate.", icon: AlertTriangle },
                  ].map((item) => (
                    <div key={item.title} className="p-5 rounded-xl bg-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-5 w-5 text-destructive" />
                        <h3 className="text-foreground font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link to="/digital-footprint-check" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Run a digital footprint scan <ArrowRight className="h-3 w-3" />
                  </Link>
                  <Link to="/find-social-media-accounts" className="text-primary hover:underline flex items-center gap-1 text-sm">
                    Find social media accounts <ArrowRight className="h-3 w-3" />
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

          {/* Related Searches */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-4">Related Searches</h3>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="ghost" size="sm"><Link to="/usernames">Username Search Tool</Link></Button>
                  <Button asChild variant="ghost" size="sm"><Link to="/instagram-username-search">Instagram Username Search</Link></Button>
                  <Button asChild variant="ghost" size="sm"><Link to="/find-social-media-accounts">Find Social Media Accounts</Link></Button>
                  <Button asChild variant="ghost" size="sm"><Link to="/guides/how-username-search-tools-work">How Username Search Works</Link></Button>
                </div>
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
                    Run a Free Reverse Username Lookup
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Check where a username appears across 500+ publicly available platforms.
                    See the results — and decide what action to take.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg">
                      <a href="#lookup-tool">
                        Start Free Lookup
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/scan">Full Scan Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer sections */}
          <section className="py-12 px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              <RelatedToolsGrid currentPath="/reverse-username-search" />
              <AboutFootprintIQBlock />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ReverseUsernameSearch;
