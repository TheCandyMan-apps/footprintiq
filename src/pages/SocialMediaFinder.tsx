import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Search,
  Shield,
  ChevronRight,
  Users,
  Globe,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const SocialMediaFinder = () => {
  const faqs = [
    {
      question: "How accurate is a social media finder?",
      answer:
        "Accuracy depends on the tools and methodology used. FootprintIQ cross-references multiple OSINT engines and applies confidence scoring and false-positive filtering to improve reliability. Results reflect publicly indexed data — not private or deleted content. No tool is 100% accurate, which is why we present confidence levels alongside every finding.",
    },
    {
      question: "Can it find private accounts?",
      answer:
        "No. A social media finder only searches publicly accessible information. Private, locked, or deactivated accounts are not included in results. FootprintIQ is built on ethical OSINT principles — it never attempts to access data behind authentication walls or privacy settings.",
    },
    {
      question: "Is this anonymous?",
      answer:
        "Yes. When you run a scan on FootprintIQ, the person whose username you search is not notified. The process queries publicly available data and does not interact with user accounts directly. Your search activity is also private and not shared with third parties.",
    },
    {
      question: "Can I remove my data?",
      answer:
        "FootprintIQ does not store or host your public profiles — it discovers where they already exist. To remove data, you would need to contact each platform directly or adjust your privacy settings. We provide guidance on data removal through our privacy resources and removal guides.",
    },
    {
      question: "How is this different from Google search?",
      answer:
        "Google indexes a broad range of web content but isn't optimised for username correlation. A social media finder like FootprintIQ specifically checks hundreds of platforms for matching usernames, applies de-duplication and confidence scoring, and presents results in a structured format designed for exposure analysis — far more targeted than a general web search.",
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
        name: "Social Media Finder",
        item: "https://footprintiq.app/social-media-finder",
      },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Social Media Finder: Search Public Profiles by Username",
    description:
      "Find public social media accounts linked to a username. Ethical OSINT-based profile search with privacy-focused results.",
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
      "@id": "https://footprintiq.app/social-media-finder",
    },
  };

  const comparisonRows = [
    { feature: "Public-only data", footprint: true, brokers: false },
    { feature: "Transparent sources", footprint: true, brokers: false },
    { feature: "Privacy-focused", footprint: true, brokers: false },
    { feature: "Bulk background reports", footprint: false, brokers: true },
    { feature: "User-controlled scanning", footprint: true, brokers: false },
  ];

  return (
    <>
      <Helmet>
        <title>Social Media Finder – Search Public Profiles by Username</title>
        <meta
          name="description"
          content="Find public social media accounts linked to a username. Ethical OSINT-based profile search with privacy-focused results."
        />
        <link
          rel="canonical"
          href="https://footprintiq.app/social-media-finder"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Social Media Finder – Search Public Profiles by Username"
        />
        <meta
          property="og:description"
          content="Find public social media accounts linked to a username. Ethical OSINT-based profile search with privacy-focused results."
        />
        <meta
          property="og:url"
          content="https://footprintiq.app/social-media-finder"
        />
        <meta property="og:type" content="article" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Social Media Finder – Search Public Profiles by Username"
        />
        <meta
          name="twitter:description"
          content="Find public social media accounts linked to a username. Ethical OSINT-based profile search with privacy-focused results."
        />

        {/* Schemas */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-grow">
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b border-border/50">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                  to="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Social Media Finder</span>
              </nav>
            </div>
          </div>

          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Public Profile Discovery
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  Social Media Finder: Search Public Profiles by Username
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Discover where a username appears across public social media
                  platforms, forums, and developer sites. Ethical, OSINT-based
                  profile search with privacy-first results.
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Check Your Username Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/digital-footprint-check">
                      Learn About Digital Footprint Risks
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* What Is a Social Media Finder? */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What Is a Social Media Finder?
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    A social media finder searches publicly available profiles
                    linked to a specific username across hundreds of platforms.
                    It uses{" "}
                    <Link
                      to="/what-is-osint"
                      className="text-primary hover:underline"
                    >
                      OSINT (Open Source Intelligence)
                    </Link>{" "}
                    methodology — querying only data that is freely accessible to
                    anyone on the open web.
                  </p>
                  <p>
                    Unlike data brokers that aggregate personal records, compile
                    background reports, and sell your information, a social media
                    finder simply reveals where a username appears publicly. It
                    does not access private accounts, bypass login screens, or
                    scrape protected content.
                  </p>
                  <p>
                    The purpose is awareness: understanding your public
                    visibility so you can make informed decisions about your
                    digital presence.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How Our Social Media Finder Works */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Layers className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How Our Social Media Finder Works
                  </h2>
                </div>

                <div className="grid gap-6 mt-8">
                  {[
                    {
                      step: 1,
                      title: "Username Cross-Platform Detection",
                      desc: "Your username is checked against hundreds of social media platforms, forums, and developer sites simultaneously using multiple OSINT engines.",
                    },
                    {
                      step: 2,
                      title: "Public Profile Indexing",
                      desc: "Discovered profiles are indexed with relevant metadata — platform name, URL, and profile type — without accessing any private content.",
                    },
                    {
                      step: 3,
                      title: "Correlation Scoring",
                      desc: "Results are scored based on confidence levels. A username match on a platform doesn't guarantee it belongs to the same person — correlation scoring helps distinguish likely matches.",
                    },
                    {
                      step: 4,
                      title: "False-Positive Filtering",
                      desc: "AI-assisted filtering removes common false positives — generic usernames, placeholder profiles, and inactive accounts — so you see meaningful results.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex gap-4 p-6 bg-background rounded-xl border border-border/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-muted-foreground mt-6">
                  FootprintIQ processes only publicly accessible data. No login
                  credentials are used, no private APIs are accessed, and no
                  personal data is stored beyond what you choose to save.
                </p>
              </div>
            </div>
          </section>

          {/* What You Can Discover */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What You Can Discover
                  </h2>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  {[
                    "Public social profiles across major and niche platforms",
                    "Archived or cached account pages",
                    "Forum usernames and community memberships",
                    "Developer platforms (GitHub, GitLab, Stack Overflow)",
                    "Username reuse patterns across services",
                    "Exposure signals and visibility indicators",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl border border-border/50"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
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
                  <div className="p-3 rounded-xl bg-primary/10">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why Username Reuse Is Risky
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    When you use the same username across multiple platforms, you
                    create a visible thread that ties your online identities
                    together. This creates several categories of risk:
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {[
                    {
                      title: "Credential Reuse Risk",
                      desc: "If one platform is breached, attackers can correlate your username to other services and attempt credential stuffing.",
                    },
                    {
                      title: "Social Engineering Exposure",
                      desc: "A linked set of profiles reveals interests, habits, and connections — valuable information for phishing and impersonation.",
                    },
                    {
                      title: "Identity Mapping",
                      desc: "Public usernames make it trivial to build a comprehensive picture of someone's online presence and real-world identity.",
                    },
                    {
                      title: "Data Broker Amplification",
                      desc: "Data brokers harvest linked profiles to build and sell detailed personal dossiers, amplifying your exposure further.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-5 bg-background rounded-xl border border-border/50"
                    >
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <Link
                    to="/username-checker"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Username Checker
                  </Link>
                  <Link
                    to="/digital-footprint-check"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Digital Footprint Check
                  </Link>
                  <Link
                    to="/ai-answers/what-is-a-username-osint-scan"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                    What Is a Username OSINT Scan?
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Social Media Finder vs People Search Sites
                  </h2>
                </div>

                <div className="overflow-x-auto mt-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-4 px-4 text-foreground font-semibold">
                          Feature
                        </th>
                        <th className="text-center py-4 px-4 text-foreground font-semibold">
                          FootprintIQ
                        </th>
                        <th className="text-center py-4 px-4 text-foreground font-semibold">
                          Data Brokers
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-4 text-foreground">
                            {row.feature}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {row.footprint ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {row.brokers ? (
                              <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
                  Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`faq-${index}`}
                      className="bg-background rounded-xl border border-border/50 px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
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

          {/* CTA Section */}
          <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center p-10 md:p-14 rounded-2xl bg-gradient-to-br from-primary/10 via-muted/50 to-primary/5 border border-primary/20">
                <Fingerprint className="h-12 w-12 text-primary mx-auto mb-6" />
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Run a Free Social Media Scan
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                  Check your username across publicly available platforms in
                  seconds.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">
                      Check Your Username Now
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/digital-footprint-check">
                      Learn About Digital Footprint Risks
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Related Resources */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Related Resources
                </h2>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      to: "/username-checker",
                      title: "Username Checker",
                      desc: "Check if a username exists across hundreds of platforms",
                    },
                    {
                      to: "/reverse-username-search",
                      title: "Reverse Username Search",
                      desc: "Trace a username back to linked accounts and profiles",
                    },
                    {
                      to: "/privacy/google-content-removal",
                      title: "Google Content Removal",
                      desc: "Learn how to request removal of personal data from Google",
                    },
                    {
                      to: "/ai-answers-hub",
                      title: "AI Answers Hub",
                      desc: "Explore OSINT explainers and digital exposure guides",
                    },
                    {
                      to: "/digital-footprint-check",
                      title: "Digital Footprint Check",
                      desc: "Comprehensive scanning across hundreds of sources",
                    },
                    {
                      to: "/username-exposure",
                      title: "Username Exposure",
                      desc: "How reused usernames connect your accounts",
                    },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="p-5 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
                    >
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {link.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {link.desc}
                      </p>
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

export default SocialMediaFinder;
