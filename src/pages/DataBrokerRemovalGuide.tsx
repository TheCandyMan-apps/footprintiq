import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, FileText, AlertTriangle, CheckCircle, ArrowRight, Scale, Globe, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is a data broker?",
    answer:
      "A data broker is a company that collects, aggregates, and sells personal information from public records, social media, purchase histories, and other sources. Examples include Spokeo, MyLife, BeenVerified, and Whitepages. They profit by selling your data to advertisers, employers, landlords, and sometimes scammers.",
  },
  {
    question: "Is it legal to request data broker removal?",
    answer:
      "Yes. Under GDPR (for EU/UK residents) and CCPA/CPRA (for California residents), you have the legal right to request deletion of your personal data. Many other jurisdictions have similar consumer privacy laws. Data brokers are legally obligated to honour valid removal requests.",
  },
  {
    question: "How long does data broker removal take?",
    answer:
      "Most data brokers process removal requests within 30–45 days. Some respond within a few days, while others may take longer. GDPR requires a response within 30 days, and CCPA within 45 days. If a broker doesn't comply, you can escalate to the relevant data protection authority.",
  },
  {
    question: "Will my data come back after removal?",
    answer:
      "Unfortunately, yes — many data brokers re-list profiles over time as they ingest new public records. This is why periodic monitoring and re-submission of removal requests is important. FootprintIQ's Privacy Centre helps you track and manage ongoing removal efforts.",
  },
  {
    question: "Can I remove my data from all brokers at once?",
    answer:
      "There's no single request that covers all brokers. Each data broker has its own opt-out process. However, tools like FootprintIQ's Privacy Centre can help you identify which brokers hold your data and generate GDPR/CCPA removal templates to streamline the process.",
  },
  {
    question: "What information do I need to submit a removal request?",
    answer:
      "Typically, you'll need your full name, email address, and the URL of your profile on the broker's site. For GDPR requests, you may need to verify your identity. For CCPA requests, California residency may need to be confirmed. FootprintIQ's templates pre-fill most of this for you.",
  },
  {
    question: "Is FootprintIQ a data broker removal service?",
    answer:
      "FootprintIQ is not a removal service — it's a digital footprint intelligence platform. We help you discover where your data is exposed across data brokers and provide free tools, templates, and guides to help you submit removal requests yourself.",
  },
  {
    question: "What's the difference between GDPR and CCPA removal requests?",
    answer:
      "GDPR applies to EU/UK residents and provides the right to erasure under Article 17. CCPA/CPRA applies to California residents and grants the right to delete personal information. Both require the broker to comply, but the legal basis, timelines, and enforcement mechanisms differ.",
  },
  {
    question: "How many data brokers have my information?",
    answer:
      "The average person's data appears on 30–50 data broker sites. Power users, professionals, and public figures may appear on 100 or more. Running a digital footprint scan can help identify which brokers currently hold your data.",
  },
  {
    question: "What happens if a data broker ignores my removal request?",
    answer:
      "If a broker fails to respond within the legally required timeframe (30 days for GDPR, 45 days for CCPA), you can file a complaint with the relevant data protection authority — such as the ICO in the UK or the California Attorney General in the US. Document all correspondence for your records.",
  },
  {
    question: "Do I need a lawyer to remove my data from brokers?",
    answer:
      "No. Most data broker removal requests can be submitted directly by the individual. GDPR and CCPA provide standardised rights that do not require legal representation. Free templates — like those in FootprintIQ's Privacy Centre — can help you draft compliant requests.",
  },
  {
    question: "Are data brokers the same as people-search sites?",
    answer:
      "People-search sites are a category of data broker. They specialise in aggregating personal records into searchable profiles. Other types of data brokers may focus on marketing data, financial data, or behavioural data. The removal process varies by category.",
  },
  {
    question: "Can I opt out of data collection before it happens?",
    answer:
      "Some jurisdictions allow you to opt out of future data collection. Under CCPA, you can submit a 'Do Not Sell My Personal Information' request. Under GDPR, you can object to processing. However, most brokers collect data from public records, which may not be preventable.",
  },
  {
    question: "Is data broker removal free?",
    answer:
      "Submitting removal requests directly to brokers is free. Some paid services automate the process across many brokers at once. FootprintIQ provides free GDPR and CCPA removal templates and step-by-step guides to help you handle removals yourself at no cost.",
  },
  {
    question: "How do data brokers get my information in the first place?",
    answer:
      "Data brokers collect information from public records (voter registrations, property records, court filings), social media profiles, marketing databases, loyalty programmes, and data purchased from other companies. Much of this data is publicly accessible.",
  },
  {
    question: "Should I remove my data from brokers if I have nothing to hide?",
    answer:
      "Data broker exposure increases risk regardless of whether you have sensitive information. Aggregated personal data can be used for targeted phishing, identity theft, social engineering, or unwanted contact. Reducing your exposure is a proactive security measure.",
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
    { "@type": "ListItem", position: 2, name: "Data Broker Removal Guide", item: "https://footprintiq.app/data-broker-removal-guide" },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Complete Guide to Data Broker Removal (GDPR & CCPA)",
  description: "Learn how to remove your personal data from data broker websites. Step-by-step guide with GDPR and CCPA templates.",
  author: { "@type": "Organization", name: "FootprintIQ" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  url: "https://footprintiq.app/data-broker-removal-guide",
};

const DataBrokerRemovalGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Helmet>
        <title>Complete Guide to Data Broker Removal (GDPR &amp; CCPA)</title>
        <meta
          name="description"
          content="Learn how to remove your personal data from data broker websites. Step-by-step guide with GDPR and CCPA templates."
        />
        <link rel="canonical" href="https://footprintiq.app/data-broker-removal-guide" />
        <meta property="og:title" content="Complete Guide to Data Broker Removal (GDPR & CCPA)" />
        <meta property="og:description" content="Learn how to remove your personal data from data broker websites. Step-by-step guide with GDPR and CCPA templates." />
        <meta property="og:url" content="https://footprintiq.app/data-broker-removal-guide" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
        <meta property="og:site_name" content="FootprintIQ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Complete Guide to Data Broker Removal (GDPR & CCPA)" />
        <meta name="twitter:description" content="Learn how to remove your personal data from data broker websites. Step-by-step guide with GDPR and CCPA templates." />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="pt-24 pb-20 px-6">
        <article className="max-w-4xl mx-auto">
          {/* Hero */}
          <header className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Complete Guide to{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Data Broker Removal
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Learn how to find and remove your personal information from data broker websites using GDPR and CCPA rights. Free templates and step-by-step instructions.
            </p>
          </header>

          {/* What Are Data Brokers */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">What Are Data Brokers?</h2>
            </div>
            <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Data brokers are companies that collect, aggregate, and sell personal information about individuals. They harvest data from public records, social media profiles, online purchases, loyalty programmes, and other publicly accessible sources to build detailed profiles.
              </p>
              <p>
                These profiles are sold to advertisers, employers, landlords, insurance companies, and sometimes bad actors. Common data brokers include <strong>Spokeo</strong>, <strong>MyLife</strong>, <strong>BeenVerified</strong>, <strong>Whitepages</strong>, <strong>PeopleFinder</strong>, and <strong>Radaris</strong>.
              </p>
              <p>
                The data broker industry is estimated to be worth over $250 billion globally. Your personal information — name, address, phone number, email, employment history, and even estimated income — may be listed on dozens of broker sites without your knowledge.
              </p>
            </div>
          </section>

          {/* Why Removal Matters */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Why Data Broker Removal Matters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Identity Theft Prevention", desc: "Data brokers expose personal details that scammers use for social engineering, phishing, and identity fraud." },
                { title: "Reduced Spam & Robocalls", desc: "Removing your phone number and email from broker databases significantly reduces unwanted contact." },
                { title: "Employment & Reputation", desc: "Inaccurate broker profiles can affect background checks, employment screening, and personal reputation." },
                { title: "Personal Safety", desc: "Exposed home addresses and family connections can pose real safety risks, especially for at-risk individuals." },
              ].map((item) => (
                <div key={item.title} className="bg-card border border-border/50 rounded-2xl p-6">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Step-by-Step Removal */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Step-by-Step Removal Process</h2>
            </div>
            <div className="space-y-6">
              {[
                { step: 1, title: "Identify Where You're Listed", desc: "Use FootprintIQ's Privacy Centre to scan for your personal data across known data broker sites. This gives you a clear picture of your exposure." },
                { step: 2, title: "Document Your Profiles", desc: "Take screenshots and note the URLs of every broker profile that contains your information. This evidence is useful for GDPR/CCPA requests." },
                { step: 3, title: "Submit Removal Requests", desc: "Use the broker's opt-out page, or send a formal GDPR Article 17 or CCPA deletion request. FootprintIQ's Privacy Centre provides pre-filled templates for both." },
                { step: 4, title: "Follow Up & Verify", desc: "After 30–45 days, check whether your profile has been removed. If not, escalate to the data protection authority in your jurisdiction." },
                { step: 5, title: "Monitor Ongoing Exposure", desc: "Data brokers frequently re-list profiles. Schedule periodic checks using FootprintIQ to catch new listings early." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 bg-card border border-border/50 rounded-2xl p-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Your Legal Rights */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Scale className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Your Legal Rights: GDPR & CCPA</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-3">GDPR (EU/UK)</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Right to erasure under Article 17</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> 30-day response deadline</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Right to lodge complaint with DPA</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Applies regardless of broker location</li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-2xl p-6">
                <h3 className="font-semibold text-lg mb-3">CCPA / CPRA (California)</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Right to delete personal information</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> 45-day response deadline</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> Right to opt out of data sales</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" /> CA Attorney General enforcement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Common Brokers */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Broker-Specific Removal Guides</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Each data broker has a different opt-out process. Use these step-by-step guides to remove your profile from specific platforms:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/remove-mylife-profile"
                className="group bg-card border border-border/50 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">Remove MyLife Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">Manual opt-out, GDPR, and CCPA methods</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
              <Link
                to="/remove-spokeo-profile"
                className="group bg-card border border-border/50 hover:border-accent/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,230,230,0.1)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">Remove Spokeo Profile</h3>
                    <p className="text-sm text-muted-foreground mt-1">Coming soon — opt-out guide in progress</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            </div>
          </section>

          {/* Estimated Timelines */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Expected Removal Timelines</h2>
            </div>
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-semibold">Broker</th>
                    <th className="text-left p-4 font-semibold">Method</th>
                    <th className="text-left p-4 font-semibold">Typical Timeline</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/30"><td className="p-4">MyLife</td><td className="p-4">Manual opt-out / GDPR</td><td className="p-4">7–30 days</td></tr>
                  <tr className="border-b border-border/30"><td className="p-4">Spokeo</td><td className="p-4">Online opt-out</td><td className="p-4">3–7 days</td></tr>
                  <tr className="border-b border-border/30"><td className="p-4">BeenVerified</td><td className="p-4">Online opt-out</td><td className="p-4">24 hours – 7 days</td></tr>
                  <tr className="border-b border-border/30"><td className="p-4">Whitepages</td><td className="p-4">Online opt-out</td><td className="p-4">24–48 hours</td></tr>
                  <tr><td className="p-4">Radaris</td><td className="p-4">Email request</td><td className="p-4">7–30 days</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16">
            <div className="bg-gradient-card border border-accent/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Start Your Removal Process</h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Use FootprintIQ's Privacy Centre to discover which data brokers hold your information and generate removal request templates for free.
              </p>
              <Link
                to="/privacy-centre"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Open Privacy Centre
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
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
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default DataBrokerRemovalGuide;
