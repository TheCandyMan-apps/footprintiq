import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Shield,
  ArrowRight,
  ChevronRight,
  Eye,
  Lock,
  UserCheck,
  Globe,
  AlertTriangle,
  Heart,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/osint-for-activists-journalists";

const webPageSchema = buildWebPageSchema({
  name: "OSINT for Activists, Journalists & NGOs – How FootprintIQ Helps High-Risk Users | FootprintIQ",
  description:
    "Learn how activists, journalists, whistleblowers, and NGOs use FootprintIQ to assess and reduce their digital exposure safely, ethically, and without surveillance risk.",
  url: PAGE_URL,
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is FootprintIQ safe for activists and journalists?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. FootprintIQ is a consent-based, privacy-first tool designed for self-assessment. It never creates profiles of third parties, never retains scan data beyond the session, and operates under a published Ethical OSINT Charter. It is suitable for high-risk individuals who need to assess their own public exposure.",
      },
    },
    {
      "@type": "Question",
      name: "Can FootprintIQ be used to surveil or stalk someone?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ is designed exclusively for self-assessment and authorised research. Anti-stalking safeguards prevent misuse, and the platform explicitly prohibits looking up other people without their knowledge or consent.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ store my scan results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Scan results are tied to your authenticated session and are not shared with third parties. Free scans are sessionbased. Pro users can optionally save results for trend tracking, but this is always under user control.",
      },
    },
    {
      "@type": "Question",
      name: "How does FootprintIQ help reduce digital risk for journalists?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FootprintIQ scans publicly accessible sources to map where a journalist's personal information appears online — including social media, forums, data broker listings, and breach databases. It then provides a prioritised remediation plan with specific opt-out links and effort estimates to systematically reduce exposure.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "OSINT for Activists & Journalists", item: PAGE_URL },
  ],
};

const useCases = [
  {
    icon: Globe,
    title: "Investigative Journalists",
    description:
      "Journalists working on sensitive stories need to know what adversaries can find about them. FootprintIQ maps public exposure across hundreds of sources, helping reporters identify and close gaps before a story goes live.",
    quote: "Before publishing, I need to know what someone could find about me in retaliation.",
  },
  {
    icon: Heart,
    title: "Human Rights Activists",
    description:
      "Activists in hostile environments face real physical danger from digital exposure. FootprintIQ helps assess which personal details are publicly discoverable and provides a structured plan to reduce them — without requiring technical OSINT training.",
    quote: "My home address appearing on a data broker could put my family at risk.",
  },
  {
    icon: Shield,
    title: "Whistleblowers",
    description:
      "Before or after disclosure, whistleblowers need to understand their digital footprint. FootprintIQ scans for exposed usernames, email addresses, and linked accounts that could connect a pseudonymous identity to a real one.",
    quote: "I needed to know if my anonymous identity could be linked back to me.",
  },
  {
    icon: Lock,
    title: "NGOs & Civil Society Organisations",
    description:
      "Organisations handling sensitive information need to assess staff exposure. FootprintIQ Pro provides structured, consent-based exposure reports for teams — without surveillance, without storing data, and with full transparency.",
    quote: "We assess our team's exposure quarterly to protect both staff and beneficiaries.",
  },
  {
    icon: AlertTriangle,
    title: "Domestic Violence Survivors",
    description:
      "Survivors need to find and remove personal information that could be used to locate them. FootprintIQ identifies data broker listings, old social media accounts, and publicly indexed personal details, then provides specific removal instructions.",
    quote: "I didn't know my old address was still listed on three different websites.",
  },
  {
    icon: UserCheck,
    title: "Privacy Researchers & Academics",
    description:
      "Researchers studying digital exposure, surveillance, or privacy need tools that operate ethically. FootprintIQ's transparent methodology and published charter make it suitable for academic and institutional use.",
    quote: "We use FootprintIQ as a teaching tool for responsible OSINT methodology.",
  },
];

const safeguards = [
  {
    title: "Consent-Based Scanning",
    description: "Every scan requires explicit user initiation. FootprintIQ cannot be used to passively monitor or surveil anyone.",
  },
  {
    title: "No Third-Party Profiling",
    description: "You can only scan yourself or subjects who have given authorised consent. Anti-stalking safeguards are built into the platform.",
  },
  {
    title: "No Data Brokerage",
    description: "FootprintIQ never sells, shares, or monetises personal data. Your scan results are yours alone.",
  },
  {
    title: "Published Ethical Charter",
    description: "All methodologies and ethical boundaries are documented in our Ethical OSINT Charter — fully transparent and publicly accessible.",
  },
  {
    title: "Minimal Data Retention",
    description: "Free scans are session-based. Pro users control their own data retention. Nothing is stored without explicit user consent.",
  },
  {
    title: "Public Data Only",
    description: "FootprintIQ only analyses publicly accessible information. It never accesses private accounts, bypasses authentication, or scrapes paywalled content.",
  },
];

