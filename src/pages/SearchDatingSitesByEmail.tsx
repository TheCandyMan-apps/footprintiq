import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Shield, Mail, Lock, AlertTriangle, CheckCircle2 } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "Can you search dating sites by email address?",
    answer: "Yes. Email addresses are the primary identifier used for dating site registration. OSINT tools can check whether an email has been linked to dating platforms through breach databases, public API endpoints, and registration correlation. FootprintIQ's email scan includes dating platform coverage.",
  },
  {
    question: "Is searching dating sites by email legal?",
    answer: "Searching publicly available breach data and registration records is legal in most jurisdictions. FootprintIQ only accesses publicly available information and does not bypass authentication, scrape behind logins, or access private account data. Always use results responsibly and ethically.",
  },
  {
    question: "What does an email dating site search reveal?",
    answer: "An email-based search can reveal which dating platforms an email address has been used to register on, whether those credentials appeared in known data breaches, and whether public profiles still exist. Results vary based on platform exposure and breach data availability.",
  },
  {
    question: "How do I check if my email is on dating sites?",
    answer: "Run a free email scan with FootprintIQ. Enter your email address, and the scan will check for dating site registrations, breach appearances, and associated public profiles across major dating platforms. Results include confidence scores and remediation guidance.",
  },
  {
    question: "Can deleted dating profiles still appear in searches?",
    answer: "Yes. Even after deleting a dating account, your registration data may persist in breach databases, cached search engine results, and data broker aggregations. This is why ongoing exposure monitoring is important — deletion from the platform doesn't guarantee deletion from all data sources.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Search Dating Sites by Email — Free Email-to-Profile Lookup",
  description: "Learn how to search dating sites by email address using ethical OSINT methods. Discover which dating platforms are linked to an email through breach correlation.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/search-dating-sites-by-email`,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE },
    { "@type": "ListItem", position: 2, name: "Search Dating Sites by Email", item: `${BASE}/search-dating-sites-by-email` },
  ],
};

