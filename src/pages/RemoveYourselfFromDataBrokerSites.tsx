import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Trash2, Shield, CheckCircle, AlertTriangle, ExternalLink, Clock, Globe } from "lucide-react";

const origin = "https://footprintiq.app";

export default function RemoveYourselfFromDataBrokerSites() {
  const faqData = [
    { q: "What are data broker sites?", a: "Data brokers are companies that collect, aggregate, and sell personal information. They gather data from public records, social media, purchase histories, and other sources to build detailed profiles that anyone can access — often for a fee." },
    { q: "Is it free to remove yourself from data brokers?", a: "Most data brokers are legally required to process opt-out requests for free. However, the process is time-consuming, often requiring individual submissions to dozens of sites. Some services automate this for a fee." },
    { q: "How long does data broker removal take?", a: "Most brokers process removal requests within 2-4 weeks. However, some may take up to 45 days. Additionally, your data may reappear after removal, requiring periodic re-checks." },
    { q: "Will my data stay removed permanently?", a: "Unfortunately, no. Data brokers continuously re-aggregate data from public sources. Your information may reappear within months. Ongoing monitoring and repeat removal requests are necessary for long-term protection." },
    { q: "Can FootprintIQ remove me from data brokers?", a: "FootprintIQ identifies where your data appears and provides guided removal workflows with jurisdiction-specific templates (GDPR, CCPA, UK SDS). Pro users get automated removal tracking and re-scan alerts." },
  ];

  const brokers = [
    { name: "Spokeo", difficulty: "Easy", time: "2-3 weeks", link: "/remove-spokeo-profile" },
    { name: "BeenVerified", difficulty: "Easy", time: "1-2 weeks", link: "/remove-beenverified-profile" },
    { name: "MyLife", difficulty: "Medium", time: "2-4 weeks", link: "/remove-mylife-profile" },
    { name: "Whitepages", difficulty: "Easy", time: "1-2 weeks", link: null },
    { name: "Intelius", difficulty: "Medium", time: "2-4 weeks", link: null },
    { name: "PeopleFinder", difficulty: "Medium", time: "2-3 weeks", link: null },
    { name: "TruePeopleSearch", difficulty: "Easy", time: "24-48 hours", link: null },
    { name: "FastPeopleSearch", difficulty: "Easy", time: "24-48 hours", link: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Remove Yourself from Data Broker Sites (2026 Guide) | FootprintIQ</title>
        <meta name="description" content="Step-by-step guide to removing your personal information from data broker and people-search sites. Covers opt-out processes, timelines, and ongoing monitoring strategies." />
        <link rel="canonical" href={`${origin}/remove-yourself-from-data-broker-sites`} />
      </Helmet>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "headline": "How to Remove Yourself from Data Broker Sites (2026 Guide)",
            "description": "Step-by-step guide to removing your personal information from data broker and people-search sites.",
            "author": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "publisher": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "datePublished": "2026-02-24",
            "dateModified": "2026-02-24",
            "mainEntityOfPage": `${origin}/remove-yourself-from-data-broker-sites`,
          },
          {
            "@type": "FAQPage",
            "mainEntity": faqData.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
              { "@type": "ListItem", "position": 2, "name": "Remove from Data Brokers", "item": `${origin}/remove-yourself-from-data-broker-sites` },
            ],
          },
          {
            "@type": "HowTo",
            "name": "How to Remove Yourself from Data Broker Sites",
            "description": "A step-by-step process for opting out of major data broker and people-search platforms.",
            "step": [
              { "@type": "HowToStep", "position": 1, "name": "Identify where you appear", "text": "Run a digital footprint scan to discover which data brokers list your information." },
              { "@type": "HowToStep", "position": 2, "name": "Submit opt-out requests", "text": "Visit each broker's opt-out page and submit removal requests with required verification." },
              { "@type": "HowToStep", "position": 3, "name": "Verify removal", "text": "Check back after the stated processing time to confirm your data has been removed." },
              { "@type": "HowToStep", "position": 4, "name": "Monitor for re-listing", "text": "Set up ongoing monitoring as brokers frequently re-aggregate your data from public sources." },
            ],
          },
        ],
      }} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-destructive/5 to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Trash2 className="w-4 h-4" /> Data Broker Removal
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How to Remove Yourself from Data Broker Sites
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your personal information is probably listed on dozens of data broker sites right now. Here's how to find it, remove it, and keep it removed.
          </p>
        </div>
      </section>

      <main className="container max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">What Are Data Brokers and Why Should You Care?</h2>
          <p className="text-muted-foreground mb-4">
            Data brokers are companies that collect personal information from public records, social media, purchase histories, and other sources. They aggregate this data into profiles and sell access to anyone willing to pay — marketers, employers, landlords, or anyone else.
          </p>
          <p className="text-muted-foreground mb-4">
            A typical data broker profile may include your full name, current and past addresses, phone numbers, email addresses, age, relatives' names, and even estimated income. This information is available to anyone with an internet connection and a credit card.
          </p>
          <p className="text-muted-foreground">
            The good news: privacy laws in many jurisdictions (GDPR, CCPA, UK GDPR) give you the right to request removal. The challenge is that there are hundreds of these sites, and most people don't know they're listed.
          </p>
        </section>

        {/* Section 2 – Broker Table */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Major Data Brokers & Opt-Out Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-foreground">Broker</th>
                  <th className="text-left p-3 font-semibold text-foreground">Difficulty</th>
                  <th className="text-left p-3 font-semibold text-foreground">Processing Time</th>
                  <th className="text-left p-3 font-semibold text-foreground">Guide</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((broker, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 text-foreground font-medium">{broker.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        broker.difficulty === "Easy" ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-600"
                      }`}>{broker.difficulty}</span>
                    </td>
                    <td className="p-3 text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {broker.time}</td>
                    <td className="p-3">
                      {broker.link ? (
                        <Link to={broker.link} className="text-primary text-xs underline flex items-center gap-1">
                          View Guide <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-xs">Coming soon</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3 – Process */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">The Removal Process: Step by Step</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold text-foreground">Discover Where You Appear</h3>
                <p className="text-sm text-muted-foreground">Run a digital footprint scan to identify which data brokers list your information. Manually checking each broker is possible but extremely time-consuming. FootprintIQ automates this discovery process.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold text-foreground">Submit Opt-Out Requests</h3>
                <p className="text-sm text-muted-foreground">Visit each broker's opt-out page and follow their process. Most require email verification. Some require you to create an account first (ironic, but necessary). Keep records of every submission.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold text-foreground">Verify Removal</h3>
                <p className="text-sm text-muted-foreground">After the stated processing period, check each broker to confirm your listing has been removed. If it hasn't, follow up with a second request citing the applicable privacy regulation (GDPR, CCPA, etc.).</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold text-foreground">Set Up Ongoing Monitoring</h3>
                <p className="text-sm text-muted-foreground">Data brokers re-aggregate information continuously. Your data will likely reappear within 3-6 months. Schedule quarterly re-checks or use automated monitoring to catch new listings.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 – Legal Rights */}
        <section className="bg-muted/30 border border-border rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Your Legal Rights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">GDPR (EU/UK)</h3>
              </div>
              <p className="text-xs text-muted-foreground">Right to erasure under Article 17. Data brokers must delete your data within 30 days of a valid request. Non-compliance carries significant fines.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">CCPA (California)</h3>
              </div>
              <p className="text-xs text-muted-foreground">Right to delete personal information. Data brokers registered in California must honour deletion requests within 45 days.</p>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">UK GDPR / SDS</h3>
              </div>
              <p className="text-xs text-muted-foreground">Right to erasure and the Supplementary Data Subject rights. UK residents have strong legal grounds for data broker removal requests.</p>
            </div>
          </div>
        </section>

        {/* Section 5 – DIY vs Automated */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">DIY vs Automated Removal</h2>
          <div className="overflow-x-auto">
            <table className="w-full border border-border rounded-lg text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-foreground">Aspect</th>
                  <th className="text-left p-3 font-semibold text-foreground">DIY (Free)</th>
                  <th className="text-left p-3 font-semibold text-foreground">FootprintIQ Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Discovery", "Manual site-by-site search", "Automated scan across 500+ sources"],
                  ["Opt-out process", "Individual submissions", "Guided workflows with templates"],
                  ["Legal templates", "Write your own", "Jurisdiction-specific (GDPR/CCPA/UK)"],
                  ["Tracking", "Spreadsheet", "Dashboard with status tracking"],
                  ["Re-monitoring", "Manual quarterly checks", "Automated re-scan alerts"],
                  ["Time required", "10-20 hours initially", "Under 1 hour"],
                ].map(([aspect, diy, pro], i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 text-foreground font-medium">{aspect}</td>
                    <td className="p-3 text-muted-foreground">{diy}</td>
                    <td className="p-3 text-muted-foreground">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Find Out Where You're Listed</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Run a free exposure scan to discover which data broker sites list your personal information. Then take action to remove it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/scan">Run Free Exposure Scan</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">See Pro Removal Tools</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Resources</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost" size="sm"><Link to="/privacy-centre">Privacy Centre</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/data-broker-removal-guide">Data Broker Removal Guide</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/how-to-protect-your-digital-identity">Protect Your Digital Identity</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/check-my-digital-footprint">Check My Digital Footprint</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
