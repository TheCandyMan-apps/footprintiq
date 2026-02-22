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
import { ArrowRight, Search, Shield, Users, CheckCircle2, XCircle, Scale } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "What is the best free people search engine?",
    answer: "Free people search engines like TruePeopleSearch and FastPeopleSearch offer basic results, but they profit from displaying and selling your personal data. FootprintIQ offers a free tier that scans for username exposure and breach data without selling your information to third parties.",
  },
  {
    question: "Are people lookup sites legal?",
    answer: "Yes, most people lookup sites are legal because they aggregate publicly available information. However, using results for stalking, harassment, or discrimination is illegal. FootprintIQ operates under an Ethical OSINT Charter and is designed primarily for self-auditing, not surveillance.",
  },
  {
    question: "What is the most accurate person search engine?",
    answer: "Accuracy varies widely. Traditional people-search sites often contain outdated or merged records. FootprintIQ uses LENS AI confidence scoring to verify findings and reduce false positives, providing more reliable results than aggregation-based people-search services.",
  },
  {
    question: "How do people lookup sites get my information?",
    answer: "People-search sites aggregate data from public records, social media profiles, voter registrations, property records, court records, and data brokers. This information is then combined into searchable profiles. FootprintIQ differs by scanning for exposure without aggregating or reselling data.",
  },
  {
    question: "Can I remove myself from people search sites?",
    answer: "Yes, most sites offer opt-out processes, though they can be time-consuming. FootprintIQ's automated removal feature can help you opt out of major data brokers and people-search sites. See our data broker removal guide for step-by-step instructions.",
  },
  {
    question: "What's the difference between people-search sites and FootprintIQ?",
    answer: "People-search sites like Spokeo and BeenVerified profit from selling your personal data. FootprintIQ is a privacy-first platform that helps you understand and reduce your exposure — it never sells, shares, or aggregates personal information for commercial purposes.",
  },
];

const sites = [
  { name: "Spokeo", type: "Data Broker", sellsData: true, ethicalApproach: false, aiFiltering: false, removalTool: false },
  { name: "BeenVerified", type: "People Search", sellsData: true, ethicalApproach: false, aiFiltering: false, removalTool: false },
  { name: "TruePeopleSearch", type: "Free Aggregator", sellsData: true, ethicalApproach: false, aiFiltering: false, removalTool: false },
  { name: "Whitepages", type: "People Search", sellsData: true, ethicalApproach: false, aiFiltering: false, removalTool: false },
  { name: "Intelius", type: "Background Check", sellsData: true, ethicalApproach: false, aiFiltering: false, removalTool: false },
  { name: "FootprintIQ", type: "OSINT Intelligence", sellsData: false, ethicalApproach: true, aiFiltering: true, removalTool: true },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best People Lookup Sites in 2026 — Ethical Alternatives Compared",
  description: "Compare the best people lookup sites and people search engines. Understand how they work and which are ethical alternatives for finding people online.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/best-people-lookup-sites`,
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

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Best People Lookup Sites in 2026",
  itemListElement: sites.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.name,
    description: `${s.name} — ${s.type}`,
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE },
    { "@type": "ListItem", position: 2, name: "Best People Lookup Sites", item: `${BASE}/best-people-lookup-sites` },
  ],
};

