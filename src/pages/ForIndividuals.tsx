import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Eye, ShieldCheck, BarChart3, Trash2, Bell, Search,
  CheckCircle, Briefcase, Lock, User, ArrowRight, Globe, Shield
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ForIndividuals() {
  const origin = "https://footprintiq.app";

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "For Individuals" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Digital Footprint Protection for Individuals",
    description:
      "Discover what personal data is publicly visible about you, understand your risk, and take control of your digital footprint with FootprintIQ.",
    url: `${origin}/for-individuals`,
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: origin,
    },
    datePublished: "2026-02-24",
    dateModified: "2026-02-24",
    inLanguage: "en",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What can FootprintIQ show me about my digital footprint?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ scans your username, email, and phone across 500+ public platforms, breach databases, and data broker listings. It shows you where your information appears publicly and rates your exposure risk.",
        },
      },
      {
        "@type": "Question",
        name: "Is FootprintIQ safe to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. FootprintIQ only accesses publicly available data. It doesn't scrape private accounts, access dark web sources, or store your data permanently. You control your results and can delete them at any time.",
        },
      },
      {
        "@type": "Question",
        name: "Do I need technical knowledge to use FootprintIQ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ is designed for everyday users. Enter a username or email, and the platform handles everything — scanning, analysis, risk scoring, and prioritised recommendations.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use FootprintIQ before a job interview?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolutely. Many users run a scan before interviews, promotions, or public appearances to understand what a recruiter or employer might find when searching their name or username online.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ help me remove my data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ identifies where your data appears and prioritises what to address first. It provides removal guides, GDPR/CCPA templates, and links to opt-out pages for data brokers through the Privacy Centre.",
        },
      },
    ],
  };

  const highlights = [
    { icon: User, label: "Easy dashboard", desc: "Clean, simple results — no technical jargon or complex charts." },
    { icon: Briefcase, label: "Career-safe checks", desc: "See what employers, recruiters, or colleagues can find about you." },
    { icon: Lock, label: "Personal privacy focus", desc: "Built for self-assessment, not surveillance. Your results, your control." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Digital Footprint Protection for Individuals | FootprintIQ"
        description="Discover what personal data is publicly visible about you, understand your risk, and take control of your digital footprint with FootprintIQ."
        canonical={`${origin}/for-individuals`}
        ogType="website"
        schema={{ organization: organizationSchema, breadcrumbs }}
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <Header />

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Badge */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <User className="w-3 h-3 mr-1" />
              For Individuals
            </Badge>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Digital Footprint Protection for Individuals
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8" />

          <p className="text-xl text-foreground/80 leading-relaxed mb-8">
            Your personal information is scattered across the internet — on social media profiles,
            data broker listings, old forum accounts, and breach databases. Most people don't know
            how much of their life is publicly visible. FootprintIQ helps you find out — and take
            control.
          </p>

          {/* Highlights */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {highlights.map((item) => (
              <div key={item.label} className="p-5 rounded-xl border border-border bg-card text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <Separator className="my-12" />

          {/* ═══ 1. See What's Publicly Exposed ═══ */}
          <section id="exposed-data">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              See What's Publicly Exposed About You
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Enter a username, email address, or phone number and FootprintIQ scans across 500+
              public platforms, social networks, forums, and data broker sites to show you exactly
              where your information appears.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You'll see which platforms have accounts linked to your identity, whether your email
              has been included in known data breaches, and whether data brokers are listing your
              personal details. This is the same information that anyone — employers, scammers,
              or curious strangers — can already find.
            </p>
            <div className="p-5 rounded-xl border border-border bg-muted/20 mb-6">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">How it works:</strong> FootprintIQ only scans
                publicly accessible data. No private accounts are accessed, no passwords are checked,
                and no dark web sources are queried. Learn more about our approach on the{" "}
                <Link to="/trust" className="text-primary hover:underline">Trust & Safety</Link> page.
              </p>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ 2. Identity Risk Score ═══ */}
          <section id="risk-score">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              Understand Your Identity Risk Score
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Raw data isn't enough — you need context. FootprintIQ's LENS (Link & Evidence Network
              System) analyses your scan results and generates a clear risk score that tells you
              how exposed you are and what that exposure means.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Low risk", desc: "Minimal public exposure. Your digital footprint is well controlled." },
                { label: "Moderate risk", desc: "Some accounts or listings are publicly visible. Worth reviewing." },
                { label: "High risk", desc: "Significant exposure across multiple platforms or breach databases." },
                { label: "Critical risk", desc: "Active data broker listings, breached credentials, or identity correlation risks." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Your risk score isn't a judgment — it's a starting point. It helps you understand
              where you stand and what deserves your attention first.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 3. Prioritise What to Fix ═══ */}
          <section id="prioritise">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Prioritise What to Fix First
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Not all exposure is equal. An old forum account from 2012 is less urgent than an
              active data broker listing with your home address. FootprintIQ ranks your findings
              by impact so you can focus on what matters most.
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Severity ranking:</strong> Each finding is classified by potential impact — from informational to critical.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Actionable guidance:</strong> Every result comes with clear next steps — deactivate, opt out, change settings, or monitor.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Career-safe checks:</strong> Run a scan before a job interview, promotion, or public appearance to see what others will find.</span>
              </li>
            </ul>
          </section>

          <Separator className="my-12" />

          {/* ═══ 4. Remove Outdated or Risky Data ═══ */}
          <section id="remove-data">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-primary" />
              Remove Outdated or Risky Data
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Once you know where your information appears, FootprintIQ helps you take action.
              The platform provides direct links to opt-out pages, GDPR and CCPA request templates,
              and step-by-step removal guides for major data brokers.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Data broker opt-outs", desc: "Direct links and instructions for Spokeo, BeenVerified, MyLife, and more." },
                { label: "GDPR / CCPA templates", desc: "Pre-written legal request templates you can send directly to companies." },
                { label: "Account deactivation guides", desc: "Step-by-step instructions for closing accounts on major platforms." },
                { label: "Google removal requests", desc: "Guidance for removing personal information from Google search results." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              For comprehensive removal guidance, visit the{" "}
              <Link to="/privacy-centre" className="text-primary hover:underline">Privacy Centre</Link>{" "}
              — a free toolkit with broker detection, removal tracking, and legal templates.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 5. Monitor Exposure Over Time ═══ */}
          <section id="monitor">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              Monitor Exposure Over Time
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Your digital footprint isn't static. New breaches happen, data brokers re-list
              information, and old accounts resurface. FootprintIQ's monitoring features let you
              track changes over time so you're never caught off guard.
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Periodic re-scans:</strong> Schedule regular scans to catch new exposure as it appears.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Change detection:</strong> See what's new, what's been removed, and what's unchanged since your last scan.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Risk trend tracking:</strong> Watch your risk score improve as you take action on recommendations.</span>
              </li>
            </ul>
          </section>

          <Separator className="my-12" />

          {/* ═══ FAQ ═══ */}
          <section id="faq">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b border-border">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((item) => (
                <details
                  key={item.name}
                  className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors"
                >
                  <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                    {item.name}
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <Separator className="my-12" />

          {/* CTA */}
          <div className="p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border border-primary/20 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Run Your Free Exposure Scan</h3>
            <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
              Enter a username or email address to see what's publicly visible about you.
              No technical knowledge required. Results in under 60 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-medium">
                <Link to="/check-my-digital-footprint">
                  <Globe className="w-4 h-4 mr-2" />
                  Check My Digital Footprint
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/trust">
                  <Shield className="w-4 h-4 mr-2" />
                  How We Protect Your Data
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
