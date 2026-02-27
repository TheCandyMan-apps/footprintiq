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
  UserCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Is searching an OnlyFans username legal?",
    answer:
      "Yes, reviewing publicly available information is legal. FootprintIQ does not access private data, paywalled content, or restricted accounts.",
  },
  {
    question: "Can someone link my OnlyFans to other accounts?",
    answer:
      "If usernames are reused across platforms, it may be possible to connect public profiles together. FootprintIQ helps you understand and reduce that risk.",
  },
  {
    question: "How do I reduce my digital footprint?",
    answer:
      "By identifying exposed accounts and removing or anonymising them where possible. FootprintIQ highlights what needs attention and provides guidance.",
  },
  {
    question: "Does FootprintIQ access private OnlyFans content?",
    answer:
      "No. FootprintIQ does not access private OnlyFans content, bypass paywalls, or circumvent account protections. It only analyses publicly available information.",
  },
  {
    question: "Is this tool anonymous?",
    answer:
      "Yes. Searches are processed securely and designed with user privacy in mind. We do not store or sell your search queries.",
  },
];

const differentiators = [
  {
    icon: Target,
    title: "Exposure Awareness",
    description: "Understand what your username reveals across the web",
  },
  {
    icon: Shield,
    title: "Ethical OSINT",
    description: "Public data only — no hacking, scraping, or unauthorised access",
  },
  {
    icon: Zap,
    title: "Privacy-First Analysis",
    description: "Designed for self-audit and defensive use, not surveillance",
  },
  {
    icon: Eye,
    title: "Clear Action Steps",
    description: "Know what to do with the results — not just raw data",
  },
];

const whoShouldUse = [
  { icon: UserCheck, label: "Individuals concerned about digital exposure" },
  { icon: Globe, label: "Content creators" },
  { icon: Shield, label: "Privacy-conscious professionals" },
  { icon: AlertTriangle, label: "People wanting to check impersonation risks" },
  { icon: Search, label: "Anyone reusing usernames across platforms" },
];

export default function OnlyFansUsernameSearch() {
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
    name: "FootprintIQ OnlyFans Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free OnlyFans username search tool to check public profiles and assess digital footprint exposure across publicly indexed sources.",
  };

  return (
    <>
      <SEO
        title="OnlyFans Username Search – Check Public Profiles & Digital Exposure | FootprintIQ"
        description="Search an OnlyFans username across hundreds of public platforms. Understand your digital exposure, find matching profiles, and reduce your footprint risk. Free, ethical, privacy-first."
        canonical="https://footprintiq.app/onlyfans-username-search"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "OnlyFans Username Search", item: "https://footprintiq.app/onlyfans-username-search" },
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
              Free • Public Data Only • No Login Required
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              OnlyFans Username Search – Check Public Profiles &amp; Digital Exposure
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              OnlyFans usernames are often reused across other platforms. A single username can
              connect multiple public accounts together — sometimes unintentionally. FootprintIQ
              helps you understand that exposure.
            </p>

            <Button size="lg" asChild className="text-lg px-8 py-6 mb-8">
              <Link to="/scan">
                Check Your Exposure Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* What Is an OnlyFans Username Search? */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>What Is an OnlyFans Username Search?</h2>
            <p>
              An OnlyFans username search checks whether a specific handle appears elsewhere across
              publicly indexed platforms. Usernames are commonly reused across:
            </p>
            <ul>
              <li>Instagram</li>
              <li>Twitter/X</li>
              <li>Reddit</li>
              <li>TikTok</li>
              <li>Forums</li>
              <li>Older archived accounts</li>
            </ul>
            <p>
              This creates potential exposure patterns. FootprintIQ analyses publicly available data
              sources to identify possible cross-platform matches — without accessing private content.
            </p>

            <h2>Why Username Reuse Can Increase Exposure</h2>
            <p>Reused usernames can:</p>
            <ul>
              <li>Link personal and professional identities</li>
              <li>Reveal old accounts</li>
              <li>Increase impersonation risk</li>
              <li>Expose forgotten digital history</li>
            </ul>
            <p>
              Understanding your digital footprint is the first step toward controlling it.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How FootprintIQ Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                The platform does not bypass paywalls or access private account data.
                It analyses only publicly available information.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { step: 1, icon: Search, title: "Enter a Username", desc: "Type the handle you want to check. No account or login required." },
                { step: 2, icon: Globe, title: "Scan Public OSINT Sources", desc: "Our system queries publicly accessible profile pages across hundreds of platforms." },
                { step: 3, icon: Filter, title: "Identify Potential Matches", desc: "Confidence scoring reduces false positives from common or coincidental username matches." },
                { step: 4, icon: FileText, title: "Highlight Exposure Signals", desc: "Each result includes the platform, profile URL, and confidence level." },
                { step: 5, icon: Shield, title: "Take Action to Reduce Risk", desc: "Use the findings to clean up old accounts, change reused usernames, or tighten privacy settings." },
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

        {/* Who Should Use */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Who Should Use This Tool?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {whoShouldUse.map(({ icon: Icon, label }) => (
                <Card key={label} className="p-5 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical Notice */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Ethical &amp; Legal Notice</h2>
              <p className="text-lg text-muted-foreground">
                FootprintIQ is designed for privacy awareness and defensive use.
              </p>
            </div>
            <Card className="p-8 border-2 border-primary/20">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-3">FootprintIQ does not:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Access private OnlyFans content
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Circumvent account protections
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Hack or scrape restricted data
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    All results are derived from publicly available information.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Run a Free Username Exposure Scan</h2>
            <p className="text-muted-foreground mb-6">
              Find out what your username reveals across the web.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Run a Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/free-scan">
                  Check Your Exposure Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">OnlyFans Username Search vs Generic Tools</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free username tools focus on availability — not exposure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                  Generic Username Tools
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  {["Check only basic social platforms", "Provide limited context", "Focus on availability, not exposure", "No risk scoring or action steps"].map((text) => (
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
                  {["Exposure awareness across hundreds of sources", "Ethical OSINT methodology", "Privacy-first analysis", "Clear action steps for remediation"].map((text) => (
                    <li key={text} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm border-t pt-4">
                  Built as a <strong>digital footprint intelligence platform</strong>, not just a username checker.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {differentiators.map((item, idx) => (
                <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions about OnlyFans username search and digital exposure
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
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Explore More OSINT Tools</h2>
            <p className="text-center text-muted-foreground mb-8">
              OnlyFans username search is just one piece of the puzzle.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/usernames" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Username Search <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Search any username across 500+ platforms
                  </p>
                </Card>
              </Link>
              <Link to="/email-breach-check" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Email Breach Check <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check if your email appears in public data breaches
                  </p>
                </Card>
              </Link>
              <Link to="/digital-footprint-scanner" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Digital Footprint Scanner <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Run a complete scan across all identifiers
                  </p>
                </Card>
              </Link>
              <Link to="/discord-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Discord Username Search <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find accounts linked to a Discord handle
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
