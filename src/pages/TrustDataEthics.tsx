import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Database, CheckCircle, XCircle, Shield, Globe, Eye, Lock,
  FileText, AlertTriangle, BookOpen, ShieldCheck, Scale
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TrustDataEthics() {
  const origin = "https://footprintiq.app";

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "Trust & Safety", item: `${origin}/trust` },
      { "@type": "ListItem" as const, position: 3, name: "Data Ethics & Sources" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Data Ethics & Sources — How FootprintIQ Handles Information",
    description:
      "Understand exactly what data sources FootprintIQ uses, what it avoids, and why ethical OSINT sourcing matters for your privacy.",
    author: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: origin,
    },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      url: origin,
    },
    datePublished: "2026-02-01",
    dateModified: "2026-02-24",
    url: `${origin}/trust/data-ethics`,
    mainEntityOfPage: `${origin}/trust/data-ethics`,
    inLanguage: "en",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What data sources does FootprintIQ use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ only analyses publicly accessible data: public social media profiles, forum registrations, breach disclosure databases (metadata only), data broker opt-out previews, archived web content, and DNS/WHOIS records.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ access private accounts?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ never scrapes content behind login walls, bypasses authentication, or accesses private account data in any form.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ use dark web data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ does not access dark web markets, forums, hidden services, or any Tor-hosted content.",
        },
      },
      {
        "@type": "Question",
        name: "Is FootprintIQ a data broker?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ does not aggregate, package, resell, or share personal data. Scan results belong exclusively to the user who initiated the scan.",
        },
      },
      {
        "@type": "Question",
        name: "How does FootprintIQ handle false positives?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ uses its LENS (Link & Evidence Network System) to provide probability-based confidence scoring. Results are presented as likelihood assessments, not identity confirmations. Our 2026 research found a 41% false-positive rate in raw automated matching, which LENS significantly reduces.",
        },
      },
      {
        "@type": "Question",
        name: "Can I request deletion of my scan data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Users can request complete deletion of their scan data at any time via account settings or by contacting privacy@footprintiq.app.",
        },
      },
    ],
  };

  const sourcesWeUse = [
    { label: "Public social media profiles", desc: "Only content visible without authentication — profile names, bios, and public posts." },
    { label: "Public forum & community registrations", desc: "Username registrations on publicly accessible forums and community platforms." },
    { label: "Breach disclosure databases", desc: "Public metadata from known breach disclosures (e.g., email presence, not passwords or content)." },
    { label: "Data broker opt-out previews", desc: "Publicly visible preview listings on data broker sites, used to identify exposure." },
    { label: "Archived web content", desc: "Publicly accessible internet archive snapshots and cached pages." },
    { label: "DNS & WHOIS records", desc: "Publicly available domain registration and DNS resolution data." },
  ];

  const sourcesWeNeverUse = [
    { label: "Private or authenticated content", desc: "No scraping behind login walls, CAPTCHAs, or authentication barriers." },
    { label: "Dark web sources", desc: "No access to Tor hidden services, dark web markets, forums, or paste sites." },
    { label: "Purchased data broker records", desc: "No buying, licensing, or acquiring data from brokers or aggregators." },
    { label: "Government databases", desc: "No access to law enforcement, court, or government-restricted records." },
    { label: "Intercepted communications", desc: "No wiretapping, MITM interception, or surveillance of private messages." },
    { label: "Scraped data behind protections", desc: "No bypassing CAPTCHAs, rate limits, robots.txt, or ToS restrictions on other sites." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Data Ethics & Sources — How FootprintIQ Handles Information"
        description="Understand exactly what data sources FootprintIQ uses, what it avoids, and why ethical OSINT sourcing matters for your privacy."
        canonical={`${origin}/trust/data-ethics`}
        ogType="article"
        schema={{ organization: organizationSchema, breadcrumbs }}
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <Header />

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li aria-hidden="true" className="text-muted-foreground/50">›</li>
              <li><Link to="/trust" className="hover:text-primary transition-colors">Trust & Safety</Link></li>
              <li aria-hidden="true" className="text-muted-foreground/50">›</li>
              <li className="text-foreground font-medium">Data Ethics & Sources</li>
            </ol>
          </nav>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <Database className="w-3 h-3 mr-1" />
              Data Ethics
            </Badge>
            <Badge variant="outline">Updated February 2026</Badge>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Data Ethics & Sources
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8" />

          <p className="text-xl text-foreground/80 leading-relaxed mb-12">
            Transparency is foundational to trust. This page explains exactly what data sources
            FootprintIQ uses, what sources we deliberately avoid, and the ethical principles that
            guide every scan. If you're wondering whether FootprintIQ touches private data — it doesn't.
          </p>

          <Separator className="my-12" />

          {/* ═══ Our Data Sourcing Philosophy ═══ */}
          <section id="philosophy">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Our Data Sourcing Philosophy
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ operates on a simple principle: <strong className="text-foreground">if the data isn't publicly accessible,
              we don't touch it</strong>. Every scan analyses information that is already available to search
              engines, data brokers, and anyone with a web browser. We don't create new exposure — we help
              you understand the exposure that already exists.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              This approach is aligned with the six principles of our{" "}
              <Link to="/ethical-osint-charter" className="text-primary hover:underline">
                Ethical OSINT Charter
              </Link>: public data only, consent-based scanning, no data brokerage, exposure intelligence,
              probability-based analysis, and full transparency.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ Sources We Use ═══ */}
          <section id="sources-we-use">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" />
              Sources We Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ scans the following categories of publicly accessible data:
            </p>
            <div className="space-y-3 mb-8">
              {sourcesWeUse.map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              As detailed in our{" "}
              <Link to="/research/username-reuse-report-2026#methodology" className="text-primary hover:underline">
                2026 research methodology
              </Link>, all data collection follows ethical OSINT practices with full methodology disclosure.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ Sources We Never Use ═══ */}
          <section id="sources-we-never-use">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <XCircle className="w-6 h-6 text-destructive" />
              Sources We Never Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ explicitly excludes the following data sources — and always will:
            </p>
            <div className="space-y-3 mb-8">
              {sourcesWeNeverUse.map((item) => (
                <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ Not a Data Broker ═══ */}
          <section id="not-a-data-broker">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Scale className="w-6 h-6 text-primary" />
              FootprintIQ Is Not a Data Broker
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Data brokers collect, aggregate, and sell personal information. FootprintIQ does none
              of these things. Here's the distinction:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  What Data Brokers Do
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Aggregate personal data from multiple sources</li>
                  <li>• Build comprehensive profiles for sale</li>
                  <li>• Sell or license data to third parties</li>
                  <li>• Operate without the subject's knowledge</li>
                  <li>• Make opt-out deliberately difficult</li>
                </ul>
              </div>
              <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  What FootprintIQ Does
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Scans public data at the user's request</li>
                  <li>• Delivers results only to the requesting user</li>
                  <li>• Never sells, shares, or licenses scan data</li>
                  <li>• Operates transparently with full disclosure</li>
                  <li>• Provides immediate data deletion controls</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              For guidance on removing your data from actual data brokers, see our{" "}
              <Link to="/privacy-centre" className="text-primary hover:underline">
                Privacy Centre
              </Link>{" "}
              and{" "}
              <Link to="/privacy/data-broker-removal-guide" className="text-primary hover:underline">
                Data Broker Removal Guide
              </Link>.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ Confidence & False Positives ═══ */}
          <section id="confidence-scoring">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              Confidence Scoring & False Positives
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Raw OSINT data is inherently noisy. A username match across platforms doesn't confirm
              the same person — it indicates a <em>possibility</em>. FootprintIQ's LENS (Link & Evidence
              Network System) applies probability-based confidence scoring to every result.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ's{" "}
              <Link to="/research/username-reuse-report-2026#false-positive-analysis" className="text-primary hover:underline">
                identity correlation study shows
              </Link>{" "}
              that automated matching alone produces a 41% false-positive rate. LENS reduces this
              significantly by analysing profile metadata, activity patterns, and cross-platform signals
              to generate weighted confidence scores.
            </p>
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold text-foreground mb-3">Key principles:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Results are presented as probability assessments, never identity confirmations
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Users can reclassify results as benign, context-dependent, or false positives
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  Confidence adjusts based on real-world investigator feedback
                </li>
              </ul>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ Your Data, Your Control ═══ */}
          <section id="your-control">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              Your Data, Your Control
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ gives users full control over their data:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">View & export:</strong> Access all scan results in your dashboard and export them in standard formats.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Delete on demand:</strong> Request complete deletion of scan results and account data at any time.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">No retention after deletion:</strong> When you delete, the data is permanently removed — no backups, no archives.</span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">GDPR rights:</strong> Right to access, rectification, erasure, and data portability are fully supported.</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              For deletion requests or data access inquiries, contact{" "}
              <a href="mailto:privacy@footprintiq.app" className="text-primary hover:underline">
                privacy@footprintiq.app
              </a>{" "}
              or use the controls in your account settings.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ FAQ ═══ */}
          <section id="faq">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b border-border">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((item) => (
                <details
                  key={item.name}
                  className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors"
                >
                  <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                    {item.name}
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <Separator className="my-12" />

          {/* CTA */}
          <div className="p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border border-primary/20">
            <h3 className="text-2xl font-bold mb-3">Understand Your Digital Exposure</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              See what's publicly visible about you — ethically sourced, transparently processed,
              and fully under your control.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="font-medium">
                <Link to="/check-my-digital-footprint">
                  <Globe className="w-4 h-4 mr-2" />
                  Check My Digital Footprint
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-medium">
                <Link to="/pricing">View Plans</Link>
              </Button>
              <Button asChild variant="outline" className="font-medium">
                <Link to="/trust">
                  <Shield className="w-4 h-4 mr-2" />
                  Back to Trust Hub
                </Link>
              </Button>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
