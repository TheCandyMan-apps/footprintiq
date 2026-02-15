import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import {
  ArrowRight,
  ChevronRight,
  User,
  Mail,
  Globe,
  Camera,
  MessageSquare,
  FileText,
  Database,
  Eye,
  Shield,
  Search,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/what-can-people-find-about-me";

const webPageSchema = buildWebPageSchema({
  name: "What Can People Find About Me Online? – Complete Guide",
  description:
    "Discover what people can find about you online. Social profiles, public records, data brokers, breach data, photos, and forum posts — mapped and explained.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What can people find about me online?",
    answer:
      "People can find social media profiles, public records (address, phone, family connections), data broker listings, email breach records, forum posts, photos, professional profiles (LinkedIn), domain registrations, and more. The full picture is usually much larger than most people expect. FootprintIQ scans 500+ sources to show you exactly what's publicly visible.",
  },
  {
    question: "How do I find out what the internet knows about me?",
    answer:
      "Start by Googling your name, email, and usernames. Check Have I Been Pwned for email breaches. Search major data broker sites (Spokeo, BeenVerified). Or run a single FootprintIQ scan that checks all of these sources automatically — usernames across 500+ platforms, breach databases, data brokers, and dark web signals — in under 60 seconds.",
  },
  {
    question: "Can strangers see my personal information online?",
    answer:
      "Yes. Even if you think your accounts are private, data brokers, breach databases, and public records expose more than most people realise. Data brokers aggregate public records, social data, and commercial data into searchable profiles that anyone can access. FootprintIQ helps you identify exactly what strangers can see.",
  },
  {
    question: "How do I remove personal information from the internet?",
    answer:
      "First, map your exposure using FootprintIQ to understand what's out there. Then prioritise: delete or privatise social accounts you don't use, submit opt-out requests to data brokers (FootprintIQ provides direct links), request Google content removal for sensitive results, and change compromised credentials. See our data broker removal guide for step-by-step instructions.",
  },
  {
    question: "Is it free to check what people can find about me?",
    answer:
      "FootprintIQ offers a free tier that scans usernames across 500+ platforms and checks basic email breach data. The Pro plan adds data broker scanning, dark web monitoring, AI confidence scoring, and remediation guidance. You can start with a free scan to see the scope of your exposure.",
  },
];

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
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "What Can People Find About Me", item: PAGE_URL },
  ],
};

const exposureCategories = [
  {
    icon: User,
    title: "Social Media Profiles",
    description: "Public and semi-public social media accounts are the first thing people find. Even 'private' accounts often expose profile photos, bios, usernames, follower counts, and linked accounts.",
    tool: "FootprintIQ scans 500+ social media platforms for your username.",
    toolLink: "/usernames",
    toolLabel: "Username Search Tool",
  },
  {
    icon: FileText,
    title: "Public Records",
    description: "Government databases, voter registrations, property records, court filings, and business registrations are publicly available in most jurisdictions. Data brokers aggregate these into easily searchable profiles.",
    tool: "FootprintIQ identifies which data brokers list your public records.",
    toolLink: "/data-broker-removal-guide",
    toolLabel: "Data Broker Removal Guide",
  },
  {
    icon: Database,
    title: "Data Broker Listings",
    description: "People-search sites like Spokeo, BeenVerified, MyLife, and Whitepages compile profiles using public records, social media data, and commercial databases. These profiles typically include your name, address, phone, email, age, relatives, and estimated income.",
    tool: "FootprintIQ scans major data brokers and provides opt-out links.",
    toolLink: "/how-to-remove-yourself-from-data-brokers",
    toolLabel: "How to Remove from Data Brokers",
  },
  {
    icon: Mail,
    title: "Email Breach Data",
    description: "If your email has appeared in a data breach, attackers may have your password, security questions, IP addresses, and personal details from that service. Breach data is traded on dark web marketplaces and paste sites.",
    tool: "FootprintIQ checks your email against breach databases.",
    toolLink: "/email-breach-check",
    toolLabel: "Email Breach Check",
  },
  {
    icon: MessageSquare,
    title: "Forum Posts & Comments",
    description: "Posts on Reddit, Quora, Stack Overflow, and niche forums are publicly searchable and often linked to your username. Old posts you've forgotten may contain personal details, opinions, or identifying information.",
    tool: "FootprintIQ's username search finds forum accounts linked to your username.",
    toolLink: "/check-username-across-platforms",
    toolLabel: "Check Username Across Platforms",
  },
  {
    icon: Camera,
    title: "Photos & Images",
    description: "Profile photos, tagged images, and photos you've posted publicly are searchable through reverse image search and social media. Metadata in uploaded photos can sometimes reveal location data.",
    tool: "FootprintIQ identifies platforms where your profiles (and photos) are publicly visible.",
    toolLink: "/scan",
    toolLabel: "Run a Scan",
  },
  {
    icon: Globe,
    title: "Domain Registrations & Websites",
    description: "If you've registered a domain name, your WHOIS records may expose your name, email, phone, and address unless you've used privacy protection. Personal websites and blogs are fully public.",
    tool: "Consider WHOIS privacy protection for any domains you own.",
    toolLink: "/stay-private-online",
    toolLabel: "Stay Private Online Guide",
  },
  {
    icon: Eye,
    title: "Dark Web Mentions",
    description: "If your credentials have been leaked in breaches, they may appear in dark web compilations. This includes email/password combinations, personal details, and financial information from compromised services.",
    tool: "FootprintIQ detects dark web references to your personal data.",
    toolLink: "/dark-web-monitoring",
    toolLabel: "Dark Web Monitoring",
  },
];

