import { Link } from "react-router-dom";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Shield,
  ArrowRight,
  Globe,
  Search,
  Eye,
  Zap,
  Target,
  Filter,
  FileText,
  AlertTriangle,
  Brain,
  Fingerprint,
  Lock,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Is a digital footprint scan safe?",
    answer:
      "Yes. Searches are secure and privacy-focused. FootprintIQ only analyses publicly available data and does not store or sell your search queries.",
  },
  {
    question: "Can I remove my digital footprint completely?",
    answer:
      "Complete removal is difficult, but exposure can often be reduced significantly by deleting old accounts, adjusting privacy settings, and requesting data removal from brokers.",
  },
  {
    question: "Does FootprintIQ store my searches?",
    answer:
      "The platform is built with privacy-first principles. We do not sell or share your search data with third parties.",
  },
  {
    question: "What information does a scan check?",
    answer:
      "A scan checks publicly indexed sources for matching usernames, email addresses, and related metadata across social media, forums, data breach databases, and archived pages.",
  },
  {
    question: "How is this different from Googling myself?",
    answer:
      "FootprintIQ uses structured OSINT methodology to check hundreds of sources systematically, including platforms and databases that standard search engines may not index or surface easily.",
  },
];

const footprintIncludes = [
  { icon: Users, label: "Social media accounts" },
  { icon: Globe, label: "Forum posts" },
  { icon: Fingerprint, label: "Public usernames" },
  { icon: AlertTriangle, label: "Data breach references" },
  { icon: FileText, label: "Archived web pages" },
  { icon: Search, label: "Public domain records" },
  { icon: Brain, label: "Metadata patterns" },
];

const scanBenefits = [
  "Identify exposed accounts",
  "Detect impersonation risk",
  "Discover forgotten profiles",
  "Reduce doxxing exposure",
  "Improve personal cybersecurity",
];

export default function DigitalFootprintScan() {
  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FootprintIQ Digital Footprint Scan",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "GBP",
    },
    description:
      "Free digital footprint scan tool to check what's publicly visible about you online. Ethical OSINT methodology, privacy-first design.",
  };

  return (
    <>
      <SEO
        title="Digital Footprint Scan – Check What's Online About You | FootprintIQ"
        description="Run a free digital footprint scan to discover what's publicly visible about you. Check usernames, emails, and exposed accounts across hundreds of sources. Ethical, privacy-first."
        canonical="https://footprintiq.app/digital-footprint-scan"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Digital Footprint Scan", item: "https://footprintiq.app/digital-footprint-scan" },
            ],
          },
          faq: faqSchema,
          custom: webAppSchema,
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Free • Ethical OSINT • No Login Required
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Digital Footprint Scan – Check What's Online About You
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Every online interaction leaves a trace. Your usernames, email addresses,
              and public profiles form your digital footprint. A scan helps you understand
              what is publicly visible — and what others can discover.
            </p>

            <Button size="lg" asChild className="text-lg px-8 py-6 mb-8">
              <Link to="/scan">
                Check What's Online About You
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* What Is a Digital Footprint? */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">What Is a Digital Footprint?</h2>
            <p className="text-lg text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
              Your digital footprint includes every publicly visible trace of your online activity.
              Many people underestimate how searchable they are.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {footprintIncludes.map(({ icon: Icon, label }) => (
                <Card key={label} className="p-5 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Run a Scan */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Why Run a Digital Footprint Scan?</h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              Digital awareness is a key part of modern online safety.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {scanBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 p-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How FootprintIQ's Scan Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                No private data is accessed. No platform protections are bypassed.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { step: 1, icon: Search, title: "Input a Username or Email", desc: "Enter any identifier you want to check. No account or login required." },
                { step: 2, icon: Globe, title: "Scan Public OSINT Sources", desc: "Our system queries publicly accessible databases and platforms across hundreds of sources." },
                { step: 3, icon: Filter, title: "Identify Exposure Matches", desc: "Confidence scoring reduces false positives and highlights genuine matches." },
                { step: 4, icon: Eye, title: "Clear Exposure Overview", desc: "Results show matched platforms, profile URLs, and confidence levels in a structured report." },
                { step: 5, icon: Shield, title: "Practical Next Steps", desc: "Use findings to clean up accounts, change reused usernames, or tighten privacy settings." },
              ].map(({ step, icon: Icon, title, desc }) => (
                <Card key={step} className="p-6 border-l-4 border-l-primary">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        {title}
                      </h3>
                      <p className="text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* 2026 Risks */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Digital Footprint Risks in 2026</h2>
            <p>
              As AI-powered search improves, digital exposure becomes easier to analyse.
              Username reuse, data breaches, and public metadata can:
            </p>
            <ul>
              <li>Connect identities across platforms</li>
              <li>Reveal behavioural patterns</li>
              <li>Increase social engineering risk</li>
            </ul>
            <p>
              Understanding your footprint is no longer optional. Tools like FootprintIQ provide
              structured, ethical analysis to help you stay ahead of exposure risks. Learn more about{" "}
              <Link to="/what-is-a-digital-footprint" className="text-primary hover:underline">
                what a digital footprint is
              </Link>{" "}
              and{" "}
              <Link to="/how-to-clean-up-your-digital-footprint" className="text-primary hover:underline">
                how to clean yours up
              </Link>.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">FootprintIQ vs Basic Username Checkers</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free tools focus on availability — not exposure analysis.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                  Basic Tools
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  {["Check only limited platforms", "Focus on availability", "No exposure or risk context", "No actionable guidance"].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-destructive mt-1 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 border-2 border-primary/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  FootprintIQ
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  {["Exposure analysis across hundreds of sources", "Structured OSINT methodology", "Privacy-first positioning", "Actionable insight and next steps"].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm border-t pt-4">
                  Built as an <strong>ethical digital footprint intelligence platform</strong>, not a basic checker.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Check Your Digital Footprint Today</h2>
            <p className="text-muted-foreground mb-6">
              Run a free digital footprint scan and understand what's publicly visible.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Check What's Online About You
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/free-scan">
                  Run a Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions about digital footprint scanning and online exposure
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Explore More Tools</h2>
            <p className="text-center text-muted-foreground mb-8">
              A digital footprint scan is just the starting point.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/usernames" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Username Search
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Search a username across 500+ platforms to find matching profiles.
                  </p>
                </Card>
              </Link>
              <Link to="/email-breach-check" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Email Breach Check
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check if your email has appeared in known data breaches.
                  </p>
                </Card>
              </Link>
              <Link to="/digital-footprint-scanner" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    <Fingerprint className="w-4 h-4" />
                    Digital Footprint Scanner
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Deep-dive into your complete online presence and exposure.
                  </p>
                </Card>
              </Link>
              <Link to="/instagram-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Instagram Username Search
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find cross-platform exposure linked to Instagram handles.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
