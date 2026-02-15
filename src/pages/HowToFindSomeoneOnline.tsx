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
  CheckCircle2,
  ChevronRight,
  Search,
  Mail,
  Shield,
  Globe,
  AlertTriangle,
  Users,
  Eye,
  Lock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/how-to-find-someone-online";

const webPageSchema = buildWebPageSchema({
  name: "How to Find Someone Online – Methods, Ethics & Self-Audit Guide (2026)",
  description:
    "Learn how people can be found online through username searches, email lookups, breach databases, and social media enumeration. Use this knowledge to audit and protect your own exposure.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "How can I find someone's social media accounts?",
    answer:
      "Social media accounts can be found by searching a person's known username across platforms using OSINT tools like Sherlock or FootprintIQ. Most tools check hundreds of platforms simultaneously. However, this should only be done for self-assessment or with the person's explicit consent. FootprintIQ is designed for ethical self-audit — helping you discover your own exposure.",
  },
  {
    question: "How do I find all accounts linked to an email?",
    answer:
      "Email addresses can be checked against breach databases (like Have I Been Pwned) to identify services where the email was registered and subsequently leaked. FootprintIQ's email breach check identifies known breaches, data broker listings, and related exposure — all from a single scan.",
  },
  {
    question: "Is it legal to search for someone online?",
    answer:
      "Searching publicly available information is generally legal. However, using that information for harassment, stalking, employment discrimination without consent, or other harmful purposes is illegal. The most ethical and safest use case is self-assessment — checking what others can find about you.",
  },
  {
    question: "How can I check what's publicly visible about me?",
    answer:
      "The fastest method is to run a digital footprint scan using a tool like FootprintIQ. It checks your username across 500+ platforms, scans breach databases for your email, identifies data broker listings, and provides a prioritised remediation plan. You can also Google yourself, check each social platform manually, and review data broker sites individually — but this takes hours.",
  },
  {
    question: "What is the difference between a people-search site and an OSINT tool?",
    answer:
      "People-search sites (like Spokeo or BeenVerified) aggregate and sell personal data about others. OSINT tools analyse publicly available data for security research, self-assessment, or authorised investigation. FootprintIQ is an OSINT platform designed for self-audit — it helps you understand your own exposure, not look up other people.",
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
    { "@type": "ListItem", position: 2, name: "How to Find Someone Online", item: PAGE_URL },
  ],
};

const methods = [
  {
    icon: Search,
    title: "Username Search",
    description:
      "By searching a known username across hundreds of platforms, you can discover which social media sites, forums, and communities someone uses. Tools like Sherlock, Maigret, and FootprintIQ automate this process.",
    risk: "If someone reuses the same username, a single search can map their entire online presence — from gaming profiles to professional networks.",
    selfAudit: "Run a scan with your own username to see where you appear publicly.",
    link: "/usernames",
  },
  {
    icon: Mail,
    title: "Email Lookup & Breach Checks",
    description:
      "Email addresses can be checked against breach databases to find services where the email was registered. Holehe checks registration status across 100+ sites. Have I Been Pwned reveals breach history.",
    risk: "A single email address can reveal dozens of service registrations and compromised credentials — especially if the same password was reused.",
    selfAudit: "Check your email against breach databases to identify exposed accounts.",
    link: "/email-breach-check",
  },
  {
    icon: Globe,
    title: "Social Media Enumeration",
    description:
      "Social media platforms often reveal public profiles through search functions, friend lists, tagged photos, and location check-ins. Even 'private' accounts may leak information through group memberships or public comments.",
    risk: "Social media aggregation can reveal personal details, daily routines, social connections, and location patterns.",
    selfAudit: "Review your social media privacy settings and audit what's visible to non-friends.",
    link: "/find-social-media-accounts",
  },
  {
    icon: Users,
    title: "Data Broker & People-Search Sites",
    description:
      "Data brokers like Spokeo, BeenVerified, and MyLife aggregate public records, social media data, and commercial databases to create detailed profiles. Many offer free previews that reveal names, addresses, and family connections.",
    risk: "Data brokers compile information you may not realise is public — voter records, property data, court records — into searchable dossiers.",
    selfAudit: "Check major data brokers for your listing and follow opt-out procedures.",
    link: "/data-broker-removal-guide",
  },
  {
    icon: Eye,
    title: "Google & Search Engine Dorking",
    description:
      "Search engines index an enormous amount of personal information. Advanced search operators ('Google dorks') can surface documents, profiles, and data that standard searches miss.",
    risk: "Cached pages, old forum posts, leaked documents, and indexed social profiles remain searchable long after you've forgotten about them.",
    selfAudit: "Search your full name, email, phone number, and usernames on Google to see what appears.",
    link: "/see-what-google-knows-about-you",
  },
];

