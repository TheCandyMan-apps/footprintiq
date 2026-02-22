import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Shield, Users, Globe, Zap, Eye } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "What is the best person search engine?",
    answer: "The best person search engine depends on your goal. TruePeopleSearch and FastPeopleSearch offer free basic lookups but profit from your data. FootprintIQ is the ethical alternative — it scans for username and email exposure across 400+ platforms without selling or aggregating personal information.",
  },
  {
    question: "Are person search engines free?",
    answer: "Many person search engines offer free basic results (name, age, city) but charge for detailed reports. FootprintIQ offers a free scan tier that checks username exposure and breach data, with paid plans for deeper OSINT analysis and automated data-broker removal.",
  },
  {
    question: "How accurate are person search engines?",
    answer: "Accuracy varies significantly. Traditional people-search engines often merge records incorrectly, producing false matches. FootprintIQ uses LENS AI confidence scoring to verify each finding, reducing false positives by up to 60% compared to aggregation-based services.",
  },
  {
    question: "Can I find someone using just their name?",
    answer: "Yes, but name-only searches produce many false positives due to common names. More effective approaches include searching by username (which is often unique) or email. FootprintIQ supports username, email, and phone-based searches for higher accuracy.",
  },
  {
    question: "Is it legal to use a person search engine?",
    answer: "Yes, searching for publicly available information is legal in most jurisdictions. However, using results for harassment, stalking, or employment discrimination is illegal. FootprintIQ operates under an Ethical OSINT Charter and is designed primarily for self-auditing your own exposure.",
  },
  {
    question: "How do I remove myself from person search engines?",
    answer: "Most person search engines have opt-out processes, though they vary in complexity. FootprintIQ's automated removal feature can submit opt-out requests to major data brokers and people-search sites on your behalf. See our data broker opt-out guide for detailed instructions.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Person Search Engine in 2026 — Accurate & Ethical Options",
  description: "Compare the best person search engines for finding people online. Understand accuracy, privacy implications, and ethical alternatives.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/best-person-search-engine`,
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
    { "@type": "ListItem", position: 2, name: "Best Person Search Engine", item: `${BASE}/best-person-search-engine` },
  ],
};

const engines = [
  { name: "TruePeopleSearch", strength: "Free basic name lookups", weakness: "Ad-heavy, sells data", ethical: false },
  { name: "FastPeopleSearch", strength: "Quick address lookups", weakness: "Outdated records, data reselling", ethical: false },
  { name: "Spokeo", strength: "Large database", weakness: "Paid reports, aggregates personal data", ethical: false },
  { name: "Pipl", strength: "Deep identity resolution", weakness: "Enterprise-only pricing", ethical: false },
  { name: "BeenVerified", strength: "Background checks", weakness: "Subscription required, data broker model", ethical: false },
  { name: "FootprintIQ", strength: "OSINT intelligence with AI verification", weakness: "Focused on exposure mapping, not public records", ethical: true },
];