const BestPeopleLookupSites = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Best People Lookup Sites in 2026 — Ethical Alternatives Compared</title>
        <meta name="description" content="Compare the best people lookup sites and person search engines in 2026. Learn how they work, which are ethical, and how FootprintIQ offers a privacy-first alternative." />
        <link rel="canonical" href={`${BASE}/best-people-lookup-sites`} />
        <meta property="og:title" content="Best People Lookup Sites in 2026 — Ethical Alternatives Compared" />
        <meta property="og:description" content="Compare the best people lookup sites and person search engines in 2026. Learn how they work, which are ethical, and how FootprintIQ offers a privacy-first alternative." />
        <meta property="og:url" content={`${BASE}/best-people-lookup-sites`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              People Search Comparison
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Best People Lookup Sites — <span className="text-primary">How They Work and Which Are Ethical</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              People-search sites aggregate and sell your personal data. This guide compares the most popular services and shows you an ethical, privacy-first alternative.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/scan">
                  <Search className="w-4 h-4" />
                  Check Your Exposure Free
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/people-search-vs-footprintiq">
                  <Scale className="w-4 h-4" />
                  Detailed Comparison
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>What Are People Lookup Sites?</h2>
            <p>
              People lookup sites — also called <strong>people search engines</strong> or <strong>person finders</strong> — are online services that aggregate personal information from public records, social media profiles, voter registrations, property records, and data brokers. They compile this data into searchable profiles that anyone can access, often for free or for a small fee.
            </p>
            <p>
              Popular people lookup sites include <strong>Spokeo</strong>, <strong>BeenVerified</strong>, <strong>TruePeopleSearch</strong>, <strong>Whitepages</strong>, and <strong>Intelius</strong>. While these services can be useful for reconnecting with lost contacts, they raise significant privacy concerns because they profit from exposing personal data without meaningful consent.
            </p>

            <h2>How People Search Engines Work</h2>
            <p>
              People search engines operate by collecting data from multiple public and semi-public sources, then merging records that appear to belong to the same individual. The process typically involves:
            </p>
            <ol>
              <li><strong>Data collection:</strong> Scraping public records (court filings, property deeds, voter rolls), social media profiles, and purchasing data from commercial data brokers.</li>
              <li><strong>Record matching:</strong> Using algorithms to link records that share common identifiers (name, address, phone number, email).</li>
              <li><strong>Profile creation:</strong> Aggregating matched records into a single searchable profile that may include addresses, phone numbers, relatives, employment history, and social media accounts.</li>
              <li><strong>Monetisation:</strong> Selling access to these profiles through subscription plans, pay-per-report models, or advertising revenue.</li>
            </ol>
            <p>
              The fundamental issue is that these sites <strong>profit from your personal data</strong> without your consent. Even when they offer opt-out processes, new data is continuously re-aggregated, making permanent removal nearly impossible without ongoing monitoring.
            </p>

            <h2>Comparison: People Lookup Sites vs FootprintIQ</h2>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-foreground font-semibold">Service</th>
                    <th className="text-left p-4 text-foreground font-semibold">Type</th>
                    <th className="text-center p-4 text-foreground font-semibold">Sells Data</th>
                    <th className="text-center p-4 text-foreground font-semibold">Ethical Charter</th>
                    <th className="text-center p-4 text-foreground font-semibold">AI Filtering</th>
                    <th className="text-center p-4 text-foreground font-semibold">Removal Tool</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => (
                    <tr key={site.name} className={`border-b border-border ${site.name === "FootprintIQ" ? "bg-primary/5" : ""}`}>
                      <td className="p-4 font-medium text-foreground">{site.name}</td>
                      <td className="p-4 text-muted-foreground">{site.type}</td>
                      <td className="p-4 text-center">
                        {site.sellsData ? <XCircle className="w-5 h-5 text-destructive mx-auto" /> : <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />}
                      </td>
                      <td className="p-4 text-center">
                        {site.ethicalApproach ? <CheckCircle2 className="w-5 h-5 text-primary mx-auto" /> : <XCircle className="w-5 h-5 text-destructive mx-auto" />}
                      </td>
                      <td className="p-4 text-center">
                        {site.aiFiltering ? <CheckCircle2 className="w-5 h-5 text-primary mx-auto" /> : <XCircle className="w-5 h-5 text-destructive mx-auto" />}
                      </td>
                      <td className="p-4 text-center">
                        {site.removalTool ? <CheckCircle2 className="w-5 h-5 text-primary mx-auto" /> : <XCircle className="w-5 h-5 text-destructive mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* More Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Why FootprintIQ Is Different</h2>
            <p>
              FootprintIQ — Ethical Digital Footprint Intelligence Platform — takes a fundamentally different approach to people search. Instead of aggregating and selling personal data, FootprintIQ helps you <strong>understand and reduce your own exposure</strong>.
            </p>
            <ul>
              <li><strong>No data brokerage:</strong> FootprintIQ never sells, shares, or monetises personal data. Scan results are encrypted and accessible only to you.</li>
              <li><strong>AI-powered accuracy:</strong> <Link to="/lens" className="text-primary hover:underline">LENS confidence scoring</Link> reduces false positives that plague traditional people-search sites.</li>
              <li><strong>Actionable remediation:</strong> Instead of just showing you what's exposed, FootprintIQ provides step-by-step guidance to remove or secure each finding.</li>
              <li><strong>Ethical framework:</strong> All scanning follows the <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link> — consent, transparency, and responsible use.</li>
              <li><strong>Automated removal:</strong> <Link to="/automated-removal" className="text-primary hover:underline">Opt out of data brokers</Link> directly through the platform.</li>
            </ul>

            <h2>The Best Person Search Engine for Self-Auditing</h2>
            <p>
              If you're searching for the <strong>best search engine for finding people</strong>, the answer depends on your intent. For reconnecting with someone, a basic people-search site may suffice. But for understanding your <em>own</em> digital exposure — what strangers, employers, or bad actors can find about you — FootprintIQ is purpose-built.
            </p>
            <p>
              FootprintIQ scans across 500+ platforms including social media, forums, dating sites, developer communities, and data brokers. Results include breach data correlation, username exposure mapping, and dark web monitoring — capabilities that traditional people-search sites don't offer.
            </p>

            <h2>How to Remove Yourself from People Search Sites</h2>
            <p>
              If you've found yourself listed on people-search sites, removal is possible but requires systematic effort. Here's the process:
            </p>
            <ol>
              <li><strong>Run a FootprintIQ scan</strong> to identify which sites list your information.</li>
              <li><strong>Submit opt-out requests</strong> to each site — FootprintIQ's <Link to="/automated-removal" className="text-primary hover:underline">automated removal</Link> handles this for major brokers.</li>
              <li><strong>Monitor re-listing:</strong> Data brokers frequently re-aggregate your data. Use <Link to="/continuous-exposure-monitoring-explained" className="text-primary hover:underline">continuous monitoring</Link> to catch new listings.</li>
              <li><strong>Follow our guides:</strong> See the <Link to="/data-broker-removal-guide" className="text-primary hover:underline">Data Broker Removal Guide</Link> and <Link to="/remove-yourself-from-google-search" className="text-primary hover:underline">Google removal guide</Link> for detailed instructions.</li>
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">See What People-Search Sites Know About You</h2>
            <p className="text-muted-foreground mb-8">
              Run a free scan to discover your exposure across data brokers, people-search sites, and social platforms.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/scan">
                <ArrowRight className="w-4 h-4" />
                Start Free Scan
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
            <RelatedToolsGrid currentPath="/best-people-lookup-sites" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BestPeopleLookupSites;
