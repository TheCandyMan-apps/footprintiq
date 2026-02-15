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
  CheckCircle2,
  ChevronRight,
  Search,
  Mail,
  Shield,
  Globe,
  Eye,
  Database,
  AlertTriangle,
  UserCheck,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/scan-my-online-presence";

const webPageSchema = buildWebPageSchema({
  name: "Scan My Online Presence – Best Tool to Scan Your Digital Footprint",
  description:
    "Scan your online presence across 500+ platforms. Discover what's publicly visible about you — usernames, emails, breach data, data brokers, and social profiles. Free ethical OSINT scan.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What is the best tool to scan my online presence?",
    answer:
      "FootprintIQ is the most comprehensive online presence scanner available in 2026. It combines username enumeration across 500+ platforms, email breach detection, data broker scanning, and dark web signal monitoring into a single automated scan — with AI-powered false-positive filtering (LENS) to ensure accuracy. Unlike removal-only tools like DeleteMe or Incogni, FootprintIQ maps your full exposure first so you can act with precision.",
  },
  {
    question: "Is it free to scan my online presence?",
    answer:
      "Yes. FootprintIQ offers a free tier that includes username scanning across 500+ platforms and basic email breach detection. The Pro plan unlocks advanced features like data broker scanning, dark web monitoring, phone number lookups, LENS AI confidence scoring, and detailed remediation guidance. You can start with a free scan and upgrade when you need deeper intelligence.",
  },
  {
    question: "What does an online presence scan reveal?",
    answer:
      "An online presence scan reveals publicly accessible information linked to your identity. This includes social media profiles, forum accounts, data broker listings, email breach records, dark web mentions, and public records. FootprintIQ correlates findings across all these categories to produce a unified exposure map with risk scoring and prioritised remediation steps.",
  },
  {
    question: "How is FootprintIQ different from removal services like DeleteMe or Incogni?",
    answer:
      "Removal services like DeleteMe and Incogni focus exclusively on submitting opt-out requests to data brokers. They don't scan usernames, check breaches, or map your full digital footprint. FootprintIQ is an intelligence layer — it maps your entire online exposure across usernames, emails, breaches, data brokers, and dark web mentions, then prioritises what to act on first. Map it. Prioritise it. Reduce it.",
  },
  {
    question: "Is scanning my online presence legal?",
    answer:
      "Yes. FootprintIQ only accesses publicly available data. It does not hack, bypass logins, or access private information. Self-scanning your own online presence is legal in all major jurisdictions. FootprintIQ operates under a published Ethical OSINT Charter that ensures transparency, consent, and responsible methodology.",
  },
  {
    question: "How often should I scan my online presence?",
    answer:
      "We recommend scanning at least quarterly, and after any significant life event (job change, data breach notification, new social media account). Digital footprints change constantly as new data appears on broker sites, breaches are disclosed, and accounts are created. Regular scanning catches new exposures before they compound.",
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
    { "@type": "ListItem", position: 2, name: "Scan My Online Presence", item: PAGE_URL },
  ],
};

const scanCategories = [
  {
    icon: Search,
    title: "Username Enumeration",
    description: "Search your username across 500+ social media platforms, forums, developer communities, and niche sites. Discover every public account linked to your identity.",
    detail: "Most people reuse the same username across multiple platforms. A single search reveals the full map of your public presence — accounts you've forgotten, profiles you thought were private, and platforms you didn't know indexed your username.",
  },
  {
    icon: Mail,
    title: "Email Breach Detection",
    description: "Check whether your email addresses have appeared in known data breaches. Identify compromised credentials before attackers exploit them.",
    detail: "Email breach detection cross-references your addresses against aggregated breach databases including Have I Been Pwned. FootprintIQ goes further by correlating breach findings with your username exposure to identify cascading risks from credential reuse.",
  },
  {
    icon: Database,
    title: "Data Broker Scanning",
    description: "Identify your personal information on people-search and data broker sites like Spokeo, BeenVerified, MyLife, and Whitepages.",
    detail: "Data brokers aggregate public records, social media data, and purchase history into searchable profiles. FootprintIQ identifies which brokers list your information and provides direct opt-out links for each one, prioritised by exposure severity.",
  },
  {
    icon: Globe,
    title: "Dark Web Signal Detection",
    description: "Detect references to your personal data in dark web breach compilations and paste sites.",
    detail: "Dark web monitoring checks for your credentials in previously leaked databases. FootprintIQ clearly distinguishes between breach-database references and active dark web marketplace listings, avoiding the fear-based marketing common in the industry.",
  },
  {
    icon: Eye,
    title: "Social Profile Visibility",
    description: "Analyse the public visibility of your social media profiles. Understand what strangers, employers, and data aggregators can see.",
    detail: "Even 'private' social media accounts often expose more than you think — profile photos, bios, follower counts, and connected accounts. FootprintIQ maps what's visible to unauthenticated viewers across major platforms.",
  },
];