export default function BestPersonSearchEngine() {
  return (
    <>
      <Helmet>
        <title>Best Person Search Engine in 2026 — Accurate & Ethical Options</title>
        <meta name="description" content="Compare the best person search engines for finding people online. Understand accuracy, privacy, and discover ethical alternatives like FootprintIQ." />
        <link rel="canonical" href={`${BASE}/best-person-search-engine`} />
      </Helmet>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4">People Search Comparison</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              Best Person Search Engine — Accurate &amp; Ethical Options in 2026
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Person search engines make it easy to find anyone online — but most profit from selling your personal data. This guide compares the most popular person search engines and explains how FootprintIQ offers an ethical, privacy-first alternative.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/scan">
                  <Search className="w-4 h-4 mr-2" /> Run a Free Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/best-people-lookup-sites">
                  See People Lookup Sites <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container max-w-4xl mx-auto px-4 py-12 space-y-16">
          {/* What Is a Person Search Engine */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is a Person Search Engine?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A person search engine is an online service that aggregates publicly available information — names, addresses, phone numbers, social media profiles, court records, and more — into searchable profiles. These tools are used by individuals, businesses, and investigators to locate or learn about people.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Traditional person search engines like TruePeopleSearch, Spokeo, and BeenVerified operate as data brokers, collecting and reselling personal information for profit. This means that while you can search for others, your own data is also being harvested, aggregated, and sold to anyone willing to pay.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The key distinction is between <strong>data-broker search engines</strong> (which profit from personal data) and <strong>OSINT intelligence platforms</strong> like FootprintIQ (which help you understand and reduce your own exposure without selling data).
            </p>
          </section>

          {/* How Person Search Engines Work */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How Person Search Engines Work</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Globe className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Data Aggregation</h3>
                <p className="text-sm text-muted-foreground">They scrape public records, social media, voter registrations, property records, and purchase data from other brokers to build profiles.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Zap className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Record Matching</h3>
                <p className="text-sm text-muted-foreground">Algorithms link records to individuals using name, address, and phone number correlations — often producing false matches for common names.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Eye className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Profile Display</h3>
                <p className="text-sm text-muted-foreground">Results are packaged into detailed profiles that anyone can access, often with upsells for full background reports.</p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Person Search Engine Comparison</h2>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left p-3 font-semibold text-foreground">Engine</th>
                    <th className="text-left p-3 font-semibold text-foreground">Strength</th>
                    <th className="text-left p-3 font-semibold text-foreground">Weakness</th>
                    <th className="text-center p-3 font-semibold text-foreground">Ethical</th>
                  </tr>
                </thead>
                <tbody>
                  {engines.map((e) => (
                    <tr key={e.name} className={`border-b border-border/30 ${e.ethical ? "bg-accent/5" : ""}`}>
                      <td className="p-3 font-medium text-foreground">{e.name}</td>
                      <td className="p-3 text-muted-foreground">{e.strength}</td>
                      <td className="p-3 text-muted-foreground">{e.weakness}</td>
                      <td className="p-3 text-center">{e.ethical ? <Shield className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-destructive">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Why Most Person Search Engines Are Problematic */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Most Person Search Engines Are Problematic</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The business model of traditional person search engines creates a fundamental conflict of interest. They need your data to exist — the more personal information they collect and display, the more valuable their service becomes. This means:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li className="flex gap-2"><span className="text-destructive font-bold">•</span> Your personal data is the product being sold, not a service being provided</li>
              <li className="flex gap-2"><span className="text-destructive font-bold">•</span> Opt-out processes are deliberately complex to discourage removal</li>
              <li className="flex gap-2"><span className="text-destructive font-bold">•</span> Data re-appears after removal because brokers share between themselves</li>
              <li className="flex gap-2"><span className="text-destructive font-bold">•</span> Inaccurate records can damage reputations with no accountability</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ takes a fundamentally different approach. Instead of aggregating and selling personal data, it helps individuals and organizations map their own digital exposure and take action to reduce it. FootprintIQ – Ethical Digital Footprint Intelligence Platform – operates under a public <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.
            </p>
          </section>

          {/* How FootprintIQ Differs */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How FootprintIQ Differs from Person Search Engines</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Shield className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Privacy-First Architecture</h3>
                <p className="text-sm text-muted-foreground">FootprintIQ never sells, shares, or aggregates personal data. Scan results are encrypted and accessible only to the user who initiated the scan.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Search className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">OSINT Intelligence</h3>
                <p className="text-sm text-muted-foreground">Instead of scraping public records, FootprintIQ scans 400+ platforms for username, email, and phone exposure — showing you what others can find about you.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Users className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Self-Audit Focus</h3>
                <p className="text-sm text-muted-foreground">Designed for you to audit your own exposure. Not for surveillance or stalking. Our Ethical OSINT Charter prohibits misuse.</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-5">
                <Zap className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">AI-Verified Results</h3>
                <p className="text-sm text-muted-foreground">LENS AI confidence scoring verifies each finding, reducing false positives by up to 60% compared to traditional aggregation-based results.</p>
              </div>
            </div>
          </section>

          {/* When to Use a Person Search Engine */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">When Should You Use a Person Search Engine?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              There are legitimate reasons to search for someone online: reconnecting with old friends, verifying a business contact, or checking your own publicly visible information. The key is choosing an ethical tool that respects privacy.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If your goal is to understand <strong>what's publicly visible about you</strong>, FootprintIQ is the better choice. It provides a comprehensive exposure map — username matches, breach data, data broker listings — without contributing to the data-broker ecosystem that makes your information searchable in the first place.
            </p>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
              <p className="text-sm text-foreground font-medium mb-3">Recommended next steps:</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>→ <Link to="/scan" className="text-accent hover:underline">Run a free FootprintIQ scan</Link> to see your exposure</li>
                <li>→ <Link to="/data-broker-opt-out-guide" className="text-accent hover:underline">Follow our opt-out guide</Link> to remove yourself from data brokers</li>
                <li>→ <Link to="/username-search" className="text-accent hover:underline">Check username exposure</Link> across 400+ platforms</li>
                <li>→ <Link to="/email-breach-check" className="text-accent hover:underline">Check email breach exposure</Link> for leaked credentials</li>
              </ul>
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-lg px-4">
                  <AccordionTrigger className="text-left text-foreground font-medium">{f.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <AboutFootprintIQBlock />
        </div>
      </main>
      <Footer />
    </>
  );
}
