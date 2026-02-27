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
  Camera,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Is searching a Snapchat username legal?",
    answer:
      "Yes. Reviewing publicly available information is legal. FootprintIQ does not access private Snapchat content, stories, or messages.",
  },
  {
    question: "Can someone link my Snapchat to other accounts?",
    answer:
      "If you reuse usernames across platforms, it may be possible to connect public profiles together. FootprintIQ helps you understand and reduce that risk.",
  },
  {
    question: "Does FootprintIQ access private Snapchat content?",
    answer:
      "No. FootprintIQ does not access private snaps, stories, messages, or friend lists. It only analyses publicly available information.",
  },
  {
    question: "How do I reduce my Snapchat exposure?",
    answer:
      "By identifying where your username appears publicly and removing or changing exposed accounts. FootprintIQ highlights what needs attention.",
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
    description: "Understand what your Snapchat username reveals across the web",
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
  { icon: UserCheck, label: "Individuals concerned about Snapchat exposure" },
  { icon: Globe, label: "Users who reuse usernames across platforms" },
  { icon: Shield, label: "Privacy-conscious individuals" },
  { icon: AlertTriangle, label: "People checking for impersonation" },
  { icon: Search, label: "Anyone wanting to audit their digital footprint" },
];

export default function SnapchatUsernameSearch() {
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
    name: "FootprintIQ Snapchat Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free Snapchat username search tool to check public profiles and assess digital footprint exposure across publicly indexed sources.",
  };

  return (
    <>
      <SEO
        title="Snapchat Username Search – Check Public Profiles & Digital Exposure | FootprintIQ"
        description="Search a Snapchat username across hundreds of public platforms. Understand your digital exposure, find matching profiles, and reduce your footprint risk. Free, ethical, privacy-first."
        canonical="https://footprintiq.app/snapchat-username-search"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Snapchat Username Search", item: "https://footprintiq.app/snapchat-username-search" },
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
              Snapchat Username Search – Check Public Profiles &amp; Digital Exposure
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Snapchat usernames are commonly reused across other platforms. A single handle can
              link ephemeral messaging accounts to permanent public profiles — often without the
              user realising. FootprintIQ helps you understand that exposure.
            </p>

            <Button size="lg" asChild className="text-lg px-8 py-6 mb-8">
              <Link to="/scan">
                Check Your Exposure Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* What Is a Snapchat Username Search? */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>What Is a Snapchat Username Search?</h2>
            <p>
              A Snapchat username search checks whether a specific handle appears across other
              publicly indexed platforms. While Snapchat is designed around ephemeral content,
              usernames themselves are permanent and often reused on:
            </p>
            <ul>
              <li>Instagram</li>
              <li>Twitter/X</li>
              <li>Reddit</li>
              <li>TikTok</li>
              <li>Gaming platforms</li>
              <li>Forums and communities</li>
            </ul>
            <p>
              This creates potential exposure patterns. FootprintIQ analyses publicly available data
              sources to identify possible cross-platform matches — without accessing private content.
              Running a{" "}
              <Link to="/digital-footprint-scan" className="text-primary underline underline-offset-4 hover:text-primary/80">
                digital footprint scan
              </Link>{" "}
              gives you a comprehensive view of your exposure beyond any single platform.
            </p>

            <h2>Why Snapchat Username Reuse Increases Exposure</h2>
            <p>Reused usernames can:</p>
            <ul>
              <li>Link ephemeral messaging to permanent social profiles</li>
              <li>Reveal old or forgotten accounts</li>
              <li>Increase impersonation risk</li>
              <li>Expose digital history you thought was private</li>
            </ul>
            <p>
              Understanding your digital footprint is the first step toward controlling it.
              FootprintIQ's{" "}
              <Link to="/usernames" className="text-primary underline underline-offset-4 hover:text-primary/80">
                username search tool
              </Link>{" "}
              covers hundreds of public sources in a single scan.
            </p>

            <h2>What You Can Discover</h2>
            <p>Depending on public exposure, a Snapchat username search may reveal:</p>
            <ul>
              <li>Matching social media profiles</li>
              <li>Forum posts and community activity</li>
              <li>Gaming accounts</li>
              <li>Publicly indexed usernames</li>
              <li>Data breach references</li>
            </ul>
            <p>
              The same methodology applies across messaging platforms. For instance, you can run a{" "}
              <Link to="/reddit-username-search" className="text-primary underline underline-offset-4 hover:text-primary/80">
                Reddit username search
              </Link>{" "}
              to check exposure across community-driven platforms.
            </p>

            <h2>Why Check Your Digital Footprint?</h2>
            <p>
              Many people underestimate how searchable they are. Checking your digital footprint
              helps you identify exposed accounts, remove old profiles, reduce impersonation risk,
              and strengthen online security. If you're unsure where to start, our guide on{" "}
              <Link to="/blog/how-to-check-whats-online-about-you" className="text-primary underline underline-offset-4 hover:text-primary/80">
                how to check what's online about you
              </Link>{" "}
              walks through practical steps anyone can follow.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How FootprintIQ Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                The platform does not access private snaps, stories, or bypass platform protections.
                It analyses only publicly available information.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { step: 1, icon: Camera, title: "Enter a Snapchat Username", desc: "Type the handle you want to check. No account or login required." },
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
                      Access private Snapchat content or stories
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
              <h2 className="text-3xl font-bold mb-4">Snapchat Username Search vs Generic Tools</h2>
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
                Common questions about Snapchat username search and digital exposure
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
              Snapchat username search is just one piece of the puzzle.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/usernames" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Username Search <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Search any username across 500+ platforms</p>
                </Card>
              </Link>
              <Link to="/kik-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Kik Username Search <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Check Kik username exposure across public sources</p>
                </Card>
              </Link>
              <Link to="/onlyfans-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    OnlyFans Username Search <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Check OnlyFans username exposure across public sources</p>
                </Card>
              </Link>
              <Link to="/digital-footprint-scan" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Digital Footprint Scan <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">Run a complete scan across all identifiers</p>
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
