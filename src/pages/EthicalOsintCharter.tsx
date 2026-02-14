import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, Eye, Ban, Lightbulb, BarChart3, Lock, Users, Briefcase, Newspaper, ShieldCheck, ArrowRight, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const principles = [
  {
    icon: Eye,
    title: "Public Data Only",
    description: "We analyse only publicly accessible information. No private accounts. No hacking. No bypassing privacy controls."
  },
  {
    icon: ShieldCheck,
    title: "Consent-Based Scanning",
    description: "Users initiate scans on themselves or entities they have authority to assess."
  },
  {
    icon: Ban,
    title: "No Data Brokerage",
    description: "We do not sell personal dossiers or monetise personal profiles."
  },
  {
    icon: Lightbulb,
    title: "Exposure Intelligence, Not Exploitation",
    description: "We surface risk so users can make informed privacy decisions."
  },
  {
    icon: BarChart3,
    title: "Probability, Not Identity Claims",
    description: "We use confidence scoring rather than asserting hard identity matches."
  },
  {
    icon: Lock,
    title: "Transparency by Design",
    description: "We clearly explain what we collect, why, and how it is used."
  }
];

const audiences = [
  { icon: Users, label: "Individuals protecting personal privacy" },
  { icon: Newspaper, label: "Journalists and NGOs" },
  { icon: Briefcase, label: "Small businesses" },
  { icon: Shield, label: "Security-conscious professionals" }
];

const faqs = [
  {
    question: "Does FootprintIQ access private accounts?",
    answer: "No. FootprintIQ only analyses publicly available data. We never access private accounts, bypass authentication, or scrape behind logins."
  },
  {
    question: "Is FootprintIQ a data broker?",
    answer: "No. FootprintIQ does not sell personal data, compile dossiers for third parties, or monetise user profiles. We are an exposure intelligence tool designed for self-assessment."
  },
  {
    question: "Do you remove data?",
    answer: "FootprintIQ does not directly remove data from third-party platforms. We identify where exposure exists and provide remediation pathways, including links to official opt-out mechanisms."
  },
  {
    question: "How is this different from DeleteMe or Incogni?",
    answer: "DeleteMe and Incogni focus on automated removal requests to data brokers. FootprintIQ focuses on broader digital exposure mapping — username reuse, breach signals, and public account discovery — giving you visibility before deciding what action to take."
  },
  {
    question: "Is this legal?",
    answer: "Yes. FootprintIQ only accesses publicly available information — the same data anyone can find through search engines and public databases. We follow ethical OSINT principles and never access private systems or bypass security measures."
  }
];

const EthicalOsintCharter = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: "/ethical-osint-charter",
    pageType: "authority",
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Ethical OSINT Charter", item: `${origin}/ethical-osint-charter` }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer }
    }))
  };

  const webPageSchema = buildWebPageSchema({
    name: "Ethical OSINT Charter | FootprintIQ Privacy Framework",
    description: "Learn how FootprintIQ uses public-data OSINT responsibly. Our Ethical Charter explains our privacy-first scanning principles and remediation approach.",
    url: `${origin}/ethical-osint-charter`,
    datePublished: "2026-02-14",
    dateModified: "2026-02-14",
    lastReviewed: "2026-02-14",
  });

  return (
    <>
      <Helmet>
        <title>Ethical OSINT Charter | FootprintIQ Privacy Framework</title>
        <meta name="description" content="Learn how FootprintIQ uses public-data OSINT responsibly. Our Ethical Charter explains our privacy-first scanning principles and remediation approach." />
        <link rel="canonical" href={`${origin}/ethical-osint-charter`} />
        <meta property="og:title" content="Ethical OSINT Charter | FootprintIQ Privacy Framework" />
        <meta property="og:description" content="Learn how FootprintIQ uses public-data OSINT responsibly. Our Ethical Charter explains our privacy-first scanning principles and remediation approach." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/ethical-osint-charter`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={webPageSchema} />

      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main id="main-content">
          {/* Breadcrumb */}
          <div className="max-w-5xl mx-auto px-6 pt-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight className="w-4 h-4" /></BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>Ethical OSINT Charter</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Hero */}
          <section className="py-20 px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
                <Shield className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Privacy-First Intelligence</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                The Ethical OSINT Charter
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                FootprintIQ is built on public-data-only intelligence, consent-based scanning, and responsible risk awareness — never surveillance.
              </p>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors"
              >
                Explore How It Works
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Core Principles */}
          <section className="py-16 px-6 bg-muted/20">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Core Principles</h2>
              <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                Every scan, every analysis, and every report follows these six commitments.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {principles.map((p) => (
                  <Card key={p.title} className="bg-card border-border/50 hover:border-accent/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                        <p.icon className="w-6 h-6 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{p.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Why We Do Not Remove Data */}
          <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Why We Do Not Remove Data</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                FootprintIQ maps digital exposure. We do not directly remove data from third-party platforms. This is an intentional design decision — we believe informed action starts with visibility.
              </p>
              <div className="space-y-4">
                {[
                  "Show where exposure exists across public sources",
                  "Provide remediation pathways and actionable guidance",
                  "Link to official opt-out mechanisms for data brokers",
                  "Enable strategic action based on verified intelligence"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ArrowRight className="w-3 h-3 text-accent" />
                    </div>
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Who It's For */}
          <section className="py-16 px-6 bg-muted/20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-10">Who This Charter Serves</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {audiences.map((a) => (
                  <Card key={a.label} className="bg-card border-border/50">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <a.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="font-medium">{a.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqs.map((f) => (
                  <Card key={f.question} className="bg-card border-border/50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2">{f.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{f.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Internal Links */}
          <section className="py-16 px-6 bg-muted/20">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-8">Learn More</h2>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/how-it-works" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-accent/40 font-medium transition-colors">
                  How FootprintIQ Works
                </Link>
                <Link to="/privacy" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-accent/40 font-medium transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/faq" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-accent/40 font-medium transition-colors">
                  FAQ
                </Link>
                <Link to="/pricing" className="px-6 py-3 rounded-xl bg-card border border-border hover:border-accent/40 font-medium transition-colors">
                  Pricing Plans
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default EthicalOsintCharter;