export default function WhatCanPeopleFindAboutMe() {
  return (
    <>
      <Helmet>
        <title>What Can People Find About Me Online? – Complete Guide | FootprintIQ</title>
        <meta
          name="description"
          content="Discover what people can find about you online. Social profiles, public records, data brokers, breach data, photos, and forum posts — mapped and explained."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="What Can People Find About Me Online? | FootprintIQ" />
        <meta property="og:description" content="Discover what people can find about you online. Social profiles, breach data, data brokers, and more — mapped and explained." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">What Can People Find About Me</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Digital Exposure Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              What Can People Find About Me Online?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              The answer is almost certainly more than you think. Social media profiles, breach records, data broker listings, forum posts, and public records create a detailed picture of your digital identity — all from publicly available sources.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Find Out Now — Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* The Scope of Your Digital Footprint */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Scope of Your Digital Footprint Is Larger Than You Think</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Most people think they have a small online presence. In reality, every account you've ever created, every platform that's indexed your username, and every data broker that's aggregated your public records contributes to a digital footprint that grows year after year.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              A 2026 study by FootprintIQ found that the <strong className="text-foreground">average person has data points on over 120 publicly accessible sources</strong>. This includes platforms they've long forgotten, data brokers they've never heard of, and breach databases they didn't know existed.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The categories below explain exactly what types of information are publicly discoverable — and which <Link to="/how-it-works" className="text-accent hover:underline">FootprintIQ tools</Link> can help you find and address each one.
            </p>
          </div>
        </section>

        {/* Exposure Categories */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">8 Categories of Discoverable Information</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Here's what people, employers, scammers, and data aggregators can find about you online — and how FootprintIQ helps you map each category.
            </p>

            <div className="space-y-6">
              {exposureCategories.map((cat) => (
                <div key={cat.title} className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <cat.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold">{cat.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">{cat.description}</p>
                  <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 flex items-start gap-3">
                    <Search className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">{cat.tool}</p>
                      <Link to={cat.toolLink} className="text-sm text-accent hover:underline mt-1 inline-block">
                        {cat.toolLabel} →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who's Looking */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Who's Looking at Your Online Presence?</h2>
            <div className="space-y-4">
              {[
                { title: "Employers & Recruiters", description: "87% of employers check candidates' online presence. They search your name, review social media, and may use people-search tools to build a background picture." },
                { title: "Scammers & Social Engineers", description: "Fraudsters use publicly available data to craft convincing phishing attacks, impersonate you, or attempt account takeovers using information gleaned from your digital footprint." },
                { title: "Data Brokers", description: "People-search aggregators continuously scrape and compile public data into profiles they sell. Your information may appear on dozens of broker sites without your knowledge." },
                { title: "Curious Individuals", description: "Dates, neighbours, old acquaintances — anyone with basic internet skills can search your name and find more than you'd expect." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border/50 bg-card p-5">
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center gap-2 justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Take Control of Your Digital Presence</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              The first step to protecting your privacy is understanding what's already out there. Run a free FootprintIQ scan to see your full digital exposure — usernames, breaches, data brokers, and more — in under 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Scan My Exposure Now <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Plans</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/50 bg-card px-6">
                  <AccordionTrigger className="text-left font-semibold text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Internal Links & Footer */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <RelatedToolsGrid currentPath="/what-can-people-find-about-me" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
