import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  User,
  Globe,
  Search,
  Database,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/after-have-i-been-pwned-what-next";

const webPageSchema = buildWebPageSchema({
  name: "Checked Your Breaches? Here's What To Do Next | FootprintIQ",
  description:
    "Found in a data breach? Learn what to do after Have I Been Pwned — map your full digital exposure, reduce risk, and take control of your privacy.",
  url: PAGE_URL,
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is FootprintIQ a breach checker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ is a digital footprint intelligence platform. While breach data is one signal we consider, our focus is mapping your full public exposure — including username reuse, data broker listings, and public searchability across hundreds of platforms.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need both Have I Been Pwned and FootprintIQ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "They complement each other. Have I Been Pwned tells you which breaches included your email. FootprintIQ maps the broader picture — where your identity is publicly visible, how identifiers connect, and what steps to take to reduce your exposure.",
      },
    },
    {
      "@type": "Question",
      name: "What if I already use Have I Been Pwned?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Great — that means you've completed step one. FootprintIQ picks up where breach checking ends by scanning for username reuse, data broker listings, and public profile visibility. It turns breach awareness into a structured remediation plan.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "After Have I Been Pwned", item: PAGE_URL },
  ],
};

const risks = [
  {
    icon: Mail,
    title: "Email Reuse",
    desc: "The same email across dozens of services means one breach exposes login patterns everywhere.",
  },
  {
    icon: User,
    title: "Username Reuse",
    desc: "A shared username links your profiles across platforms — making it trivial to build a public profile of you.",
  },
  {
    icon: Database,
    title: "Data Broker Exposure",
    desc: "Your name, address, and phone number may already be listed on people-search sites and data brokers.",
  },
  {
    icon: Globe,
    title: "Public Searchability",
    desc: "Search engines index public profiles, forum posts, and mentions — often without your knowledge.",
  },
  {
    icon: Layers,
    title: "Aggregated Profile Risk",
    desc: "Individual data points seem harmless. Combined, they create a detailed identity profile anyone can access.",
  },
];

const steps = [
  {
    step: "01",
    title: "Check Breaches",
    tool: "Have I Been Pwned",
    desc: "Find out which data breaches included your email address. This is awareness — knowing what's already leaked.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    step: "02",
    title: "Secure Passwords + Enable 2FA",
    tool: "Password Manager + Authenticator",
    desc: "Change compromised passwords immediately. Enable two-factor authentication on every account that supports it.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    step: "03",
    title: "Map Your Public Exposure",
    tool: "FootprintIQ",
    desc: "Go beyond breaches. Discover where your username, email, and identity appear publicly — and get a structured plan to reduce that exposure.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

const comparisonRows = [
  { feature: "Primary Focus", hibp: "Breach database lookup", fiq: "Full public exposure mapping" },
  { feature: "Data Sources", hibp: "Single breach index", fiq: "Hundreds of platforms & brokers" },
  { feature: "Approach", hibp: "Reactive — after breach occurs", fiq: "Strategic intelligence layer" },
  { feature: "Username Analysis", hibp: "Not included", fiq: "Cross-platform reuse detection" },
  { feature: "Data Broker Check", hibp: "Not included", fiq: "People-search & broker scanning" },
  { feature: "Remediation Plan", hibp: "Not included", fiq: "Prioritised removal roadmap" },
];

const AfterHaveIBeenPwned = () => {
  return (
    <>
      <Helmet>
        <title>Checked Your Breaches? Here's What To Do Next | FootprintIQ</title>
        <meta
          name="description"
          content="Found in a data breach? Learn what to do after Have I Been Pwned — map your full digital exposure, reduce risk, and take control of your privacy."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Checked Your Breaches? Here's What To Do Next | FootprintIQ" />
        <meta property="og:description" content="Checking breaches is step one. Mapping your full digital footprint is step two." />
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
            <li className="text-foreground font-medium">After Have I Been Pwned</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Beyond Breach Checking</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Found in a Breach?{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Here's What That Means
              </span>{" "}
              — and What To Do Next.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Checking breaches is step one. Mapping your full digital footprint is step two.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/scan">
                Run Your Ethical Footprint Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Why Breaches Are Only Part of the Risk ── */}
        <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Breaches Are Only{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Part of the Risk</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A breach tells you what leaked. It doesn't tell you what's publicly visible right now.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {risks.map((r) => (
                <div
                  key={r.title}
                  className="rounded-xl border border-border/50 bg-card p-6 hover:border-accent/40 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <r.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The 3-Step Digital Risk Flow ── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The 3-Step{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Digital Risk Flow</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                From breach awareness to full exposure intelligence.
              </p>
            </div>

            <div className="space-y-6">
              {steps.map((s, i) => (
                <div
                  key={s.step}
                  className="flex gap-6 items-start rounded-xl border border-border/50 bg-card p-6 md:p-8 hover:border-accent/30 transition-all duration-200"
                >
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <span className={`text-xl font-bold ${s.color}`}>{s.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{s.title}</h3>
                    <p className="text-xs font-medium text-muted-foreground/60 mb-2 uppercase tracking-wider">
                      {s.tool}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                    {i === 2 && (
                      <Button asChild variant="outline" size="sm" className="mt-4">
                        <Link to="/scan">
                          Start Mapping <ArrowRight className="ml-1.5 w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Have I Been Pwned{" "}
                <span className="text-muted-foreground font-normal">vs</span>{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">FootprintIQ</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Different tools, complementary purposes.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              {/* Header */}
              <div className="grid grid-cols-3 bg-muted/40 border-b border-border/50">
                <div className="p-4 text-sm font-semibold text-muted-foreground">Feature</div>
                <div className="p-4 text-sm font-semibold text-center">Have I Been Pwned</div>
                <div className="p-4 text-sm font-semibold text-center text-accent">FootprintIQ</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                    {row.hibp === "Not included" ? (
                      <>
                        <XCircle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-muted-foreground/60">{row.hibp}</span>
                      </>
                    ) : (
                      row.hibp
                    )}
                  </div>
                  <div className="p-4 text-sm text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="font-medium">{row.fiq}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/scan">
                  Map Your Full Exposure <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.acceptedAnswer.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Go Beyond Breach Checking?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover where your identity is publicly visible — and get a plan to reduce it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Ethical Footprint Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AfterHaveIBeenPwned;
