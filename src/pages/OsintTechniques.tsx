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
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  Mail,
  Shield,
  Target,
  Filter,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/osint-techniques";

const webPageSchema = buildWebPageSchema({
  name: "OSINT Techniques – A Practical Guide to Open Source Intelligence Methods",
  description:
    "Learn the core OSINT techniques used by cybersecurity professionals: passive reconnaissance, username enumeration, email verification, breach correlation, and false-positive filtering.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What are OSINT techniques?",
    answer:
      "OSINT techniques are structured methods for collecting, analysing, and correlating publicly available information. They include passive reconnaissance (observing without interaction), active enumeration (querying platforms for data), breach correlation (cross-referencing leaked databases), and false-positive filtering (validating results for accuracy).",
  },
  {
    question: "What is the difference between passive and active OSINT?",
    answer:
      "Passive OSINT involves observing publicly available information without directly interacting with the target — for example, reading public social media posts or reviewing cached pages. Active OSINT involves querying platforms or services directly, such as checking if a username exists on a specific site. Both are legal when accessing only public data.",
  },
  {
    question: "Is OSINT legal for beginners?",
    answer:
      "Yes, OSINT is legal when you only access publicly available information and do not bypass authentication, hack accounts, or violate terms of service. Beginners should start with self-assessment — scanning their own usernames and email addresses to understand their digital footprint. FootprintIQ provides a guided, ethical way to do this.",
  },
  {
    question: "What are some real-world OSINT examples?",
    answer:
      "Common examples include: checking if your username appears on 500+ platforms (username enumeration), verifying if your email has been in a data breach (breach checking), identifying which data brokers list your personal information, and correlating multiple identifiers to map a complete digital footprint.",
  },
  {
    question: "How does FootprintIQ apply OSINT techniques?",
    answer:
      "FootprintIQ automates multiple OSINT techniques in a single scan: username enumeration across 500+ platforms, email breach detection, data broker scanning, and dark web signal detection. It then applies AI-powered false-positive filtering (LENS) and risk scoring to deliver accurate, prioritised results with actionable remediation guidance.",
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
    { "@type": "ListItem", position: 2, name: "OSINT Techniques", item: PAGE_URL },
  ],
};

const techniques = [
  {
    icon: EyeOff,
    title: "Passive Reconnaissance",
    description:
      "Passive reconnaissance involves gathering information without directly interacting with the target. This includes reviewing publicly accessible social media profiles, reading cached web pages, analysing public records, and examining metadata from publicly shared documents.",
    examples: [
      "Reviewing a public LinkedIn profile for job history and connections",
      "Checking Google's cache for deleted web pages",
      "Examining EXIF data from publicly shared photos",
      "Reading public forum posts and comments",
    ],
    ethical:
      "Passive techniques are the safest form of OSINT because they don't create any interaction with the target. However, the information found should still be handled responsibly and never used for harassment or unauthorised profiling.",
  },
  {
    icon: Eye,
    title: "Active Enumeration",
    description:
      "Active enumeration involves querying platforms and services to discover where a specific identifier (username, email, phone number) is registered or publicly visible. This is more targeted than passive observation and produces structured results.",
    examples: [
      "Checking if a username exists on 500+ social media platforms",
      "Querying breach databases for a specific email address",
      "Checking email registration status across services (e.g., Holehe)",
      "Searching data broker sites for personal information listings",
    ],
    ethical:
      "Active enumeration only checks publicly accessible registration data. It does not log into accounts, bypass authentication, or access private content. FootprintIQ's multi-tool pipeline automates this across multiple engines simultaneously.",
  },
  {
    icon: Mail,
    title: "Email Intelligence",
    description:
      "Email intelligence techniques focus on what can be learned from an email address alone. This includes breach history, platform registrations, associated accounts, and whether the email appears in data broker databases.",
    examples: [
      "Checking Have I Been Pwned for breach exposure",
      "Identifying which platforms an email is registered on",
      "Cross-referencing email with username findings for correlation",
      "Discovering data broker listings that include the email",
    ],
    ethical:
      "Email intelligence should only be performed on your own email addresses or with explicit authorisation. FootprintIQ's email breach checks are designed for self-assessment and authorised security audits.",
  },
  {
    icon: Target,
    title: "Breach Correlation",
    description:
      "Breach correlation is the process of cross-referencing findings from multiple OSINT techniques to identify patterns and amplified risks. A username found on 50 platforms combined with breach data for the associated email creates a much clearer risk picture than either finding alone.",
    examples: [
      "Correlating username exposure with email breach history",
      "Mapping credential reuse patterns across platforms",
      "Identifying which breached accounts share passwords",
      "Connecting data broker listings with social media presence",
    ],
    ethical:
      "Breach correlation reveals how different pieces of public data combine to create exposure risk. FootprintIQ performs this automatically, producing a unified risk score and prioritised remediation plan.",
  },
  {
    icon: Filter,
    title: "False-Positive Filtering",
    description:
      "Raw OSINT tools produce significant noise — reporting profiles that don't actually belong to the target, flagging dead links, or returning generic matches. False-positive filtering uses contextual analysis and AI to separate genuine findings from noise.",
    examples: [
      "Removing username matches on platforms where the profile belongs to someone else",
      "Filtering out 404 or deleted page results",
      "Validating that breach data actually corresponds to the target email",
      "Using AI confidence scoring to rank findings by reliability",
    ],
    ethical:
      "Accuracy is an ethical imperative in OSINT. Reporting false positives can lead to incorrect risk assessments and unnecessary anxiety. FootprintIQ's LENS system applies AI-powered confidence scoring to every finding.",
  },
];