const differentiators = [
  {
    title: "Intelligence First, Not Removal First",
    description: "Most tools jump straight to removal. FootprintIQ maps your full exposure first so you know exactly what exists, where, and how severe it is. Blind removal without intelligence is like cleaning a house you've never inspected.",
  },
  {
    title: "Multi-Tool Pipeline in One Scan",
    description: "Instead of running Sherlock, Have I Been Pwned, and manual data broker checks separately, FootprintIQ combines multiple OSINT tools into a single automated scan with unified results.",
  },
  {
    title: "AI False-Positive Filtering (LENS)",
    description: "Raw OSINT tools produce many false positives. LENS applies AI confidence scoring to every finding, so you focus on real exposure rather than noise.",
  },
  {
    title: "Actionable Remediation Guidance",
    description: "Every finding comes with prioritised next steps: which accounts to secure, which brokers to opt out of, and which exposures to address first based on actual risk level.",
  },
];

export default function ScanMyOnlinePresence() {
  return (
    <>
      <Helmet>
        <title>Scan My Online Presence – Best Tool to Scan Your Entire Digital Footprint | FootprintIQ</title>
        <meta
          name="description"
          content="Scan your online presence across 500+ platforms. Discover what's publicly visible about you — usernames, emails, breach data, data brokers, and social profiles. Free ethical OSINT scan."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Scan My Online Presence – Best Online Presence Scanner | FootprintIQ" />
        <meta property="og:description" content="Scan your online presence across 500+ platforms. Discover usernames, breach data, data brokers, and social profiles linked to your identity." />
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
            <li className="text-foreground font-medium">Scan My Online Presence</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Search className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Online Presence Scanner</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Scan My Online Presence: See Everything That's Publicly Visible About You
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Your online presence is bigger than you think. Forgotten accounts, data broker listings, breach records, and social profiles create a traceable digital footprint. Scan yours in under 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Scan My Presence Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Scan */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Why Should You Scan Your Online Presence?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Every time you create an account, post on social media, or appear in a data breach, your online presence grows. Over years, this accumulates into a detailed digital profile that anyone — employers, scammers, data brokers, or curious strangers — can piece together from publicly available sources.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Most people dramatically underestimate their exposure. A 2026 FootprintIQ study found that the average internet user has <strong className="text-foreground">over 120 publicly discoverable data points</strong> across social media, breach databases, and data broker sites. Many of these are on platforms they no longer use or never knowingly joined.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Scanning your online presence is the essential first step to understanding — and reducing — your digital exposure. Without a map of what exists, you cannot prioritise what to fix. FootprintIQ provides that map through a single, automated, <Link to="/ethical-osint-charter" className="text-accent hover:underline">ethically-sourced scan</Link>.
            </p>
          </div>
        </section>

        {/* What Gets Scanned */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">What Does an Online Presence Scan Cover?</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              FootprintIQ scans five categories of digital exposure in a single pass. Here's what each reveals about your public visibility.
            </p>

            <div className="space-y-6">
              {scanCategories.map((cat) => (
                <div key={cat.title} className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <cat.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold">{cat.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">{cat.description}</p>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">{cat.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How FootprintIQ Differs */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              How FootprintIQ Differs from Removal-Only Tools
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Tools like DeleteMe, Incogni, and Aura focus on data broker removal. FootprintIQ is the intelligence layer that maps your full exposure first — because you can't fix what you can't see.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {differentiators.map((d) => (
                <div key={d.title} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <h3 className="text-lg font-bold">{d.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{d.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3-Step Flow */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Map It. Prioritise It. Reduce It.</h2>
            <div className="space-y-8">
              {[
                { step: "1", title: "Check Breaches", description: "Start with Have I Been Pwned to check if your email has been compromised. This reveals the breach layer of your exposure.", icon: AlertTriangle },
                { step: "2", title: "Secure Credentials", description: "Change compromised passwords, enable 2FA on critical accounts, and stop reusing passwords and usernames across platforms.", icon: Shield },
                { step: "3", title: "Map Full Exposure with FootprintIQ", description: "Run a FootprintIQ scan to discover the full picture — usernames, data brokers, social profiles, and dark web mentions — then prioritise remediation by risk severity.", icon: Zap },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <span className="text-accent font-bold">{s.step}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Start Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
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
            <RelatedToolsGrid currentPath="/scan-my-online-presence" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
