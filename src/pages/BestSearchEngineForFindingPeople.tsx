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
import { ArrowRight, Search, Shield, Globe, CheckCircle2, UserSearch, Fingerprint } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "What is the best search engine for finding people?",
    answer: "Google is often the first stop, but dedicated tools like TruePeopleSearch, Pipl, and Spokeo provide deeper results by aggregating public records. For an ethical, privacy-first approach, FootprintIQ scans 400+ platforms for username and email exposure without selling personal data.",
  },
  {
    question: "Can you find someone with just a username?",
    answer: "Yes. Usernames are often reused across platforms, making them powerful identifiers. FootprintIQ can scan a single username across 400+ platforms to reveal linked accounts, breach exposure, and digital footprint patterns.",
  },
  {
    question: "How do I find someone online for free?",
    answer: "Start with Google, then check social media directly. Free people-search engines like TruePeopleSearch offer basic results but expose your own data in return. FootprintIQ's free tier provides username exposure scanning without data-broker trade-offs.",
  },
  {
    question: "Are people finder websites safe to use?",
    answer: "Most people finder websites are safe to visit but problematic for privacy — they collect and display personal data for profit. Using them also feeds data brokers with your search activity. FootprintIQ is privacy-first and does not track or sell search queries.",
  },
  {
    question: "What is the most accurate search engine for finding people?",
    answer: "Accuracy depends on the data source. Public-record aggregators have broad coverage but frequent errors. FootprintIQ uses LENS AI confidence scoring to verify each finding, reducing false positives significantly compared to traditional people-search sites.",
  },
  {
    question: "Is it ethical to search for someone online?",
    answer: "Searching publicly available information is legal and often justified — for self-auditing, reconnecting, or verifying contacts. However, using results for harassment, stalking, or discrimination is unethical and often illegal. FootprintIQ's Ethical OSINT Charter prohibits misuse.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Search Engine for Finding People — Ethical Tools in 2026",
  description: "Discover the best search engines for finding people online. Compare traditional people-search tools with ethical alternatives like FootprintIQ.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/best-search-engine-for-finding-people`,
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
    { "@type": "ListItem", position: 2, name: "Best Search Engine for Finding People", item: `${BASE}/best-search-engine-for-finding-people` },
  ],
};

const methods = [
  { icon: Globe, title: "Google & General Search", description: "Good starting point for name + location searches, but results are unstructured and mixed with irrelevant pages. Limited for usernames or emails." },
  { icon: UserSearch, title: "People Search Engines", description: "Spokeo, BeenVerified, and TruePeopleSearch aggregate public records into profiles. Effective but operate as data brokers — your data is the product." },
  { icon: Search, title: "Social Media Search", description: "Searching directly on Facebook, Instagram, LinkedIn, and Twitter. Effective for specific platforms but time-consuming and limited by privacy settings." },
  { icon: Fingerprint, title: "OSINT Intelligence (FootprintIQ)", description: "Scans 400+ platforms for username, email, and phone exposure. Privacy-first, AI-verified results, and automated removal — without data-broker trade-offs." },
];

export default function BestSearchEngineForFindingPeople() {
  return (
    <>
      <Helmet>
        <title>Best Search Engine for Finding People — Ethical Tools 2026</title>
        <meta name="description" content="Compare the best search engines for finding people online. From Google to OSINT intelligence, discover ethical tools that protect privacy." />
        <link rel="canonical" href={`${BASE}/best-search-engine-for-finding-people`} />
      </Helmet>
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />
      <main className="min-h-screen bg-background">
        <section className="py-16 md:py-24 bg-gradient-to-b from-accent/5 to-background">
          <div className="container max-w-4xl mx-auto px-4 text-center">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent mb-4">Finding People Online</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
              Best Search Engine for Finding People — Ethical Tools in 2026
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Whether you're reconnecting with someone, verifying a contact, or auditing your own visibility — this guide compares every method for finding people online and highlights ethical alternatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/scan"><Search className="w-4 h-4 mr-2" /> Run a Free Scan</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/best-person-search-engine">Compare Person Search Engines <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container max-w-4xl mx-auto px-4 py-12 space-y-16">
          {/* Methods for Finding People */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">4 Ways to Find People Online</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {methods.map((m) => (
                <div key={m.title} className="rounded-xl border border-border/50 bg-card p-5">
                  <m.icon className="w-6 h-6 text-accent mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{m.title}</h3>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Google Isn't Enough */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Google Alone Isn't Enough</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google indexes publicly accessible web pages, but it doesn't crawl social media accounts behind login walls, data broker databases, or breach records. A Google search for a person's name will return a mix of relevant and irrelevant results, with no verification or confidence scoring.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Dedicated people-search engines solve the coverage problem but create a privacy one — they aggregate and sell your information. OSINT intelligence platforms like FootprintIQ solve both: they scan across 400+ platforms with AI-verified results, without participating in the data-broker ecosystem.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For a comprehensive view of what's findable about a person, you need a tool that searches usernames, emails, phone numbers, breach databases, and social platforms — all in one scan. That's exactly what <Link to="/digital-footprint-scanner" className="text-accent hover:underline">FootprintIQ's digital footprint scanner</Link> provides.
            </p>
          </section>

          {/* The Data Broker Problem */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">The Data Broker Problem with People Search</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every time you use a traditional people-search engine, you're feeding the data-broker ecosystem. These services don't just show you results — they log your searches, build profiles on you, and sell your search behaviour to advertisers and other data brokers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The irony is stark: you use a people-search engine to find someone, and in doing so, you make yourself more findable. Your search queries, IP address, and browsing patterns become part of the data being traded.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ – Ethical Digital Footprint Intelligence Platform – takes the opposite approach. It operates under a public <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>, never sells data, and is designed to <em>reduce</em> your digital footprint rather than expand it.
            </p>
          </section>

          {/* Username-Based Search */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">Why Username Search Is More Effective Than Name Search</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Names are ambiguous — "John Smith" returns millions of results. Usernames, however, are often unique identifiers that a person reuses across platforms. A single username can reveal accounts on social media, forums, gaming platforms, and niche communities.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              FootprintIQ's <Link to="/username-search" className="text-accent hover:underline">username search</Link> scans 400+ platforms simultaneously, mapping every instance where a username appears. Combined with <Link to="/email-breach-check" className="text-accent hover:underline">email breach checking</Link>, this provides a far more accurate picture than any name-based people search engine.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For self-auditing, this is invaluable. Most people don't realise how many forgotten accounts are linked to their primary username. Our <Link to="/research/username-reuse-report-2026" className="text-accent hover:underline">2026 Username Reuse Report</Link> found that the average person has 7.4 discoverable accounts from a single username.
            </p>
          </section>

          {/* CTA */}
          <section className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">Find Out What's Publicly Visible About You</h2>
            <p className="text-muted-foreground mb-4">Run a free FootprintIQ scan — no data broker trade-offs, no personal data sold.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg"><Link to="/scan"><Search className="w-4 h-4 mr-2" /> Start Free Scan</Link></Button>
              <Button asChild variant="outline" size="lg"><Link to="/how-it-works">How It Works <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
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