const SearchDatingSitesByEmail = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Search Dating Sites by Email — Free Email-to-Profile Lookup</title>
        <meta name="description" content="Search dating sites by email to discover which platforms are linked to an address. Ethical OSINT breach correlation and registration detection by FootprintIQ." />
        <link rel="canonical" href={`${BASE}/search-dating-sites-by-email`} />
        <meta property="og:title" content="Search Dating Sites by Email — Free Email-to-Profile Lookup" />
        <meta property="og:description" content="Search dating sites by email to discover which platforms are linked to an address. Ethical OSINT breach correlation and registration detection." />
        <meta property="og:url" content={`${BASE}/search-dating-sites-by-email`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Email-Based Dating Search
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Search Dating Sites by Email
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover which dating platforms are linked to an email address using breach correlation and ethical OSINT enrichment. No hacking, no login bypass — just transparent exposure intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/scan">
                  <Search className="w-4 h-4" />
                  Run Free Email Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/email-breach-check">
                  <Lock className="w-4 h-4" />
                  Email Breach Check
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How Email-Based Dating Site Searches Work</h2>
            <p>
              Email addresses are the universal identifier for dating site registrations. Nearly every dating platform — from Tinder and Bumble to niche services — requires an email address to create an account. This makes email-based OSINT searches one of the most effective methods for discovering dating platform exposure.
            </p>
            <p>
              FootprintIQ's email scan uses three primary methods to detect dating site connections:
            </p>
            <ol>
              <li>
                <strong>Breach database correlation:</strong> When a dating platform suffers a data breach, user credentials (email addresses and hashed passwords) become part of publicly available breach databases. FootprintIQ cross-references your email against these databases to identify dating platform registrations — even on platforms you may have forgotten about.
              </li>
              <li>
                <strong>Registration endpoint detection:</strong> Some dating platforms expose public API endpoints that confirm whether an email address has been used to register. FootprintIQ queries these endpoints ethically and within rate limits to detect active registrations.
              </li>
              <li>
                <strong>Data broker aggregation:</strong> People-search sites and data brokers often aggregate dating profile data. FootprintIQ's scan includes these aggregators, revealing which brokers have linked your email to dating platform activity.
              </li>
            </ol>

            <h2>Why Search Dating Sites by Email?</h2>
            <p>There are several legitimate, ethical reasons to check which dating platforms are linked to an email address:</p>
            <ul>
              <li><strong>Post-breach assessment:</strong> After a dating platform breach (like the 2015 Ashley Madison breach or 2022 Bumble data leak), checking your email against breach databases helps you understand your exposure and take protective action.</li>
              <li><strong>Account cleanup:</strong> Many people create dating accounts they later forget about. Email-based searches reveal lingering registrations that may still be holding your personal data.</li>
              <li><strong>Privacy audit:</strong> Understanding which services hold your data is the first step in a comprehensive <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint check</Link>.</li>
              <li><strong>Breach response:</strong> If your email appears in a new breach, knowing which services are linked helps you prioritise password changes and account security. See our <Link to="/data-breach-cleanup-checklist" className="text-primary hover:underline">breach cleanup checklist</Link>.</li>
            </ul>

            <h2>What an Email Dating Search Reveals</h2>
            <p>A comprehensive email-based dating site search can reveal:</p>
            <div className="not-prose my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle2, label: "Platform registrations", desc: "Which dating services your email has been used to sign up for" },
                { icon: CheckCircle2, label: "Breach appearances", desc: "Whether your dating credentials appeared in known data breaches" },
                { icon: CheckCircle2, label: "Active vs deleted profiles", desc: "Whether accounts are still active or have been deactivated" },
                { icon: CheckCircle2, label: "Data broker listings", desc: "Which people-search sites have linked your email to dating activity" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>

            <h2>FootprintIQ's Ethical Approach</h2>
            <p>
              FootprintIQ — Ethical Digital Footprint Intelligence Platform — approaches email-based dating searches with strict ethical guidelines:
            </p>
            <ul>
              <li><strong>No authentication bypass:</strong> We never attempt to log into accounts or access data behind login walls.</li>
              <li><strong>Public data only:</strong> All results come from publicly accessible breach databases, API endpoints, and aggregator records.</li>
              <li><strong>LENS verification:</strong> Each finding includes a <Link to="/lens" className="text-primary hover:underline">LENS confidence score</Link> to help you distinguish confirmed results from possible matches.</li>
              <li><strong>Remediation guidance:</strong> Every finding includes step-by-step instructions for securing or removing the identified exposure.</li>
            </ul>

            <div className="not-prose my-6 p-6 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Responsible Use Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    This tool is designed for self-auditing — checking your own email to understand your exposure. Using it to monitor others without consent may violate privacy laws. Read our <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</Link> and <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link>.
                  </p>
                </div>
              </div>
            </div>

            <h2>What to Do If Your Email Is Linked to Dating Sites</h2>
            <ol>
              <li><strong>Change your password immediately</strong> on any dating account that appeared in a breach. Use a unique, strong password for each service.</li>
              <li><strong>Enable two-factor authentication</strong> where available to prevent unauthorised access.</li>
              <li><strong>Delete unused accounts</strong> — log into platforms you no longer use and request full account deletion (not just deactivation).</li>
              <li><strong>Request data broker removal</strong> using FootprintIQ's <Link to="/automated-removal" className="text-primary hover:underline">automated removal</Link> feature.</li>
              <li><strong>Set up continuous monitoring</strong> with <Link to="/continuous-exposure-monitoring-explained" className="text-primary hover:underline">exposure monitoring</Link> to catch future breaches or re-listings.</li>
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Check If Your Email Is on Dating Sites</h2>
            <p className="text-muted-foreground mb-8">
              Run a free email scan to discover which dating platforms are linked to your address. Breach correlation, registration detection, and remediation guidance included.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/scan">
                <ArrowRight className="w-4 h-4" />
                Start Free Email Scan
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related + Footer Block */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <RelatedToolsGrid currentPath="/search-dating-sites-by-email" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default SearchDatingSitesByEmail;
