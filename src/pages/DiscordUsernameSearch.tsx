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
  AlertCircle,
  Shield,
  ArrowRight,
  Globe,
  Search,
  Eye,
  Zap,
  Target,
  MessageSquare,
  Gamepad2,
  Users,
  Lock,
  FileText,
  Filter,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Is Discord username search legal?",
    answer:
      "Searching publicly available information is legal. FootprintIQ only scans public data sources and does not access private accounts, servers, or messages.",
  },
  {
    question: "Can someone find my real identity from my Discord username?",
    answer:
      "If you reuse usernames across platforms, it is possible that profiles may be linked together publicly. FootprintIQ helps you understand this exposure so you can take action.",
  },
  {
    question: "Does FootprintIQ access private Discord data?",
    answer:
      "No. FootprintIQ does not access private Discord messages, servers, or accounts. It only analyses publicly available information across indexed sources.",
  },
  {
    question: "Can I remove my digital footprint?",
    answer:
      "Yes. Many platforms allow account deletion or data removal. FootprintIQ helps identify what may need attention and provides guidance on reducing your exposure.",
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
    description: "Understand what your Discord username reveals across the web",
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

export default function DiscordUsernameSearch() {
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
    name: "FootprintIQ Discord Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free Discord username search tool to find accounts and assess digital footprint exposure across publicly indexed sources.",
  };

  return (
    <>
      <SEO
        title="Discord Username Search – Find Accounts & Digital Footprint Exposure | FootprintIQ"
        description="Search a Discord username across hundreds of public platforms. Understand your digital exposure, find matching profiles, and take steps to reduce your footprint. Free, ethical, privacy-first."
        canonical="https://footprintiq.app/discord-username-search"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Discord Username Search", item: "https://footprintiq.app/discord-username-search" },
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
              Discord Username Search – Find Accounts & Digital Footprint Exposure
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Your Discord username can reveal more than you think. With the rise of online communities
              and gaming platforms, usernames are often reused across multiple services — creating a
              traceable digital footprint. FootprintIQ helps you understand that exposure.
            </p>

            <Button size="lg" asChild className="text-lg px-8 py-6 mb-8">
              <Link to="/scan">
                Check Your Exposure Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* What Is a Discord Username Search? */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>What Is a Discord Username Search?</h2>
            <p>
              A Discord username search is the process of checking whether a specific Discord handle
              appears across other publicly available platforms. Many users reuse the same username —
              or similar variations — across Instagram, Reddit, TikTok, gaming forums, and developer
              communities.
            </p>
            <p>This can unintentionally expose:</p>
            <ul>
              <li>Personal social media profiles</li>
              <li>Old or forgotten accounts</li>
              <li>Forum activity and public posts</li>
              <li>Data breach references</li>
            </ul>
            <p>
              FootprintIQ scans across hundreds of publicly indexed sources to identify potential
              digital footprint connections linked to a Discord-style username. Running a{" "}
              <Link to="/digital-footprint-scan" className="text-primary underline underline-offset-4 hover:text-primary/80">digital footprint scan</Link>{" "}
              can help you understand the full scope of your exposure beyond a single platform.
            </p>

            <h2>Why Discord Usernames Matter for OSINT</h2>
            <p>
              Open-source intelligence (OSINT) relies on publicly available data. Usernames are
              powerful OSINT identifiers because they are frequently reused, act as cross-platform
              anchors, connect fragmented digital identities, and leave searchable traces.
            </p>
            <p>
              Cybersecurity professionals, privacy-conscious individuals, and digital investigators
              use username analysis to assess exposure risk. FootprintIQ brings that methodology
              into an ethical, privacy-first platform through its{" "}
              <Link to="/usernames" className="text-primary underline underline-offset-4 hover:text-primary/80">username search tool</Link>,
              which covers hundreds of public sources in a single scan.
            </p>

            <h2>What You Can Discover</h2>
            <p>Depending on public exposure, a Discord username search may reveal:</p>
            <ul>
              <li>Matching social media profiles</li>
              <li>Forum posts and community activity</li>
              <li>Old gaming accounts</li>
              <li>Publicly indexed usernames</li>
              <li>Data breach references</li>
              <li>Metadata patterns linking identities</li>
            </ul>
            <p>
              This helps answer the question: <em>"What can someone find about me using just my
              username?"</em> The same methodology applies to other platforms — for example, you can also run a{" "}
              <Link to="/kik-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">Kik username search</Link>{" "}
              to check exposure on messaging apps.
            </p>

            <h2>Why Check Your Digital Footprint?</h2>
            <p>
              Many people underestimate how searchable they are. Checking your digital footprint
              helps you identify exposed accounts, remove old or unused profiles, reduce
              impersonation risk, protect personal privacy, and strengthen online security.
            </p>
            <p>
              Digital exposure is not just a concern for influencers or public figures. It affects
              everyday users. If you're unsure where to start, our guide on{" "}
              <Link to="/blog/how-to-check-whats-online-about-you" className="text-primary underline underline-offset-4 hover:text-primary/80">how to check what's online about you</Link>{" "}
              walks through practical steps anyone can follow.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How FootprintIQ's Discord Username Search Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                The platform does not hack, scrape private data, or bypass platform protections.
                It only analyses publicly available information.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { step: 1, icon: MessageSquare, title: "Enter a Discord Username", desc: "Type the Discord handle you want to check. No account or login required." },
                { step: 2, icon: Globe, title: "FootprintIQ Scans Public Sources", desc: "Our system queries publicly accessible profile pages across hundreds of platforms — the same information anyone could find manually." },
                { step: 3, icon: Filter, title: "Results Are Filtered for Accuracy", desc: "Confidence scoring reduces false positives from common or coincidental username matches." },
                { step: 4, icon: FileText, title: "Exposure Signals Are Highlighted", desc: "Each result includes the platform, profile URL, and confidence level to help you understand your risk." },
                { step: 5, icon: Shield, title: "Take Steps to Reduce Risk", desc: "Use the findings to clean up old accounts, change reused usernames, or tighten privacy settings." },
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

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Run a Free Discord Username Scan</h2>
            <p className="text-muted-foreground mb-6">
              Curious what your username reveals? Run a free scan with FootprintIQ and understand your
              digital exposure in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Check Your Exposure Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/free-scan">
                  Run a Free Username Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Discord vs Generic Tools */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Discord Username Search vs Generic Username Tools</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free username tools check only basic social platforms, provide limited context,
                and focus on availability — not exposure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                  Generic Username Tools
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-destructive mt-1 shrink-0" />
                    <span>Check only basic social platforms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-destructive mt-1 shrink-0" />
                    <span>Provide limited context</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-destructive mt-1 shrink-0" />
                    <span>Focus on availability, not exposure</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-destructive mt-1 shrink-0" />
                    <span>No risk scoring or action steps</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 border-2 border-primary/30">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  FootprintIQ
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Exposure awareness across hundreds of sources</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Ethical OSINT methodology</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Privacy-first analysis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Clear action steps for remediation</span>
                  </li>
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
                Common questions about Discord username search and digital exposure
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
              Discord username search is just one piece of the puzzle.
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
              <Link to="/reverse-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Reverse Username Search <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Find who owns a username across platforms
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
