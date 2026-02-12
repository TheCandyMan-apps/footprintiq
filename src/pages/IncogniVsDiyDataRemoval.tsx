import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, DollarSign, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const FAQ_DATA = [
  {
    question: "Is Incogni worth the cost compared to DIY removal?",
    answer: "It depends on how many brokers hold your data and how much time you have. Incogni saves significant time by automating opt-out requests across 180+ brokers, but DIY removal is free if you're willing to invest the effort. For most people with data on 20+ brokers, automation pays for itself in time savings."
  },
  {
    question: "Can I remove my data from all brokers manually?",
    answer: "Yes, most data brokers are legally required to honour removal requests under GDPR, CCPA, or their own policies. However, the process is time-consuming — each broker has a different opt-out flow, and many re-list your data within weeks or months, requiring repeated follow-up."
  },
  {
    question: "How long does Incogni take to remove data?",
    answer: "Incogni typically begins sending removal requests within 24–48 hours of signup. Most brokers process removals within 30–45 days, though some take longer. Incogni continues monitoring and re-submitting requests if data reappears."
  },
  {
    question: "What brokers does DIY removal work best for?",
    answer: "DIY removal is most effective for large, well-known brokers like Spokeo, BeenVerified, MyLife, and Whitepages, which have clear opt-out pages. Smaller or less transparent brokers may require formal GDPR/CCPA requests, which is where automation becomes more practical."
  },
  {
    question: "Does FootprintIQ offer automated removal?",
    answer: "FootprintIQ provides free GDPR and CCPA removal templates through its Privacy Centre, along with step-by-step guides for individual brokers. For fully automated removal, services like Incogni handle the process end-to-end."
  },
  {
    question: "Will my data come back after removal?",
    answer: "Often, yes. Many data brokers re-collect and re-list personal information from public records and other sources. This is why ongoing monitoring — either manual or through an automated service — is important for long-term privacy."
  },
  {
    question: "How much does Incogni cost per month?",
    answer: "Incogni pricing varies by plan and billing cycle. Annual plans are typically discounted compared to monthly billing. Check Incogni's website for current pricing — costs generally range from a few dollars per month on annual plans to higher rates for month-to-month subscriptions."
  },
  {
    question: "What are the risks of DIY data removal?",
    answer: "The main risks are incomplete removal (missing brokers you don't know about), re-listing without your knowledge, and accidentally providing too much personal information during opt-out verification. Using a structured checklist and monitoring tool reduces these risks."
  },
  {
    question: "Can I use Incogni and DIY removal together?",
    answer: "Yes. Some people use Incogni for the bulk of brokers and handle specific high-priority removals manually. This hybrid approach can be effective — automated services cover breadth while you maintain direct control over the most sensitive listings."
  },
  {
    question: "How do I know which approach is right for me?",
    answer: "Consider three factors: the number of brokers holding your data, how much time you can invest, and your budget. If you have data on fewer than 10 brokers, DIY is practical. For 20+ brokers or limited time, automation is more efficient. Running a scan first helps you assess the scope."
  },
  {
    question: "Are there alternatives to Incogni for automated removal?",
    answer: "Yes. Services like DeleteMe, Privacy Duck, and Kanary also offer automated data broker removal. Each covers a different set of brokers and pricing models. Compare coverage, cost, and monitoring frequency before choosing a service."
  },
  {
    question: "Does data removal improve my online security?",
    answer: "Reducing the amount of personal data available on broker sites lowers your exposure to targeted phishing, social engineering, identity theft, and unwanted contact. While it doesn't eliminate all risk, it meaningfully reduces your attack surface."
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Incogni vs DIY Data Removal – Which Is Better?",
  description: "Compare automated data removal services with DIY broker removal. Understand costs, benefits, and limitations.",
  author: { "@type": "Organization", name: "FootprintIQ" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-12",
  dateModified: "2026-02-12",
  mainEntityOfPage: "https://footprintiq.app/incogni-vs-diy-data-removal"
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
    { "@type": "ListItem", position: 2, name: "Privacy Centre", item: "https://footprintiq.app/privacy-centre" },
    { "@type": "ListItem", position: 3, name: "Incogni vs DIY Data Removal", item: "https://footprintiq.app/incogni-vs-diy-data-removal" }
  ]
};

export default function IncogniVsDiyDataRemoval() {
  return (
    <>
      <Helmet>
        <title>Incogni vs DIY Data Removal – Which Is Better?</title>
        <meta name="description" content="Compare automated data removal services with DIY broker removal. Understand costs, benefits, and limitations." />
        <link rel="canonical" href="https://footprintiq.app/incogni-vs-diy-data-removal" />
        <meta property="og:title" content="Incogni vs DIY Data Removal – Which Is Better?" />
        <meta property="og:description" content="Compare automated data removal services with DIY broker removal. Understand costs, benefits, and limitations." />
        <meta property="og:url" content="https://footprintiq.app/incogni-vs-diy-data-removal" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://footprintiq.app/og-image.jpg" />
        <meta property="og:site_name" content="FootprintIQ" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Incogni vs DIY Data Removal – Which Is Better?" />
        <meta name="twitter:description" content="Compare automated data removal services with DIY broker removal. Understand costs, benefits, and limitations." />
        <meta name="twitter:image" content="https://footprintiq.app/og-image.jpg" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link to="/privacy-centre" className="hover:text-primary transition-colors">Privacy Centre</Link></li>
              <li>/</li>
              <li className="text-foreground">Incogni vs DIY Data Removal</li>
            </ol>
          </nav>

          <article>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Incogni vs DIY Data Removal – Which Is Better?
            </h1>
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Your personal data is listed on dozens — sometimes hundreds — of data broker websites. Removing it is possible, but the question is: should you do it yourself, or pay a service like Incogni to handle it? This guide provides a neutral, analytical comparison of both approaches so you can make an informed decision.
            </p>

            {/* What Incogni Does */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">What Incogni Does</h2>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Incogni is a subscription-based data removal service operated by Surfshark. It automates the process of sending opt-out and deletion requests to data brokers on your behalf.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>Sends removal requests to 180+ data brokers automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>Monitors brokers and re-submits requests if your data reappears</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>Provides a dashboard showing removal progress and status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>Handles GDPR and CCPA requests where applicable</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* What DIY Removal Involves */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">What DIY Removal Involves</h2>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  DIY data removal means personally contacting each data broker to request deletion of your records. It's entirely free but requires significant time and ongoing effort.
                </p>
                <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                  <li>Identify which brokers hold your data (use a <Link to="/scan" className="text-primary hover:underline">free scan</Link> to check)</li>
                  <li>Visit each broker's opt-out page and submit a removal request</li>
                  <li>Verify your identity where required (email confirmation, ID upload)</li>
                  <li>Wait 30–45 days for processing</li>
                  <li>Check back periodically — many brokers re-list data within weeks</li>
                  <li>Repeat the process for any brokers that re-collect your information</li>
                </ol>
                <p className="text-muted-foreground mt-4">
                  FootprintIQ provides free <Link to="/privacy-centre" className="text-primary hover:underline">GDPR and CCPA templates</Link> and step-by-step guides for popular brokers like{" "}
                  <Link to="/remove-mylife-profile" className="text-primary hover:underline">MyLife</Link>,{" "}
                  <Link to="/remove-spokeo-profile" className="text-primary hover:underline">Spokeo</Link>, and{" "}
                  <Link to="/remove-beenverified-profile" className="text-primary hover:underline">BeenVerified</Link>.
                </p>
              </div>
            </section>

            {/* Cost Comparison */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold text-foreground">Cost Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border border-border rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-4 font-semibold text-foreground">Factor</th>
                      <th className="text-left p-4 font-semibold text-foreground">Incogni</th>
                      <th className="text-left p-4 font-semibold text-foreground">DIY Removal</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">Monthly cost</td>
                      <td className="p-4">~$6.49/mo (annual plan) or ~$12.99/mo</td>
                      <td className="p-4">Free</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/50">
                      <td className="p-4 font-medium">Time investment</td>
                      <td className="p-4">~10 minutes (initial setup)</td>
                      <td className="p-4">5–15 hours initially, plus ongoing monitoring</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">Broker coverage</td>
                      <td className="p-4">180+ brokers</td>
                      <td className="p-4">Limited to brokers you identify and contact</td>
                    </tr>
                    <tr className="border-t border-border bg-muted/50">
                      <td className="p-4 font-medium">Ongoing monitoring</td>
                      <td className="p-4">Included (automated re-submission)</td>
                      <td className="p-4">Manual — you must check and re-submit</td>
                    </tr>
                    <tr className="border-t border-border">
                      <td className="p-4 font-medium">Annual cost</td>
                      <td className="p-4">~$77.88 (annual plan)</td>
                      <td className="p-4">$0 (time excluded)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Automation vs Manual */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Automation vs Manual: How They Compare</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3">Automated (Incogni)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sends requests in bulk across all supported brokers</li>
                    <li>• Tracks status and re-submits automatically</li>
                    <li>• No knowledge of individual broker procedures required</li>
                    <li>• Limited to brokers in their database</li>
                    <li>• Less control over individual requests</li>
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3">Manual (DIY)</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Full control over every request and follow-up</li>
                    <li>• Can target specific brokers you care about most</li>
                    <li>• No subscription cost</li>
                    <li>• Requires research into each broker's opt-out process</li>
                    <li>• Easy to fall behind on re-submissions</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Pros & Cons */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Pros & Cons at a Glance</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Incogni</h3>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-500 mb-2">Pros</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Saves hours of manual work</li>
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Continuous monitoring and re-submission</li>
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Broad broker coverage</li>
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Progress dashboard</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-500 mb-2">Cons</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Recurring subscription cost</li>
                      <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Limited to supported brokers only</li>
                      <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Less transparency into individual requests</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">DIY Removal</h3>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-green-500 mb-2">Pros</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Completely free</li>
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Full control and visibility</li>
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Can target any broker, not just supported ones</li>
                      <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> Educational — you learn how your data flows</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-500 mb-2">Cons</h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Very time-intensive</li>
                      <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> Easy to miss brokers or forget follow-ups</li>
                      <li className="flex items-start gap-2"><XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /> No automated re-submission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* When Each Makes Sense */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-4">When Each Approach Makes Sense</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3">Choose Incogni if…</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> Your data appears on many brokers (20+)</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You don't have time for manual opt-outs</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You want ongoing monitoring without effort</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You value convenience over cost savings</li>
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-3">Choose DIY if…</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You only need to remove data from a few specific brokers</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You prefer not to pay a subscription</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You want to understand the process firsthand</li>
                    <li className="flex items-start gap-2"><ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" /> You're comfortable with periodic follow-up</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="mb-12 bg-card border border-border rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-3">Not sure where your data appears?</h2>
              <p className="text-muted-foreground mb-6">
                Run a free scan to see which brokers and platforms list your information — then decide whether to remove it yourself or use a service.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/scan" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Scan Your Digital Footprint
                </Link>
                <Link to="/privacy-centre" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition-colors">
                  Browse Privacy Centre
                </Link>
              </div>
            </section>

            {/* FAQ */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {FAQ_DATA.map((faq, index) => (
                  <details key={index} className="bg-card border border-border rounded-lg group">
                    <summary className="p-4 font-medium text-foreground cursor-pointer hover:text-primary transition-colors list-none flex items-center justify-between">
                      {faq.question}
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            {/* Related Resources */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Related Resources</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/data-broker-removal-guide" className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
                  <h3 className="font-medium text-foreground mb-1">Data Broker Removal Guide</h3>
                  <p className="text-sm text-muted-foreground">Complete guide with GDPR and CCPA templates for removing your data from broker websites.</p>
                </Link>
                <Link to="/privacy-centre" className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors">
                  <h3 className="font-medium text-foreground mb-1">Privacy Centre</h3>
                  <p className="text-sm text-muted-foreground">Free toolkit with broker detection, opt-out tracking, and removal letter templates.</p>
                </Link>
              </div>
            </section>
          </article>
        </main>
        <Footer />
      </div>
    </>
  );
}
