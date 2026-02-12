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
import { Shield, Globe, Link2, Eye, Scale, Search } from "lucide-react";

const PAGE_URL = "https://footprintiq.app/digital-exposure-risk-explained";
const PAGE_TITLE = "What Is Digital Exposure Risk? (Public-Source Intelligence Explained)";
const PAGE_DESCRIPTION =
  "Learn what digital exposure risk means, how data brokers and username reuse increase your visibility, and how ethical OSINT helps you understand your public footprint.";

const faqs = [
  {
    question: "What is digital exposure risk?",
    answer:
      "Digital exposure risk refers to the degree to which your personal information — such as usernames, email addresses, and public profiles — is discoverable through publicly accessible sources. It is not a security breach; it is a measure of visibility.",
  },
  {
    question: "Is digital exposure the same as a data breach?",
    answer:
      "No. A data breach involves unauthorised access to private systems. Digital exposure describes information that is already publicly available — through social media, data brokers, public records, or forum registrations. Both matter, but they require different responses.",
  },
  {
    question: "How do data brokers increase my exposure?",
    answer:
      "Data brokers aggregate publicly available records — voter rolls, property records, social profiles — into searchable databases. This consolidation makes it easier for anyone to correlate information about you, increasing your overall digital visibility.",
  },
  {
    question: "What is username reuse and why does it matter?",
    answer:
      "Username reuse is the practice of using the same handle across multiple platforms. It creates a correlation pattern that allows anyone to link your accounts together, increasing the breadth of your digital exposure. Research suggests the median user has approximately 4.2 platforms linked to a single reused username.",
  },
  {
    question: "What is ethical OSINT?",
    answer:
      "Ethical OSINT (Open Source Intelligence) refers to the responsible collection and analysis of publicly available information. It does not involve accessing private accounts, bypassing authentication, or conducting surveillance. It is used for self-assessment, authorised research, and risk awareness.",
  },
  {
    question: "Can FootprintIQ verify someone's identity?",
    answer:
      "No. FootprintIQ performs observational analysis of publicly available data. It does not verify identity, access private databases, or conduct surveillance. It is designed for exposure awareness and self-assessment only.",
  },
  {
    question: "How can I reduce my digital exposure?",
    answer:
      "Start by understanding where your information appears publicly. Then submit removal requests to data brokers, review privacy settings on social platforms, and reduce username reuse across services. Tools like FootprintIQ help you identify where to focus your efforts.",
  },
  {
    question: "Is monitoring my digital exposure important?",
    answer:
      "Yes. Public information changes over time — new data broker listings appear, old accounts resurface, and breach data circulates. Periodic review helps you stay informed about your current level of public visibility and take action when needed.",
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

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  url: PAGE_URL,
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Digital Exposure Risk Explained", item: PAGE_URL },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: PAGE_URL,
});

