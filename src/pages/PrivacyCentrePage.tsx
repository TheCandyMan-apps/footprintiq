import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, FileText, Eye, ArrowRight, Lock, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "What is a data broker removal toolkit?",
    answer:
      "A data broker removal toolkit helps you identify which people-search and data broker sites hold your personal information, and provides guided steps — including pre-written GDPR and CCPA templates — to request deletion of your data.",
  },
  {
    question: "Is the Privacy Centre free to use?",
    answer:
      "FootprintIQ's Privacy Centre is available to Pro users. Free users can see a preview of detected brokers and upgrade to access the full removal workflow, including template generation and status tracking.",
  },
  {
    question: "Which data brokers does FootprintIQ cover?",
    answer:
      "FootprintIQ checks a curated list of major people-search and data broker sites including MyLife, Spokeo, BeenVerified, WhitePages, and others. The list is regularly updated as new brokers are identified.",
  },
  {
    question: "Does FootprintIQ submit removal requests automatically?",
    answer:
      "No. FootprintIQ is a guided removal toolkit. It generates pre-filled templates, provides direct links to broker opt-out pages, and tracks your submission status — but you submit the requests yourself to maintain full control.",
  },
  {
    question: "How long does data broker removal take?",
    answer:
      "Processing times vary by broker. Most manual opt-outs are processed within 7–14 days. GDPR requests have a 30-day legal deadline, and CCPA requests must be processed within 45 days.",
  },
  {
    question: "Will my data stay removed permanently?",
    answer:
      "Not always. Data brokers continuously aggregate new records from public sources and may re-list your information over time. FootprintIQ's removal tracker helps you monitor for re-listings so you can submit follow-up requests.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Privacy Centre", item: "https://footprintiq.app/privacy-centre" },
  ],
};

const features = [
  {
    icon: Eye,
    title: "Broker Detection",
    description: "See which people-search sites hold your personal information, categorised by risk level.",
  },
  {
    icon: FileText,
    title: "GDPR & CCPA Templates",
    description: "Generate pre-filled removal request templates using your identity profile — ready to copy and send.",
  },
  {
    icon: CheckCircle,
    title: "Status Tracking",
    description: "Track each removal request through a clear timeline: Submitted → Awaiting → Removed — or flag re-listings.",
  },
  {
    icon: Lock,
    title: "Identity Profile",
    description: "Securely store your details once and reuse them across all broker removal requests.",
  },
];

const brokerGuides = [
  {
    name: "MyLife",
    path: "/remove-mylife-profile",
    description: "Step-by-step opt-out guide with GDPR/CCPA templates",
  },
  {
    name: "Spokeo",
    path: "#",
    description: "Coming soon",
    disabled: true,
  },
  {
    name: "BeenVerified",
    path: "#",
    description: "Coming soon",
    disabled: true,
  },
  {
    name: "WhitePages",
    path: "#",
    description: "Coming soon",
    disabled: true,
  },
];

export default function PrivacyCentrePage() {
  return (
    <>
      <Helmet>
        <title>Free Data Broker Removal Toolkit | FootprintIQ Privacy Centre</title>
        <meta
          name="description"
          content="Remove your personal data from people-search sites with FootprintIQ's guided removal toolkit. GDPR and CCPA templates, broker detection, and status tracking."
        />
        <link rel="canonical" href="https://footprintiq.app/privacy-centre" />
        <meta property="og:title" content="Free Data Broker Removal Toolkit | FootprintIQ Privacy Centre" />
        <meta property="og:description" content="Remove your personal data from people-search sites with FootprintIQ's guided removal toolkit. GDPR and CCPA templates, broker detection, and status tracking." />
        <meta property="og:url" content="https://footprintiq.app/privacy-centre" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Data Broker Removal Toolkit | FootprintIQ Privacy Centre" />
        <meta name="twitter:description" content="Remove your personal data from people-search sites with guided GDPR/CCPA templates and broker opt-out tracking." />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-5xl mx-auto px-6 pt-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">Privacy Centre</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Privacy Centre</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Free Data Broker{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              Removal Toolkit
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            Discover which people-search sites list your personal information, generate GDPR and CCPA removal templates, and track your opt-out requests — all from one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                <Zap className="w-5 h-5" />
                Get Started Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/sample-report">
                View Sample Report
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card border border-border/50 rounded-2xl p-6 hover:border-accent/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 shrink-0">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Broker-Specific Guides */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Broker Removal Guides</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Step-by-step guides for removing your profile from specific data brokers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {brokerGuides.map((guide) => (
              <Link
                key={guide.name}
                to={guide.disabled ? "#" : guide.path}
                className={`group bg-card border border-border/50 rounded-2xl p-6 transition-all duration-300 ${
                  guide.disabled
                    ? "opacity-60 cursor-default"
                    : "hover:border-accent/50 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
                }`}
                onClick={guide.disabled ? (e) => e.preventDefault() : undefined}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">
                      Remove {guide.name} Profile
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                  </div>
                  {!guide.disabled && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="group bg-gradient-card border border-border/50 hover:border-accent/50 rounded-2xl px-8 shadow-sm hover:shadow-[0_0_20px_rgba(0,230,230,0.1)] transition-all duration-300"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-bold text-lg group-hover:text-accent transition-colors">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="bg-gradient-card border border-accent/20 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to take control of your data?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a scan to discover where your information is exposed, then use the Privacy Centre to start removing it.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/auth">
                <Shield className="w-5 h-5" />
                Start Your Free Scan
              </Link>
            </Button>
          </div>
        </section>

        <GuideCitationBlock />
      </main>

      <Footer />
    </>
  );
}
