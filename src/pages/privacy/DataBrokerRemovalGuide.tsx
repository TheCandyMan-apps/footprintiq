import { Helmet } from "react-helmet-async";
import { RemovalIsOneStep } from "@/components/privacy/RemovalIsOneStep";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Shield, Database, Globe, AlertTriangle, Search, ArrowRight, Users, BarChart3 } from "lucide-react";
import { RelatedPrivacyGuides } from "@/components/privacy/RelatedPrivacyGuides";

const faqs = [
  {
    question: "What is a data broker?",
    answer: "A data broker is a company that collects, aggregates, and sells personal information from public records, social media, commercial databases, and other sources. They create public-facing profile pages that appear in search engine results, often without the individual's knowledge or consent.",
  },
  {
    question: "How do I find out which data brokers have my information?",
    answer: "You can search your name, email address, or phone number on major data broker websites such as Spokeo, Whitepages, Radaris, and BeenVerified. A username or email exposure scan can also help identify where your information appears across public sources.",
  },
  {
    question: "Is data broker removal free?",
    answer: "Most data brokers offer free opt-out processes, though they vary in complexity. Some require email verification, identity confirmation, or postal mail requests. Automated removal services charge a fee but handle the process on your behalf across multiple brokers simultaneously.",
  },
  {
    question: "How long does data broker removal take?",
    answer: "Processing times vary by broker. Some honour removal requests within 24–72 hours, while others take 30–45 days. Certain brokers may require follow-up requests if they re-acquire your data from updated public records.",
  },
  {
    question: "Do data brokers re-list my information after removal?",
    answer: "Yes, many data brokers periodically refresh their databases from public records and commercial sources. Your information may reappear weeks or months after removal. Ongoing monitoring and periodic re-submission of removal requests is recommended.",
  },
  {
    question: "Can I remove my information from all data brokers at once?",
    answer: "There is no single mechanism to remove your information from all data brokers simultaneously. Each broker has its own opt-out process. Automated services can submit requests to multiple brokers in parallel, but complete removal requires addressing each broker individually.",
  },
  {
    question: "Does removing data broker listings improve my Google search results?",
    answer: "Yes. Data broker profile pages are frequently indexed by Google. When you remove your listing from a broker, the source page is deleted, and Google will eventually drop the result from its index. This is one of the most effective ways to reduce personal information in search results.",
  },
  {
    question: "Are data brokers legal?",
    answer: "Data brokers operate legally in most jurisdictions by aggregating publicly available information. However, regulations like GDPR (EU/UK) and CCPA (California) give individuals the right to request deletion of their personal data. The legality of specific practices varies by jurisdiction.",
  },
  {
    question: "What information do data brokers typically collect?",
    answer: "Data brokers commonly collect names, addresses, phone numbers, email addresses, age, relatives, employment history, property records, court records, and social media profiles. Some also aggregate financial indicators and purchasing behaviour data.",
  },
  {
    question: "Should I use an automated removal service or do it myself?",
    answer: "DIY removal is free but time-consuming, especially across dozens of brokers. Automated services save time and provide ongoing monitoring, but charge a recurring fee. The best approach depends on how many brokers hold your data and how much time you can dedicate to the process.",
  },
];

const faqSchema = {
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

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "The Complete Guide to Removing Your Information from Data Brokers",
  description:
    "Learn how to remove your personal information from data broker websites. Step-by-step guidance for US, UK, and EU residents.",
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
  mainEntityOfPage: "https://footprintiq.app/privacy/data-broker-removal-guide",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Privacy", item: "https://footprintiq.app/privacy-centre" },
    { "@type": "ListItem", position: 3, name: "Data Broker Removal Guide", item: "https://footprintiq.app/privacy/data-broker-removal-guide" },
  ],
};

