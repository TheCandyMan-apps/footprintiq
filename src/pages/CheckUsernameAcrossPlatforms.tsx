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
  Search,
  Shield,
  CheckCircle2,
  Users,
  AlertTriangle,
  Globe,
  Zap,
  Filter,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/check-username-across-platforms";

const webPageSchema = buildWebPageSchema({
  name: "Check Username Across Platforms – Find Where You Appear Online",
  description:
    "Check where a username appears across 500+ social media platforms, forums, and communities. Understand your digital exposure with ethical, AI-filtered OSINT scanning.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "How do I check a username across platforms?",
    answer:
      "You can manually search for a username on each platform individually, use CLI tools like Sherlock or Maigret, or use an automated platform like FootprintIQ that checks 500+ sites simultaneously with AI false-positive filtering. FootprintIQ also correlates username findings with breach data and data broker exposure.",
  },
  {
    question: "What's the difference between availability checkers and exposure checkers?",
    answer:
      "Availability checkers (like Namechk) check if a username is free to register on a platform — useful for branding. Exposure checkers (like FootprintIQ) check if a username is already in use, revealing where you already appear publicly. The goals are fundamentally different: one is about claiming a name, the other is about understanding your digital footprint.",
  },
  {
    question: "Is it legal to check a username across platforms?",
    answer:
      "Yes, checking whether a username exists on publicly accessible platforms is legal — the information is publicly available. However, you should only investigate usernames you own or have authorisation to research. Using results for harassment, stalking, or doxxing is illegal and unethical.",
  },
  {
    question: "How many platforms does FootprintIQ check?",
    answer:
      "FootprintIQ checks over 500 platforms including social media networks, forums, gaming communities, professional sites, coding platforms, and niche communities. The platform database is continuously updated to include new services and remove defunct ones.",
  },
  {
    question: "What is username OSINT?",
    answer:
      "Username OSINT is the practice of using a username as a starting point for open source intelligence gathering. By checking where a username appears across the internet, you can map an individual's digital presence, identify potential exposure risks, and understand how different online identities are connected.",
  },
  {
    question: "How accurate are username search results?",
    answer:
      "Raw username searches from CLI tools produce 30-50% false positives on average. FootprintIQ applies AI-powered confidence scoring (LENS) to filter out false matches, dead links, and generic profiles — delivering results you can actually trust and act on.",
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
    { "@type": "ListItem", position: 2, name: "Check Username Across Platforms", item: PAGE_URL },
  ],
};

const steps = [
  {
    icon: Search,
    title: "Enter Your Username",
    description: "Provide the username you want to check. FootprintIQ searches across 500+ platforms simultaneously — social media, forums, gaming sites, professional networks, and niche communities.",
  },
  {
    icon: Filter,
    title: "AI-Powered Filtering",
    description: "LENS (our AI confidence engine) analyses every result, removing false positives, dead links, and profiles that don't match. You see only verified, trustworthy findings.",
  },
  {
    icon: Globe,
    title: "Cross-Platform Mapping",
    description: "See exactly where your username appears across the internet, organised by platform category. Understand the full scope of your public digital footprint.",
  },
  {
    icon: Shield,
    title: "Risk Assessment & Remediation",
    description: "Each finding includes a risk score and actionable remediation guidance — opt-out links, privacy setting recommendations, and priority rankings based on exposure severity.",
  },
];

export default function CheckUsernameAcrossPlatforms() {
  return (
    <>
      <Helmet>
        <title>Check Username Across Platforms – Find Where You Appear | FootprintIQ</title>
        <meta
          name="description"
          content="Check where a username appears across 500+ social media platforms, forums, and communities. Understand your digital exposure with ethical, AI-filtered OSINT scanning."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Check Username Across Platforms | FootprintIQ" />
        <meta property="og:description" content="Find where a username appears across 500+ platforms with AI-powered false-positive filtering." />
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
            <li className="text-foreground font-medium">Check Username Across Platforms</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Username Exposure Check</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Check Your Username Across 500+ Platforms
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Discover where your username appears publicly on social media, forums, gaming sites, and communities. Understand your digital exposure — then take action to reduce it.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/username-search">
                  Check Your Username <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Availability vs Exposure */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Availability Checkers vs. Exposure Checkers</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              There are two fundamentally different reasons to check a username across platforms — and the tools are designed for different goals.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-xl border border-border/50 bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Availability Checkers</h3>
                <p className="text-xs text-muted-foreground/60 mb-4 uppercase tracking-wider">For branding & registration</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />Check if a username is free to register</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />Useful for brand consistency across platforms</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />Tools: Namechk, KnowEm, CheckUserNames</li>
                </ul>
              </div>

              <div className="rounded-xl border border-accent/30 bg-card p-6">
                <h3 className="text-lg font-semibold mb-3">Exposure Checkers</h3>
                <p className="text-xs text-accent/70 mb-4 uppercase tracking-wider">For privacy & security</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Find where you already appear publicly</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Map your digital footprint for risk assessment</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />Tools: FootprintIQ, Sherlock, Maigret</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How FootprintIQ Checks Usernames</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A four-step process that goes beyond simple availability checking to deliver accurate, actionable exposure intelligence.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {steps.map((step, i) => (
                <div key={step.title} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">{i + 1}</div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Gets Checked */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What Platforms Get Checked?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              FootprintIQ's platform database covers 500+ sites across multiple categories:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { cat: "Social Media", examples: "Instagram, TikTok, X/Twitter, Facebook, Reddit" },
                { cat: "Professional Networks", examples: "LinkedIn, GitHub, GitLab, Stack Overflow" },
                { cat: "Gaming & Entertainment", examples: "Steam, Xbox, PlayStation, Twitch, Discord" },
                { cat: "Forums & Communities", examples: "Quora, Medium, HackerNews, niche forums" },
                { cat: "Creative Platforms", examples: "Behance, DeviantArt, SoundCloud, Spotify" },
                { cat: "Messaging & Dating", examples: "Telegram, Snapchat, dating platforms" },
              ].map((item) => (
                <div key={item.cat} className="p-4 rounded-lg border border-border/50 bg-card">
                  <p className="font-semibold text-sm mb-1">{item.cat}</p>
                  <p className="text-xs text-muted-foreground">{item.examples}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical Note */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-accent/20 bg-accent/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Ethical Usage</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    FootprintIQ is designed for self-assessment and authorised investigations only. Only check usernames you own or have explicit permission to investigate. Using username search results for harassment, stalking, doxxing, or unauthorised profiling is illegal and violates our{" "}
                    <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <RelatedToolsGrid currentPath="/check-username-across-platforms" />
          </div>
        </section>

        {/* About */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Check Your Username?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover where your username appears publicly — and take action to reduce your digital exposure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/username-search">
                  Check Your Username <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