export default function OsintTechniques() {
  return (
    <>
      <Helmet>
        <title>OSINT Techniques – A Practical Guide for Beginners & Professionals | FootprintIQ</title>
        <meta
          name="description"
          content="Learn the core OSINT techniques used by cybersecurity professionals: passive reconnaissance, username enumeration, email verification, breach correlation, and false-positive filtering."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="OSINT Techniques – A Practical Guide | FootprintIQ" />
        <meta property="og:description" content="Learn the core OSINT techniques: passive recon, username enumeration, breach correlation, and false-positive filtering." />
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
            <li className="text-foreground font-medium">OSINT Techniques</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">OSINT Methodology</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              OSINT Techniques: A Practical Guide to Open Source Intelligence
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              From passive reconnaissance to AI-powered false-positive filtering — understand the techniques that cybersecurity professionals use to map digital exposure, and how to apply them ethically.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Try These Techniques <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/what-is-osint">What Is OSINT?</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Understanding OSINT Methodology</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Open Source Intelligence (OSINT) is a structured methodology — not just a set of tools. It follows a process of collection, processing, analysis, and reporting to transform raw public data into actionable intelligence.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              The techniques below represent the core pillars of modern OSINT practice. Each can be performed manually using CLI tools, or automated through platforms like <Link to="/best-osint-tools" className="text-accent hover:underline">FootprintIQ</Link> that combine multiple techniques in a single scan.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're a <strong className="text-foreground">cybersecurity professional</strong> conducting authorised assessments, an <strong className="text-foreground">OSINT beginner</strong> learning the methodology, or an <strong className="text-foreground">everyday user</strong> wanting to audit your own digital footprint — understanding these techniques helps you make informed decisions about your online privacy.
            </p>
          </div>
        </section>

        {/* Techniques */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Core OSINT Techniques</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Each technique serves a specific purpose in the intelligence pipeline. Together, they provide a comprehensive picture of digital exposure.
            </p>

            <div className="space-y-8">
              {techniques.map((tech) => (
                <div key={tech.title} className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <tech.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold">{tech.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{tech.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-muted-foreground/80 mb-2">Real-world examples:</p>
                    <ul className="space-y-1.5">
                      {tech.examples.map((ex) => (
                        <li key={ex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Search className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border border-accent/20 bg-accent/5">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-accent">Ethical note:</span> {tech.ethical}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How FootprintIQ Applies These Techniques */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-3xl font-bold">How FootprintIQ Applies These Techniques</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              FootprintIQ automates the entire OSINT pipeline — from passive data collection to AI-powered analysis — in a single scan. Here's how:
            </p>
            <ul className="space-y-4">
              {[
                "Multi-engine username enumeration across 500+ platforms, combining results from Sherlock, Maigret, WhatsMyName, and proprietary checks",
                "Email breach detection referencing aggregated breach databases for exposure history",
                "Data broker scanning to identify where your personal information is listed for sale",
                "Dark web signal detection for mentions in publicly referenced breach data",
                "AI-powered false-positive filtering (LENS) with confidence scoring for every finding",
                "Risk scoring and prioritised remediation guidance based on exposure severity",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed mt-6">
              Learn more about our methodology in the <Link to="/how-it-works" className="text-accent hover:underline">How It Works</Link> guide, or review our <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.
            </p>
          </div>
        </section>

        {/* Getting Started */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">OSINT for Beginners: Where to Start</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              If you're new to OSINT, start with self-assessment. Scan your own username and email to understand what information is publicly available about you. This builds practical understanding of the techniques while providing immediately useful insights.
            </p>
            <div className="p-6 rounded-xl border border-accent/20 bg-accent/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Important: Always stay ethical</p>
                  <p className="text-sm text-muted-foreground">
                    Only scan your own information or information you have explicit authorisation to investigate. Never use OSINT techniques for harassment, stalking, or unauthorised surveillance. Review our{" "}
                    <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> for detailed guidelines.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <RelatedToolsGrid currentPath="/osint-techniques" />
          </div>
        </section>

        {/* About FootprintIQ */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Apply These Techniques to Your Own Exposure</h2>
            <p className="text-lg text-muted-foreground mb-8">
              FootprintIQ automates OSINT techniques in a single, ethical scan. Discover what's publicly visible about you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