export default function HowToFindSomeoneOnline() {
  return (
    <>
      <Helmet>
        <title>How to Find Someone Online – Ethics & Self-Audit Guide | FootprintIQ</title>
        <meta
          name="description"
          content="Learn how people can be found online through username searches, email lookups, and social media. Use this knowledge to audit and protect your own digital exposure."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Find Someone Online – Ethics & Self-Audit Guide | FootprintIQ" />
        <meta property="og:description" content="Learn how people can be found online and use this knowledge to audit your own digital exposure." />
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
            <li className="text-foreground font-medium">How to Find Someone Online</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Risk Awareness Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to Find Someone Online: Methods, Risks, and How to Protect Yourself
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Understanding how people are found online is the first step to protecting your own privacy. This guide covers the methods, explains the risks, and shows you how to audit your own exposure.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/scan">
                Check Your Own Exposure <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Ethical Framing */}
        <section className="py-12 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <div className="p-6 rounded-xl border border-accent/20 bg-accent/5">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <h2 className="text-lg font-bold">Important: Ethical Boundaries</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                This guide is written for <strong className="text-foreground">risk awareness and self-audit purposes</strong>. The safest and most ethical use of this information is to understand how <em>you</em> can be found online — and take steps to reduce that exposure. Using these methods to stalk, harass, or profile someone without their consent is illegal and unethical. FootprintIQ is designed for self-assessment and operates under a published{" "}
                <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Methods */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              5 Ways People Are Found Online
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Each method exploits a different type of publicly available data. Understanding them helps you identify — and close — your own exposure gaps.
            </p>

            <div className="space-y-8">
              {methods.map((method) => (
                <div key={method.title} className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <method.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-bold">{method.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{method.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm font-semibold text-destructive mb-1">Risk:</p>
                      <p className="text-sm text-muted-foreground">{method.risk}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-sm font-semibold text-accent mb-1">Self-audit action:</p>
                      <p className="text-sm text-muted-foreground">{method.selfAudit}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to={method.link} className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                      Try this check <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How FootprintIQ Helps */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How FootprintIQ Helps You Understand Your Exposure</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Instead of manually checking each method above, FootprintIQ combines them into a single automated scan. Enter your username, email, or phone number and get a comprehensive exposure report covering:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Username appearances across 500+ platforms with AI confidence scoring",
                "Email breach history from multiple breach databases",
                "Data broker and people-search site exposure",
                "Dark web signal detection for leaked credentials",
                "Prioritised remediation plan with effort estimates and opt-out links",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ is built for <strong className="text-foreground">self-assessment</strong>. It shows you what others can find about you, then helps you reduce that exposure — ethically and transparently. Learn more about our approach on the{" "}
              <Link to="/how-it-works" className="text-accent hover:underline">How It Works</Link> page.
            </p>
          </div>
        </section>

        {/* Protecting Yourself */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How to Protect Yourself</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Once you understand how you can be found, the next step is to reduce your exposure. Here's a practical approach:
            </p>
            <div className="space-y-4">
              {[
                { step: "1", title: "Run a comprehensive scan", desc: "Use FootprintIQ to map your complete digital footprint across all vectors.", link: "/scan" },
                { step: "2", title: "Use unique usernames", desc: "Avoid reusing the same username across platforms. This makes cross-platform correlation much harder.", link: "/username-reuse-risk" },
                { step: "3", title: "Opt out of data brokers", desc: "Submit removal requests to major data brokers. Our guide covers 50+ sites with step-by-step instructions.", link: "/data-broker-removal-guide" },
                { step: "4", title: "Review privacy settings", desc: "Audit the privacy settings on every social media account. Lock down visibility to non-contacts.", link: "/reduce-digital-footprint" },
                { step: "5", title: "Monitor ongoing exposure", desc: "New data appears constantly. Regular scanning catches new exposures before they compound.", link: "/continuous-exposure-monitoring-explained" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-accent">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{item.desc}</p>
                    <Link to={item.link} className="text-xs text-accent hover:underline">Learn more →</Link>
                  </div>
                </div>
              ))}
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

        {/* About */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        <RelatedToolsGrid currentPath="/how-to-find-someone-online" />

        {/* Final CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">See What Others Can Find About You</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Run a free scan to discover your digital exposure across usernames, emails, breach databases, and data brokers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
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
}