const sections = [
  {
    icon: Globe,
    title: "What Is Digital Exposure?",
    content:
      "Digital exposure refers to the extent to which your personal information — names, usernames, email addresses, phone numbers, and public profiles — is discoverable through publicly accessible sources. It is not about what has been stolen or leaked; it is about what is already visible to anyone who looks.",
    detail:
      "Every social media account, forum registration, and public record contributes to your digital exposure. The more identifiers that are publicly associated with you, the easier it becomes for others to build a picture of your online presence.",
  },
  {
    icon: Shield,
    title: "Exposure vs Privacy Breach",
    content:
      "Digital exposure and privacy breaches are related but distinct concepts. A privacy breach occurs when private data is accessed without authorisation — through hacking, insider threats, or system failures. Digital exposure, by contrast, describes information that is already in the public domain.",
    detail:
      "Understanding this distinction matters because the responses are different. Breaches require incident response, password changes, and potentially legal action. Exposure requires awareness, removal requests, and ongoing monitoring of your public footprint.",
  },
  {
    icon: Search,
    title: "How Data Brokers Increase Exposure",
    content:
      "Data brokers collect, aggregate, and sell information compiled from public records, social media, and commercial databases. Sites like Spokeo, MyLife, and BeenVerified consolidate scattered data points into searchable profiles, significantly increasing your overall digital visibility.",
    detail:
      "Research indicates that approximately 89% of data broker entries reference outdated or stale information, yet these listings persist and remain searchable. Submitting removal requests to these services is one of the most effective steps you can take to reduce exposure.",
    link: { to: "/privacy/data-broker-removal-guide", label: "Data broker removal guide →" },
  },
  {
    icon: Link2,
    title: "Username Reuse and Correlation Risk",
    content:
      "Using the same username across multiple platforms creates a correlation pattern — a visibility link between otherwise separate accounts. This is not a security vulnerability in the traditional sense, but it significantly increases the ease with which public information can be connected.",
    detail:
      "FootprintIQ research found that approximately 41% of automated username matches are false positives or unverified correlations, and the median number of public profiles linked to a reused username is 4.2 platforms. Varying your usernames across services reduces this correlation surface.",
  },
  {
    icon: Eye,
    title: "Why Monitoring Matters",
    content:
      "Your digital exposure is not static. New data broker listings appear, old accounts resurface in search results, and breach data circulates across public forums. Without periodic review, you may be unaware of changes to your public visibility.",
    detail:
      "Monitoring does not mean surveillance. It means periodically checking what is publicly associated with your identifiers so you can make informed decisions about removal, privacy settings, and account management.",
    link: { to: "/scan", label: "Check your exposure →" },
  },
  {
    icon: Scale,
    title: "Ethical OSINT: Public-Source Intelligence Only",
    content:
      "OSINT (Open Source Intelligence) is the practice of collecting and analysing information from publicly available sources. Ethical OSINT means doing so responsibly — without accessing private accounts, bypassing authentication, impersonating individuals, or conducting surveillance.",
    detail:
      "FootprintIQ uses ethical OSINT techniques exclusively. All analysis is observational, based on publicly accessible data, and designed for self-assessment and authorised research. No identity verification is performed, and no private databases are accessed.",
    link: { to: "/privacy/google-content-removal", label: "Learn about content removal →" },
  },
];

const DigitalExposureRiskExplained = () => {
  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
      </Helmet>

      <JsonLd data={webPageSchema} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Header />

      <main className="pt-24 pb-20 px-6">
        <article className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Digital Exposure Risk Explained</span>
          </nav>

          {/* Hero */}
          <header className="mb-16">
            <p className="text-sm font-medium uppercase tracking-widest text-primary mb-4">
              Educational Resource
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
              What Is Digital Exposure Risk?
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Digital exposure risk measures how discoverable your information is across public sources.
              Understanding it is the first step to managing your online footprint responsibly.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {["Public-source intelligence only", "Ethical OSINT", "No identity verification"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Sections */}
          <div className="space-y-12">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <section key={i} className="bg-card border border-border/50 rounded-2xl p-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">{section.content}</p>
                  <p className="text-muted-foreground leading-relaxed">{section.detail}</p>
                  {section.link && (
                    <Link
                      to={section.link.to}
                      className="inline-block mt-4 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {section.link.label}
                    </Link>
                  )}
                </section>
              );
            })}
          </div>

          {/* Key Takeaways */}
          <section className="mt-16 bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Key Takeaways</h2>
            <ul className="space-y-3">
              {[
                "Digital exposure measures public visibility, not security breaches.",
                "Data brokers consolidate scattered information into searchable profiles.",
                "Username reuse creates correlation patterns that increase discoverability.",
                "Periodic monitoring helps you stay informed about changes to your public footprint.",
                "Ethical OSINT analyses publicly available data only — no surveillance, no private access.",
                "Understanding your exposure is the foundation of responsible digital privacy management.",
              ].map((point, i) => (
                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Internal Links */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  to: "/privacy/data-broker-removal-guide",
                  title: "Data Broker Removal Guide",
                  desc: "Step-by-step guide to removing your information from data broker sites.",
                },
                {
                  to: "/privacy/google-content-removal",
                  title: "Google Content Removal",
                  desc: "How to request removal of personal information from Google search results.",
                },
                {
                  to: "/scan",
                  title: "Digital Exposure Scanner",
                  desc: "Check where your information appears across public sources.",
                },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="bg-card border border-border/50 hover:border-primary/50 rounded-xl p-6 transition-all duration-200 group"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{link.desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="bg-card border border-border/50 hover:border-accent/50 rounded-xl px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Citation */}
          <div className="mt-16">
            <GuideCitationBlock />
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default DigitalExposureRiskExplained;
