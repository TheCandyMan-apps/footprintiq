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
import { Shield, FileText, AlertTriangle, CheckCircle, Globe, Scale, ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "How do I remove my profile from Spokeo?",
    answer:
      "Visit Spokeo's opt-out page at spokeo.com/optout, enter the URL of your Spokeo profile, provide your email address, and confirm the removal via the verification email. Your listing should be removed within 3–7 days.",
  },
  {
    question: "Does Spokeo have to delete my data under GDPR?",
    answer:
      "If you are a resident of the EU/EEA or the UK, you have the right to request erasure of your personal data under Article 17 of the GDPR. Spokeo must respond within 30 days. If they fail to comply, you can escalate to your local data protection authority.",
  },
  {
    question: "Can I remove my Spokeo profile under CCPA?",
    answer:
      "Yes. If you are a California resident, the California Consumer Privacy Act (CCPA) grants you the right to request deletion of your personal information. Spokeo is required to honour verified requests within 45 days.",
  },
  {
    question: "Will my Spokeo profile come back after removal?",
    answer:
      "It is possible. Spokeo aggregates data from public records, social networks, and other sources. New data may cause your profile to be re-created over time. Periodic monitoring and re-submission of removal requests may be necessary.",
  },
  {
    question: "What information does Spokeo collect about me?",
    answer:
      "Spokeo may display your name, age, addresses (current and previous), phone numbers, email addresses, social media profiles, relatives, and in some cases employment and education history. All data comes from publicly available sources.",
  },
  {
    question: "How long does Spokeo take to process a removal request?",
    answer:
      "The standard opt-out process typically completes within 3–7 days after email verification. GDPR and CCPA requests have legal deadlines of 30 and 45 days respectively. If you do not receive confirmation, follow up in writing.",
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
  headline: "How to Remove Your Spokeo Profile (Step-by-Step Guide)",
  description:
    "Step-by-step guide to removing your Spokeo listing. Includes GDPR/CCPA template and opt-out instructions.",
  author: {
    "@type": "Organization",
    name: "FootprintIQ",
    url: "https://footprintiq.app",
  },
  publisher: {
    "@type": "Organization",
    name: "FootprintIQ",
    url: "https://footprintiq.app",
  },
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  url: "https://footprintiq.app/remove-spokeo-profile",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
    { "@type": "ListItem", position: 3, name: "Remove Spokeo Profile", item: "https://footprintiq.app/remove-spokeo-profile" },
  ],
};