export default function OsintForHighRiskUsers() {
  return (
    <>
      <Helmet>
        <title>OSINT for Activists, Journalists & NGOs | FootprintIQ</title>
        <meta name="description" content="Learn how activists, journalists, whistleblowers, and NGOs use FootprintIQ to assess and reduce their digital exposure safely, ethically, and without surveillance risk." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="OSINT for Activists, Journalists & NGOs | FootprintIQ" />
        <meta property="og:description" content="Privacy-first digital exposure assessment for high-risk individuals and organisations." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
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
            <li className="text-foreground font-medium">OSINT for Activists & Journalists</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy-First OSINT</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Digital Exposure Assessment for{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">High-Risk Users</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Activists, journalists, whistleblowers, and NGOs face real consequences from digital exposure. FootprintIQ helps you assess and reduce your public visibility — safely, ethically, and without surveillance risk.
            </p>
            <p className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-10">
              No technical knowledge required. No data sold. No third-party profiling.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Check Your Exposure <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/ethical-osint-charter">
                  <Eye className="w-4 h-4 mr-2" />
                  Read Our Ethical Charter
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">Why Digital Exposure Matters for High-Risk Groups</h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                For most people, a public social media profile is an inconvenience. For journalists investigating corruption, activists challenging authoritarian regimes, or whistleblowers exposing wrongdoing, it can be a direct threat to their safety and the safety of their families.
              </p>
              <p>
                Adversaries routinely use publicly accessible information to identify, locate, intimidate, or discredit individuals. A home address on a data broker listing, a personal email connected to a professional pseudonym, or an old forum account with identifying details — any of these can be weaponised.
              </p>
              <p>
                FootprintIQ exists to surface these risks before they're exploited. By mapping your digital exposure across hundreds of publicly accessible sources, it provides a clear, prioritised roadmap for reducing your attack surface — without requiring you to become an OSINT expert.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Who Uses FootprintIQ for{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Self-Protection</span>
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Real use cases from privacy-sensitive communities. All scans are self-initiated and consent-based.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {useCases.map((uc) => {
                const Icon = uc.icon;
                return (
                  <div key={uc.title} className="rounded-xl border border-border/50 bg-card p-6 flex flex-col">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{uc.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{uc.description}</p>
                    <blockquote className="text-xs text-muted-foreground/70 italic border-l-2 border-accent/30 pl-3">
                      "{uc.quote}"
                    </blockquote>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Safety Safeguards */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Built-In Safeguards</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              FootprintIQ is designed to be safe for the people who need privacy tools the most.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeguards.map((s) => (
                <div key={s.title} className="rounded-xl border border-border/50 bg-card p-6">
                  <h3 className="font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works for High-Risk Users */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
            <div className="space-y-8">
              {[
                { step: "1", title: "Run a Self-Assessment Scan", description: "Enter your username, email, or phone number. FootprintIQ scans hundreds of publicly accessible sources to map where your information appears." },
                { step: "2", title: "Review Your Exposure Map", description: "See exactly which platforms, data brokers, breach databases, and forums reference your identity. Each finding is scored by risk level and confidence." },
                { step: "3", title: "Follow Your Remediation Plan", description: "Get a prioritised, step-by-step plan with specific actions: opt-out links for data brokers, account deletion instructions, and privacy setting recommendations." },
                { step: "4", title: "Track Progress Over Time", description: "Pro users can re-scan periodically to measure exposure reduction and catch new risks early. Compare before-and-after snapshots to verify that removals worked." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
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
              {[
                { q: "Is FootprintIQ safe for activists and journalists?", a: "Yes. FootprintIQ is a consent-based, privacy-first tool designed for self-assessment. It never creates profiles of third parties, never retains scan data beyond the session (unless you opt in), and operates under a published Ethical OSINT Charter." },
                { q: "Can FootprintIQ be used to surveil or stalk someone?", a: "No. FootprintIQ is designed exclusively for self-assessment and authorised research. Anti-stalking safeguards prevent misuse, and the platform explicitly prohibits looking up other people without their knowledge or consent." },
                { q: "Does FootprintIQ store my scan results?", a: "Free scans are session-based. Pro users can optionally save results for trend tracking, but this is always under user control. Data is never shared with third parties." },
                { q: "Can an adversary see that I ran a scan?", a: "No. FootprintIQ queries publicly accessible sources passively. Running a scan does not notify the platforms being checked, and your scan activity is not visible to anyone else." },
                { q: "Is FootprintIQ free?", a: "Yes. Free scans provide meaningful exposure intelligence for basic self-assessment. Pro plans unlock deeper scanning, trend tracking, and structured remediation roadmaps." },
                { q: "How does FootprintIQ differ from people-search sites?", a: "People-search sites aggregate and sell personal data about others. FootprintIQ is the opposite: it helps you see what's publicly visible about yourself and provides a plan to reduce that exposure. It never sells data." },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.q}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* About Block */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Protect Yourself Before Someone Else Exploits Your Exposure</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Map your digital footprint. Prioritise the risks. Reduce your visibility — on your terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/ethical-osint-charter">Read Our Ethical Charter</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
