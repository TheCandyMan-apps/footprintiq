import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Search,
  ChevronRight,
  ArrowRight,
  Shield,
  Eye,
  Lock,
  Globe,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RefreshCw,
  UserX,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { JsonLd } from "@/components/seo/JsonLd";

const RemovePersonalInformation = () => {
  const faqs = [
    {
      question: "Can I remove myself from Google?",
      answer:
        "You can request Google to de-index specific pages containing your personal information. Google offers a removal request tool for outdated content and a separate process for content that poses risks such as doxxing. However, de-indexing only removes the result from Google — the source page may still exist until you contact the website directly.",
    },
    {
      question: "How long does removal take?",
      answer:
        "Timelines vary. Google removal requests are typically processed within days to weeks. Data broker opt-outs can take 30–90 days depending on the broker and jurisdiction. Some brokers may re-list your data, so ongoing monitoring is recommended.",
    },
    {
      question: "Is data broker removal permanent?",
      answer:
        "Not always. Data brokers may re-acquire your information from public records, marketing databases, or other brokers. Removal is an important step, but it should be combined with ongoing monitoring and periodic re-checks to ensure your data hasn't been re-listed.",
    },
    {
      question: "Do I need to pay to remove my information?",
      answer:
        "Most data broker opt-out processes are free and required by law under regulations like GDPR and CCPA. Some paid services automate the process, but you can complete most removals yourself. FootprintIQ provides free tools to help you identify where your data appears.",
    },
    {
      question: "Can someone still find me after removal?",
      answer:
        "Removal reduces your visibility but may not eliminate it entirely. Cached pages, archived content, and re-listing by brokers can re-expose your data. Regular monitoring helps you stay aware of new appearances.",
    },
    {
      question: "How do I monitor my online exposure?",
      answer:
        "Use a digital footprint scanner to periodically check where your username, email, or personal details appear publicly. FootprintIQ provides scanning tools that help you track your exposure over time and identify new listings.",
    },
    {
      question: "Does FootprintIQ remove my data?",
      answer:
        "FootprintIQ does not directly remove data from third-party platforms. Instead, it maps your exposure and provides a structured remediation roadmap — including official opt-out links and removal guidance — so you can act efficiently and strategically.",
    },
  ];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Remove Personal Information from the Internet",
    description:
      "Learn how to remove personal information from Google, social media, and data brokers. Step-by-step privacy protection guide.",
    author: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: "https://footprintiq.app",
    },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: "https://footprintiq.app",
    },
    datePublished: "2026-02-13",
    dateModified: "2026-02-13",
    mainEntityOfPage: "https://footprintiq.app/remove-personal-information-from-internet",
  };

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
        name: "Privacy Resources",
        item: "https://footprintiq.app/guides",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Remove Personal Information",
        item: "https://footprintiq.app/remove-personal-information-from-internet",
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>How to Remove Personal Information from the Internet (2026 Guide)</title>
        <meta
          name="description"
          content="Learn how to remove personal information from Google, social media, and data brokers. Step-by-step privacy protection guide."
        />
        <link rel="canonical" href="https://footprintiq.app/remove-personal-information-from-internet" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://footprintiq.app/remove-personal-information-from-internet" />
        <meta property="og:title" content="How to Remove Personal Information from the Internet (2026 Guide)" />
        <meta property="og:description" content="Learn how to remove personal information from Google, social media, and data brokers. Step-by-step privacy protection guide." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Remove Personal Information from the Internet (2026 Guide)" />
        <meta name="twitter:description" content="Learn how to remove personal information from Google, social media, and data brokers. Step-by-step privacy protection guide." />
      </Helmet>

      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-6">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/guides" className="hover:text-foreground transition-colors">Privacy Resources</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground">Remove Personal Information</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Privacy Guide · 2026
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                How to Remove Personal Information from the Internet
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Your personal information may be scattered across search engines, social
                media platforms, and data broker sites. This guide walks you through the
                process of finding and removing it — step by step.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/scan">
                    <Search className="h-4 w-4" />
                    Run Free Digital Footprint Scan
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/username-search-tools">
                    <ArrowRight className="h-4 w-4" />
                    Username Search Tools
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Why Your Personal Information Is Online */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                Why Your Personal Information Is Online
              </h2>
              <p className="text-muted-foreground mb-6">
                Most people have more data publicly available than they realise. Here are the
                most common sources of online exposure:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Globe,
                    title: "Data Brokers",
                    desc: "Sites like Spokeo, MyLife, and BeenVerified aggregate public records, marketing data, and social profiles into searchable databases — often without your knowledge.",
                  },
                  {
                    icon: RefreshCw,
                    title: "Username Reuse",
                    desc: "Using the same username across platforms creates a traceable chain. Anyone can search a handle and discover linked profiles across dozens of sites.",
                  },
                  {
                    icon: FileText,
                    title: "Public Records",
                    desc: "Court filings, property records, voter registration, and business filings are often indexed by search engines and aggregator sites.",
                  },
                  {
                    icon: UserX,
                    title: "Old & Forgotten Accounts",
                    desc: "Accounts you created years ago — on forums, social platforms, or services — may still contain personal details and remain publicly indexed.",
                  },
                ].map((item) => (
                  <div key={item.title} className="p-5 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step 1 */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Identify Where Your Data Appears
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Before you can remove anything, you need to know where your information is
                publicly visible. Start with these actions:
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: Search,
                    title: "Run a digital footprint check",
                    desc: "Scan your username, email, or name to discover public profiles and mentions.",
                    link: "/digital-footprint-check",
                    linkText: "Digital Footprint Check →",
                  },
                  {
                    icon: Eye,
                    title: "Search your usernames",
                    desc: "Check where your handles appear across social media, forums, and developer platforms.",
                    link: "/username-search-tools",
                    linkText: "Username Search Tools →",
                  },
                  {
                    icon: Globe,
                    title: "Check Google results",
                    desc: "Search your name (in quotes) plus your location or employer to see what Google surfaces.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                      {item.link && (
                        <Link to={item.link} className="text-sm text-primary hover:underline mt-1 inline-block">
                          {item.linkText}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Step 2 */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Remove from Search Engines
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Search engine de-indexing removes results from Google (or Bing), but doesn't
                delete the source content. It's an important first step — especially for
                outdated or sensitive results.
              </p>
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Google Content Removal</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Google provides a tool for requesting removal of outdated pages that no
                    longer exist at the original URL. You can also request removal of content
                    that contains personal information posing risks like doxxing.
                  </p>
                  <Link to="/privacy/google-content-removal" className="text-sm text-primary hover:underline">
                    Read our Google Content Removal Guide →
                  </Link>
                </div>
                <div className="p-5 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Outdated Content Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    If a page still exists but contains outdated personal information, you can
                    submit a request to Google to update their index. This is especially
                    useful when the source page has been updated but search results still show
                    old content.
                  </p>
                </div>
                <div className="p-5 rounded-xl bg-card border border-border">
                  <h3 className="font-semibold text-foreground mb-2">Legal Takedown Requests</h3>
                  <p className="text-sm text-muted-foreground">
                    For content that violates your legal rights — defamation, copyright
                    infringement, or involuntary exposure of personal data — Google offers a
                    legal request process. In EU/UK jurisdictions, GDPR's "right to be
                    forgotten" may also apply.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> De-indexing removes
                  the result from search engines, but the source page may still exist. For
                  full removal, you'll need to contact the website directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Remove from Data Brokers
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Data brokers collect and sell personal information. Most offer opt-out
                processes, though the steps and timelines vary.
              </p>
              <div className="space-y-3">
                {[
                  {
                    icon: Trash2,
                    title: "Opt-out processes",
                    desc: "Most data brokers are legally required to honour removal requests. Visit each broker's opt-out page and submit your request. Common brokers include Spokeo, MyLife, BeenVerified, and WhitePages.",
                  },
                  {
                    icon: Shield,
                    title: "Identity verification",
                    desc: "Some brokers require identity verification before processing a removal. This may include providing your name, email, or address. Only share the minimum required information.",
                  },
                  {
                    icon: RefreshCw,
                    title: "Ongoing monitoring",
                    desc: "Data brokers may re-list your information from other sources. Check back periodically — or use monitoring tools — to ensure your data stays removed.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                According to FootprintIQ research,{" "}
                <strong className="text-foreground">89% of data broker entries</strong>{" "}
                reference outdated or stale information — meaning removal is often
                straightforward once you identify the listing.
              </p>
            </div>
          </div>
        </section>

        {/* Step 4 */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                  4
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Secure Your Accounts
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Removal is only one part of the process. Securing your existing accounts
                prevents future exposure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: Lock,
                    title: "Enable multi-factor authentication",
                    desc: "Add a second verification step to all important accounts — email, banking, social media.",
                  },
                  {
                    icon: UserX,
                    title: "Change reused usernames",
                    desc: "If you use the same username across platforms, consider changing handles on high-risk services.",
                  },
                  {
                    icon: Eye,
                    title: "Review privacy settings",
                    desc: "Set profiles to private where possible. Remove personal details from bios and public fields.",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Delete unused accounts",
                    desc: "Old accounts are attack vectors. Deactivate or delete accounts you no longer use.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Learn more about username exposure in our{" "}
                <Link to="/username-reuse-risk" className="text-primary hover:underline">
                  username reuse risk guide
                </Link>.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border border-border rounded-xl px-5 bg-card"
                  >
                    <AccordionTrigger className="text-left text-foreground font-medium hover:no-underline">
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

        {/* CTA */}
        <section className="py-16 md:py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Check Your Online Exposure First
              </h2>
              <p className="text-muted-foreground mb-8">
                Before you can remove your data, you need to know where it appears. Run a
                free scan to discover your public digital footprint.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/scan">
                    <Search className="h-4 w-4" />
                    Run Free Digital Footprint Scan
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link to="/username-search-tools">
                    <ArrowRight className="h-4 w-4" />
                    Username Search Tools
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <RelatedToolsGrid currentPath="/remove-personal-information-from-internet" />
      </main>

      <Footer />
    </>
  );
};

export default RemovePersonalInformation;
