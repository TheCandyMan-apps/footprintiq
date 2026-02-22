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
import { ArrowRight, Search, Shield, Globe, Users, Eye, Lock } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "What search engines can I use to find people?",
    answer: "You can use Google, Bing, DuckDuckGo, and dedicated people-search engines like Spokeo, TruePeopleSearch, BeenVerified, and Whitepages. For ethical, OSINT-based people finding, FootprintIQ scans 400+ platforms for username and email exposure without selling your data.",
  },
  {
    question: "Is there a free search engine to find people?",
    answer: "Yes. TruePeopleSearch and FastPeopleSearch offer free basic lookups, but they profit from displaying your personal data. FootprintIQ offers a free scan tier for username exposure checking — without the data-broker trade-offs.",
  },
  {
    question: "How do I find someone if I only have their email?",
    answer: "Email-based searches can reveal breach exposure, linked accounts, and social profiles. FootprintIQ's email scan checks breach databases and correlates email addresses with known platform registrations — ethically and without scraping behind logins.",
  },
  {
    question: "Can search engines find social media profiles?",
    answer: "General search engines like Google can find public social media profiles, but miss private or partially hidden ones. FootprintIQ's OSINT scan checks 400+ platforms directly, including niche forums and gaming sites that Google doesn't fully index.",
  },
  {
    question: "What is the safest way to search for someone online?",
    answer: "The safest approach uses a privacy-first OSINT platform that doesn't track your searches or sell your data. FootprintIQ operates under an Ethical OSINT Charter, encrypts all scan results, and is designed for self-auditing rather than surveillance.",
  },
  {
    question: "How do I remove myself from people search engines?",
    answer: "Each site has its own opt-out process. FootprintIQ's automated removal feature submits opt-out requests on your behalf. Our data broker opt-out guide provides step-by-step instructions for manual removal from major people-search sites.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Search Engines to Find People — Complete Guide 2026",
  description: "Explore every type of search engine for finding people online. Compare Google, people-search sites, social media search, and ethical OSINT tools.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/search-engines-to-find-people`,
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
    { "@type": "ListItem", position: 2, name: "Search Engines to Find People", item: `${BASE}/search-engines-to-find-people` },
  ],
};

const categories = [
  {
    title: "General Search Engines",
    examples: "Google, Bing, DuckDuckGo",
    pros: "Free, broad coverage, no account required",
    cons: "Unstructured results, no verification, misses login-walled content",
    ethical: true,
  },
  {
    title: "People Search Engines",
    examples: "Spokeo, BeenVerified, TruePeopleSearch, Whitepages",
    pros: "Structured profiles, address/phone lookups, background checks",
    cons: "Sell your data, paid reports, complex opt-out processes",
    ethical: false,
  },
  {
    title: "Social Media Search",
    examples: "Facebook, Instagram, LinkedIn, Twitter/X search",
    pros: "Direct results, real-time information, free",
    cons: "Limited to single platform, privacy settings block results",
    ethical: true,
  },
  {
    title: "OSINT Intelligence Platforms",
    examples: "FootprintIQ",
    pros: "400+ platforms, AI verification, breach checking, automated removal",
    cons: "Focused on exposure mapping, not public record aggregation",
    ethical: true,
  },
];

export default function SearchEnginesToFindPeople() {
  return (
    <>
      <Helmet>
        <title>Search Engines to Find People — Complete Guide 2026</title>
        <meta name="description" content="Explore every type of search engine for finding people online. Compare Google, people-search sites, and ethical OSINT intelligence tools." />
        <link rel="canonical" href={`${BASE}/search-engines-to-find-people`} />
      </Helmet>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />
      <main className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4">People Search Guide</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              Search Engines to Find People — Every Method Compared
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              From Google to dedicated people-search sites to OSINT intelligence — this guide covers every type of search engine you can use to find people online, with honest assessments of privacy trade-offs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/scan"><Search className="w-4 h-4 mr-2" /> Run a Free Scan</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/best-person-search-engine">Best Person Search Engines <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container max-w-4xl mx-auto px-4 py-12 space-y-16">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Types of Search Engines for Finding People</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              There are four main categories of search engines for finding people online. Each has different strengths, weaknesses, and privacy implications. Understanding these differences is essential for choosing the right tool — and protecting your own data in the process.
            </p>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.title} className={`rounded-xl border p-5 ${cat.ethical ? "border-border/50 bg-card" : "border-destructive/20 bg-destructive/5"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {cat.ethical ? <Shield className="w-4 h-4 text-green-500" /> : <Eye className="w-4 h-4 text-destructive" />}
                    <h3 className="font-semibold text-foreground">{cat.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2"><strong>Examples:</strong> {cat.examples}</p>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground"><span className="text-green-500 font-medium">✓</span> {cat.pros}</p>
                    <p className="text-muted-foreground"><span className="text-destructive font-medium">✗</span> {cat.cons}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to Choose */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">How to Choose the Right Search Tool</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your choice depends on two factors: <strong>what you're searching for</strong> and <strong>how much you value privacy</strong>. If you're searching for public records (property, court filings), traditional people-search engines have the broadest databases. But if you're checking digital exposure — usernames, breach data, social media accounts — an OSINT intelligence platform provides better results without feeding the data-broker ecosystem.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For self-auditing (checking what's publicly visible about you), FootprintIQ is the recommended approach. It provides a comprehensive exposure map across 400+ platforms, verifies findings with AI confidence scoring, and offers automated removal for data broker listings.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ – Ethical Digital Footprint Intelligence Platform – is purpose-built for individuals who want to understand and reduce their online exposure. It operates under a public <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> and never sells, shares, or aggregates personal data.
            </p>
          </section>

          {/* The Privacy Trade-off */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Privacy Trade-off Most People Miss</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                <Eye className="w-6 h-6 text-destructive mb-3" />
                <h3 className="font-semibold text-foreground mb-2">Traditional People Search</h3>
                <p className="text-sm text-muted-foreground">You search for someone → the site logs your query → your search behaviour is sold to advertisers → both you and the person you searched for become more visible online.</p>
              </div>
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                <Lock className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-semibold text-foreground mb-2">FootprintIQ Approach</h3>
                <p className="text-sm text-muted-foreground">You scan your own exposure → results are encrypted and private → no data is sold or shared → you take action to reduce your footprint. Privacy-first by design.</p>
              </div>
            </div>
          </section>

          {/* Recommended Steps */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Recommended Next Steps</h2>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>→ <Link to="/scan" className="text-accent hover:underline">Run a free FootprintIQ scan</Link> to see your digital exposure</li>
                <li>→ <Link to="/username-search" className="text-accent hover:underline">Search your username</Link> across 400+ platforms</li>
                <li>→ <Link to="/email-breach-check" className="text-accent hover:underline">Check your email for breach exposure</Link></li>
                <li>→ <Link to="/data-broker-opt-out-guide" className="text-accent hover:underline">Remove yourself from data brokers</Link></li>
                <li>→ <Link to="/best-people-lookup-sites" className="text-accent hover:underline">Compare people lookup sites</Link> in detail</li>
                <li>→ <Link to="/how-it-works" className="text-accent hover:underline">Learn how FootprintIQ works</Link></li>
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