const webPageSchema = buildWebPageSchema({
  name: "Complete Data Broker Removal Guide (2026 Edition)",
  description: "Learn how to remove your personal information from data broker websites. Step-by-step guidance for US, UK, and EU residents.",
  url: "https://footprintiq.app/privacy/data-broker-removal-guide",
});

const DataBrokerRemovalGuide = () => {
  return (
    <>
      <Helmet>
        <title>Complete Data Broker Removal Guide (2026 Edition) | FootprintIQ</title>
        <meta
          name="description"
          content="Learn how to remove your personal information from data broker websites. Step-by-step guidance for US, UK, and EU residents."
        />
        <link rel="canonical" href="https://footprintiq.app/privacy/data-broker-removal-guide" />
        <meta property="og:title" content="Complete Data Broker Removal Guide (2026 Edition)" />
        <meta
          property="og:description"
          content="Step-by-step guide to removing personal information from data broker websites. Covers US, UK, and EU residents."
        />
        <meta property="og:url" content="https://footprintiq.app/privacy/data-broker-removal-guide" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Complete Data Broker Removal Guide (2026 Edition)" />
        <meta
          name="twitter:description"
          content="Learn how to remove your personal information from data broker websites."
        />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={webPageSchema} />

      <main className="min-h-screen bg-background">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link to="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/privacy-centre" className="hover:text-accent transition-colors">Privacy</Link></li>
              <li>/</li>
              <li className="text-foreground font-medium">Data Broker Removal Guide</li>
            </ol>
          </nav>

          {/* Header */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Edition</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              The Complete Guide to Removing Your Information from{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Data Brokers</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Data brokers collect, aggregate, and publish personal information from public records, social media, and
              commercial databases. These listings frequently appear in Google search results, exposing names, addresses,
              phone numbers, and family connections. This guide explains how data broker removal works, the differences
              between jurisdictions, and how to reduce your online exposure effectively.
            </p>
          </header>

          {/* Section 1: What Are Data Brokers? */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-accent flex-shrink-0" />
              What Are Data Brokers?
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Data brokers are companies that specialise in collecting personal information from publicly available sources
              and packaging it into searchable profile pages. Major brokers include Spokeo, Whitepages, Radaris,
              BeenVerified, MyLife, and PeopleFinder. They typically aggregate data from:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-4">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Public records</strong> — Property ownership, voter registration, court filings, and business registrations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Social media</strong> — Publicly visible profiles, usernames, and associated metadata.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Commercial databases</strong> — Marketing lists, loyalty programmes, and purchasing data.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>Breach data</strong> — Information from historical data breaches that has entered public circulation.</span>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              These profiles are indexed by search engines, meaning a simple name search can surface detailed personal
              information. Understanding how data brokers operate is the first step toward reducing your digital exposure.
            </p>
          </section>

          {/* Section 2: Why Your Information Appears Online */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-accent flex-shrink-0" />
              Why Your Information Appears Online
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Personal information enters the data broker ecosystem through multiple channels. Most individuals are
              unaware of how many sources contribute to their public profile. Common pathways include:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Government Records</h3>
                <p className="text-sm text-muted-foreground">Property deeds, marriage licences, court filings, and voter rolls are public by default in many jurisdictions.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Social Media Activity</h3>
                <p className="text-sm text-muted-foreground">Public profiles, check-ins, tagged photos, and friend lists provide identity signals that brokers aggregate.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Online Purchases</h3>
                <p className="text-sm text-muted-foreground">Loyalty programmes, newsletter sign-ups, and e-commerce accounts generate marketing data that enters broker databases.</p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Data Breaches</h3>
                <p className="text-sm text-muted-foreground">Historical breaches expose email addresses, passwords, and personal details that circulate in public and semi-public datasets.</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The cumulative effect is that most adults have information available through multiple data brokers,
              even if they have never interacted with these companies directly.
            </p>
          </section>

          {/* Section 3: How Data Broker Removal Works */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <Search className="w-6 h-6 text-accent flex-shrink-0" />
              How Data Broker Removal Works
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Each data broker has its own opt-out process. While the specifics vary, the general workflow follows
              a consistent pattern:
            </p>
            <ol className="space-y-4 text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center">1</span>
                <span><strong>Search for your profile</strong> — Visit the broker's website and search for your name, address, or phone number to locate your listing.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center">2</span>
                <span><strong>Locate the opt-out page</strong> — Most brokers provide a dedicated opt-out or removal page, often linked from their privacy policy.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center">3</span>
                <span><strong>Submit your request</strong> — Provide the URL of your profile and any required verification (email confirmation, identity documents).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center">4</span>
                <span><strong>Confirm and wait</strong> — Processing times range from 24 hours to 45 days depending on the broker.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/20 text-accent font-bold text-sm flex items-center justify-center">5</span>
                <span><strong>Verify removal</strong> — Check back after the stated processing period to confirm your listing has been removed.</span>
              </li>
            </ol>
            <p className="text-muted-foreground leading-relaxed">
              For broker-specific guides, see:{" "}
              <Link to="/remove-spokeo-profile" className="text-accent hover:underline font-medium">Remove Spokeo</Link>
              {" · "}
              <Link to="/remove-mylife-profile" className="text-accent hover:underline font-medium">Remove MyLife</Link>
              {" · "}
              <Link to="/remove-beenverified-profile" className="text-accent hover:underline font-medium">Remove BeenVerified</Link>
            </p>
          </section>

          {/* Section 4: DIY vs Automated */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <Users className="w-6 h-6 text-accent flex-shrink-0" />
              DIY Removal vs Automated Services
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-4">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">DIY Removal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Free of charge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Full control over which brokers to target</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    <span>Time-consuming (20–40+ brokers)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    <span>Requires periodic re-checking</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Automated Services</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Handles multiple brokers simultaneously</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Ongoing monitoring and re-submission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    <span>Recurring subscription cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    <span>Limited transparency in some services</span>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              For a detailed comparison, see our{" "}
              <Link to="/incogni-vs-diy-data-removal" className="text-accent hover:underline font-medium">
                Incogni vs DIY Data Removal
              </Link>{" "}
              guide.
            </p>
          </section>

          {/* Section 5: Jurisdiction Differences */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0" />
              Jurisdiction Differences: US, UK, and EU
            </h2>
            <div className="space-y-4">
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">United States</h3>
                <p className="text-muted-foreground leading-relaxed">
                  There is no federal data broker regulation in the US. California's CCPA and the California Delete Act
                  provide deletion rights for California residents. Vermont and other states require data brokers to
                  register but do not mandate removal. Most opt-out processes are voluntary and broker-specific.
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">United Kingdom</h3>
                <p className="text-muted-foreground leading-relaxed">
                  UK residents have the right to erasure under the UK Data Protection Act 2018 (retained GDPR). Data
                  controllers, including data brokers operating in or targeting UK residents, must respond to deletion
                  requests. The ICO provides enforcement and complaint mechanisms.
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">European Union</h3>
                <p className="text-muted-foreground leading-relaxed">
                  GDPR Article 17 provides the strongest data subject rights globally. EU residents can compel data
                  brokers to delete personal data, and non-compliance can result in significant fines. The right to
                  erasure extends to search engines under the Right to Be Forgotten framework.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Common Mistakes to Avoid
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                <span><strong>Providing unnecessary personal information</strong> — Some brokers request additional data during opt-out. Only provide what is strictly required for identity verification.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                <span><strong>Assuming one-time removal is permanent</strong> — Brokers frequently re-acquire data. Periodic monitoring is essential to maintain removal.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                <span><strong>Ignoring smaller brokers</strong> — Major brokers get the most attention, but smaller or regional brokers can also surface in search results.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                <span><strong>Not documenting requests</strong> — Keep records of every opt-out submission including dates, confirmation numbers, and screenshots for follow-up.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-destructive mt-2 flex-shrink-0" />
                <span><strong>Using unverified removal services</strong> — Some services lack transparency about which brokers they contact and what methods they use. Research before subscribing.</span>
              </li>
            </ul>
          </section>

          {/* Section 7: Impact on Google Search */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-accent flex-shrink-0" />
              How Removal Impacts Google Search Results
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Data broker profile pages are among the most commonly indexed sources of personal information in Google
              search results. When you successfully remove your profile from a broker, the source page is deleted or
              returns a 404 error. Google's crawlers will eventually detect this and remove the URL from the search index.
            </p>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              This process can take days to weeks. To accelerate de-indexing, you can submit a URL removal request
              through Google Search Console or Google's removal tools after confirming the source page has been deleted.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For a detailed guide on Google-specific removal, see our{" "}
              <Link to="/privacy/google-content-removal" className="text-accent hover:underline font-medium">
                Google Content Removal Guide
              </Link>.
            </p>
          </section>

          {/* Section 8: Monitoring */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Monitoring Your Exposure Over Time
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Data broker removal is not a one-time event. Brokers continuously refresh their databases from public
              records and commercial sources. Your information may reappear weeks or months after a successful removal.
              A structured monitoring approach helps identify re-listings early and maintain lower exposure over time.
            </p>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Regular exposure scans can detect new broker listings, email appearances in breach databases, and
              username reuse across platforms. Combining removal with ongoing monitoring provides the most effective
              approach to managing your digital footprint.
            </p>
          </section>

          {/* CTA Block */}
          <section className="mb-12">
            <div className="bg-gradient-card border border-accent/20 rounded-2xl p-8 sm:p-10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Start Your Removal Workflow
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed max-w-2xl">
                The FootprintIQ Privacy Centre provides a guided removal toolkit with GDPR and CCPA templates,
                broker detection, and opt-out status tracking — no automated submissions, full transparency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/privacy-centre"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                >
                  Open Privacy Centre
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/scan"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-accent/30 text-accent rounded-xl font-semibold hover:bg-accent/10 transition-colors"
                >
                  Run a Username Exposure Scan
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Related:{" "}
                <Link to="/privacy/google-content-removal" className="text-accent hover:underline">
                  Google Content Removal Guide
                </Link>{" · "}
                <Link to="/ai-answers/what-are-data-brokers" className="text-accent hover:underline">
                  What Are Data Brokers?
                </Link>
              </p>
            </div>
          </section>

          <RemovalIsOneStep />

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card border border-border/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Legal References */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Legal References</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>GDPR Article 17</strong> — Right to erasure under EU data protection law.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>UK Data Protection Act 2018</strong> — UK retained GDPR provisions including right to erasure.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>CCPA (California Consumer Privacy Act)</strong> — California state law providing data deletion rights.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span><strong>California Delete Act (SB 362)</strong> — Requires data brokers to register and honour deletion requests through a central mechanism.</span>
              </li>
            </ul>
          </section>

          <RelatedPrivacyGuides links={[
            { label: "Remove Personal Information from Google", to: "/privacy/google-content-removal" },
            { label: "Remove Your Home Address from Google", to: "/how-to-remove-your-address-from-google" },
            { label: "Remove Your Spokeo Listing", to: "/remove-spokeo-profile" },
            { label: "Remove Your BeenVerified Profile", to: "/remove-beenverified-profile" },
            { label: "Ethical OSINT Principles", to: "/ethical-osint-principles" },
          ]} />

          {/* Cite Block */}
          <aside className="border border-border/50 rounded-xl p-6 bg-muted/30 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Cite this page</p>
            <p>
              FootprintIQ. "Complete Data Broker Removal Guide (2026 Edition)."
              Published 12 February 2026.{" "}
              <span className="text-accent">https://footprintiq.app/privacy/data-broker-removal-guide</span>
            </p>
          </aside>
        </article>
      </main>
    </>
  );
};

export default DataBrokerRemovalGuide;