export default function RemoveSpokeoProfile() {
  return (
    <>
      <Helmet>
        <title>How to Remove Your Spokeo Profile (Step-by-Step Guide)</title>
        <meta
          name="description"
          content="Step-by-step guide to removing your Spokeo listing. Includes GDPR/CCPA template and opt-out instructions."
        />
        <link rel="canonical" href="https://footprintiq.app/remove-spokeo-profile" />
        <meta property="og:title" content="How to Remove Your Spokeo Profile (Step-by-Step Guide)" />
        <meta property="og:description" content="Step-by-step guide to removing your Spokeo listing. Includes GDPR/CCPA template and opt-out instructions." />
        <meta property="og:url" content="https://footprintiq.app/remove-spokeo-profile" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
        <meta property="og:site_name" content="FootprintIQ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Remove Your Spokeo Profile (Step-by-Step Guide)" />
        <meta name="twitter:description" content="Step-by-step guide to removing your Spokeo listing. Includes GDPR/CCPA template and opt-out instructions." />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="max-w-4xl mx-auto px-6 pt-8">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">Remove Spokeo Profile</li>
          </ol>
        </nav>

        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Hero */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              How to Remove Your Spokeo Profile
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              A step-by-step guide to removing your listing from Spokeo.com using the online opt-out form, GDPR, or CCPA requests.
            </p>
          </header>

          {/* Section: What Is Spokeo */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">What Is Spokeo?</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Spokeo is a people-search engine that aggregates publicly available data from social networks, public records, property records, business filings, and other online sources to create detailed personal profiles.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Founded in 2006, Spokeo is one of the most widely used people-search platforms. Profiles may include names, addresses, phone numbers, email addresses, social media accounts, relatives, and estimated demographic information.
              </p>
            </div>
          </section>

          {/* Section: What Data Spokeo Shows */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">What Data Does Spokeo Display?</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                A Spokeo profile may contain some or all of the following publicly sourced information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Full name and known aliases</li>
                <li>Current and previous home addresses</li>
                <li>Phone numbers (landline and mobile)</li>
                <li>Email addresses</li>
                <li>Social media profiles (Facebook, LinkedIn, Instagram, etc.)</li>
                <li>Family members and associates</li>
                <li>Age and estimated date of birth</li>
                <li>Employment and education history (where available)</li>
                <li>Property records and estimated wealth indicators</li>
              </ul>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Spokeo sources this data from publicly accessible records. The accuracy and completeness of profiles varies. FootprintIQ's <Link to="/privacy-centre" className="text-accent hover:underline">Privacy Centre</Link> can help you identify which data brokers hold your information.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Online Opt-Out */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Online Opt-Out Process</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Spokeo provides a self-service opt-out page. Follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>Search for your name on <strong>spokeo.com</strong> and locate your profile.</li>
                <li>Copy the full URL of your Spokeo profile page.</li>
                <li>Visit <strong>spokeo.com/optout</strong> and paste the profile URL.</li>
                <li>Enter your email address — Spokeo will send a verification email.</li>
                <li>Click the confirmation link in the email to complete the opt-out.</li>
                <li>Your listing should be removed within 3–7 days.</li>
              </ol>
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> If you have multiple Spokeo profiles (e.g., for different addresses), you may need to submit separate opt-out requests for each one.
                </p>
              </div>
            </div>
          </section>

          {/* Section: GDPR Removal */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">GDPR Removal Request</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If you are located in the EU, EEA, or UK, the General Data Protection Regulation (GDPR) grants you the right to request erasure of your personal data under Article 17.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Send a written request to Spokeo's privacy team. Include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your full name and the URL of your Spokeo profile</li>
                <li>A clear statement that you are exercising your right to erasure under GDPR Article 17</li>
                <li>Your country of residence</li>
                <li>A request for confirmation of deletion within 30 days</li>
              </ul>

              {/* GDPR Template */}
              <div className="mt-6 p-6 bg-muted/20 rounded-xl border border-border/50">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-accent">GDPR Template</h3>
                <div className="text-sm text-muted-foreground space-y-2 font-mono bg-background/50 p-4 rounded-lg">
                  <p>Subject: GDPR Article 17 — Right to Erasure Request</p>
                  <p className="mt-2">Dear Spokeo Privacy Team,</p>
                  <p className="mt-2">I am writing to exercise my right to erasure under Article 17 of the General Data Protection Regulation (GDPR).</p>
                  <p className="mt-2">I request the immediate deletion of all personal data associated with the following profile:</p>
                  <p className="mt-1 text-accent">[Insert your Spokeo profile URL]</p>
                  <p className="mt-2">My full name is [Your Name] and I am a resident of [Your Country].</p>
                  <p className="mt-2">Please confirm deletion within the statutory 30-day period as required under GDPR.</p>
                  <p className="mt-2">Regards,<br />[Your Name]<br />[Your Email Address]</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  FootprintIQ's <Link to="/privacy-centre" className="text-accent hover:underline">Privacy Centre</Link> can generate a GDPR removal template pre-filled with your details for brokers like Spokeo.
                </p>
              </div>
            </div>
          </section>

          {/* Section: CCPA Removal */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">CCPA Removal Request</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                California residents have the right to request deletion of personal information under the California Consumer Privacy Act (CCPA). Spokeo must process verified requests within 45 days.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your request should include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your full name and profile URL</li>
                <li>A statement that you are a California resident exercising your CCPA rights</li>
                <li>A request to delete all personal information held about you</li>
                <li>A request for written confirmation of deletion</li>
              </ul>

              {/* CCPA Template */}
              <div className="mt-6 p-6 bg-muted/20 rounded-xl border border-border/50">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-accent">CCPA Template</h3>
                <div className="text-sm text-muted-foreground space-y-2 font-mono bg-background/50 p-4 rounded-lg">
                  <p>Subject: CCPA — Request to Delete Personal Information</p>
                  <p className="mt-2">Dear Spokeo Privacy Team,</p>
                  <p className="mt-2">Pursuant to the California Consumer Privacy Act (CCPA), I am requesting the deletion of all personal information you have collected about me.</p>
                  <p className="mt-2">My profile can be found at:</p>
                  <p className="mt-1 text-accent">[Insert your Spokeo profile URL]</p>
                  <p className="mt-2">I am a resident of California and I am exercising my right to deletion under CCPA Section 1798.105.</p>
                  <p className="mt-2">Please confirm deletion within 45 days as required by law.</p>
                  <p className="mt-2">Regards,<br />[Your Name]<br />[Your Email Address]</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: What to Do If Removal Fails */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">What to Do If Removal Fails</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                If your removal request is ignored or denied, you have several escalation options:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>GDPR:</strong> File a complaint with your local Data Protection Authority (DPA).</li>
                <li><strong>CCPA:</strong> Report the violation to the California Attorney General's office.</li>
                <li><strong>Follow up:</strong> Send a second written request referencing your original submission date and any reference numbers.</li>
                <li><strong>Document everything:</strong> Keep copies of all correspondence, screenshots, and timestamps.</li>
              </ul>
            </div>
          </section>

          {/* Section: Ongoing Monitoring */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Ongoing Monitoring</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                People-search sites frequently re-list profiles using newly aggregated public records. After successful removal, consider:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Running periodic scans to check if your information has been re-listed</li>
                <li>Setting up alerts for your name across search engines</li>
                <li>Reviewing other data broker sites that may hold similar information</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ's <Link to="/scan" className="text-accent hover:underline">username scan</Link> can help identify where your information appears across public sources.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
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

          {/* See Also */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/privacy-centre"
                className="group bg-card border border-border/50 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">Privacy Centre</h3>
                    <p className="text-sm text-muted-foreground mt-1">Generate removal templates and track broker opt-outs</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
              <Link
                to="/data-broker-removal-guide"
                className="group bg-card border border-border/50 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">Data Broker Removal Guide</h3>
                    <p className="text-sm text-muted-foreground mt-1">Complete guide to removing data from all major brokers</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            </div>
          </section>

          <GuideCitationBlock />
        </article>
      </main>

      <Footer />
    </>
  );
}
