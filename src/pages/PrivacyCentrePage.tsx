import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Shield, FileText, Eye, ArrowRight, Lock, CheckCircle, Zap, ShieldCheck, Ban, UserX, Pencil, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RelatedPrivacyGuides } from "@/components/privacy/RelatedPrivacyGuides";

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

const webPageSchema = buildWebPageSchema({
  name: "Free Data Broker Removal Toolkit | FootprintIQ Privacy Centre",
  description: "Remove your personal data from people-search sites with FootprintIQ's guided removal toolkit. GDPR and CCPA templates, broker detection, and status tracking.",
  url: "https://footprintiq.app/privacy-centre",
});

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
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
        <meta property="og:site_name" content="FootprintIQ" />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webPageSchema} />

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
          <p className="text-sm text-muted-foreground mt-6">
            This removal toolkit is free to use. No automated submissions. No hidden paywalls.
          </p>
        </section>

        {/* Our Approach to Ethical OSINT */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Our Approach to Ethical OSINT</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-5 max-w-2xl">
              FootprintIQ operates within strict ethical boundaries. Every feature on this platform is designed around transparency, user control, and respect for privacy.
            </p>
            <ul className="space-y-2.5">
              {[
                ["Public-source only", "All data is gathered exclusively from publicly accessible sources."],
                ["No private database access", "We never query restricted, proprietary, or non-public databases."],
                ["No impersonation", "We do not misrepresent identity when interacting with any service."],
                ["User-controlled removal workflow", "You review, customise, and submit every removal request yourself."],
                ["Transparency over automation", "We prioritise clear guidance over black-box automation."],
              ].map(([title, desc]) => (
                <li key={title} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="text-muted-foreground"><span className="text-foreground font-medium">{title}.</span> {desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How FootprintIQ Handles Removal */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-4">How FootprintIQ Handles Removal</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            FootprintIQ follows ethical OSINT principles throughout the removal process. We provide tools and guidance — never deception or automation without your knowledge.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit mb-4">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">No Automated Submissions Without Consent</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We never submit removal requests on your behalf without your explicit approval. You review and send every request yourself.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit mb-4">
                <Ban className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">No Scraping Private Data</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ only analyses publicly available information. We never access private accounts, bypass authentication, or scrape restricted content.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit mb-4">
                <UserX className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">No Impersonation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We never impersonate you or misrepresent identity when interacting with data brokers. All templates are transparent and honest.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit mb-4">
                <Pencil className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">User-Controlled Template Generation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You control the content of every removal request. Templates are pre-filled from your identity profile and fully editable before use.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit mb-4">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Transparent Tracking Only</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Status tracking reflects actions you have taken. We do not inject hidden tracking, affiliate links, or third-party analytics into your removal workflow.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 w-fit mb-4">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Ethical OSINT Principles</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ operates within strict ethical boundaries: public data only, correlation-based analysis (not identity confirmation), harm reduction by design, and full transparency about methods and limitations.{" "}
                <Link to="/ethical-osint" className="text-accent hover:underline">Learn more →</Link>
              </p>
            </div>
          </div>
        </section>

        {/* Legal Framework */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Legal Framework</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            The following regulations provide the legal basis for data deletion and de-indexing requests. This is informational context only and does not constitute legal advice.
          </p>
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">GDPR Article 17 — Right to Erasure</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Under EU law, individuals have the right to request deletion of personal data when it is no longer necessary for the purpose it was collected, when consent is withdrawn, or when the data has been unlawfully processed. This also underpins the "Right to Be Forgotten" for search engine de-listing.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">UK GDPR</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                The UK retains equivalent data protection rights through the UK Data Protection Act 2018. UK residents can exercise the right to erasure against data controllers operating in or targeting the UK. The Information Commissioner's Office (ICO) provides enforcement and guidance.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">CCPA / CPRA (California)</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                The California Consumer Privacy Act and its amendment (CPRA) give California residents the right to request deletion of personal information held by businesses. The California Delete Act (SB 362) further requires data brokers to honour deletion requests through a centralised mechanism.
              </p>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">Google Transparency Policy</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Google publishes a Transparency Report detailing the volume and outcomes of content removal requests. Google's policies allow individuals to request de-indexing of URLs containing sensitive personal information, including doxxing content, financial data, and identity documents, regardless of jurisdiction.
              </p>
            </div>
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

        {/* Upgrade for Ongoing Monitoring */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold">Upgrade for Ongoing Monitoring & Tracking</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
              The free toolkit covers discovery and guided removal. For users who want enhanced control over their digital exposure, Pro adds continuous monitoring and management tools.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                "Removal request tracking",
                "Exposure change alerts",
                "Re-scan notifications",
                "Exportable reports",
                "Multi-profile management",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/pricing">
                  Learn More About Pro
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
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

        <div className="max-w-3xl mx-auto px-6">
          <RelatedPrivacyGuides links={[
            { label: "Remove Personal Information from Google", to: "/privacy/google-content-removal" },
            { label: "Data Broker Removal Guide", to: "/privacy/data-broker-removal-guide" },
            { label: "Remove Your Spokeo Listing", to: "/remove-spokeo-profile" },
            { label: "Remove Your Home Address from Google", to: "/how-to-remove-your-address-from-google" },
            { label: "Ethical OSINT Principles", to: "/ethical-osint-principles" },
          ]} />
        </div>

        <GuideCitationBlock />
      </main>

      <Footer />
    </>
  );
}
