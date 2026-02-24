import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Lock, Eye, Database, UserCheck, Scale, AlertTriangle,
  FileText, BookOpen, CheckCircle, XCircle, Clock, ShieldCheck,
  KeyRound, Globe, Server, Ban
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Trust() {
  const origin = "https://footprintiq.app";

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "Trust & Safety" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Trust, Safety & Ethical OSINT | FootprintIQ",
    description:
      "Learn how FootprintIQ uses ethical OSINT practices, privacy-first data handling, and transparent safeguards to protect users.",
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
    url: `${origin}/trust`,
    mainEntityOfPage: `${origin}/trust`,
    inLanguage: "en",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Does FootprintIQ access private accounts or dark web data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ analyses publicly accessible data only. No private accounts are scraped, no authentication is bypassed, and no dark web sources are accessed.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ sell or share user data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ does not sell, resell, or share scan results with any third party. The platform is not a data broker.",
        },
      },
      {
        "@type": "Question",
        name: "How long does FootprintIQ store scan data?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Scan results are retained only for the duration necessary for the user to review them. Raw scan data is not stored permanently. Users can request deletion at any time.",
        },
      },
      {
        "@type": "Question",
        name: "What safeguards exist against misuse?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ enforces rate limits, terms-of-use compliance, anti-stalking safeguards, and ethical use policies. Abusive accounts are suspended.",
        },
      },
      {
        "@type": "Question",
        name: "Is FootprintIQ GDPR compliant?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ follows GDPR principles including data minimisation, purpose limitation, and the right to erasure. Users can request complete data deletion.",
        },
      },
      {
        "@type": "Question",
        name: "Can I use FootprintIQ without creating an account?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. A limited free scan is available without registration. Full features require an account, but FootprintIQ collects only the minimum identifiers necessary.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Trust, Safety & Ethical OSINT | FootprintIQ"
        description="Learn how FootprintIQ uses ethical OSINT practices, privacy-first data handling, and transparent safeguards to protect users."
        canonical={`${origin}/trust`}
        ogType="article"
        schema={{
          organization: organizationSchema,
          breadcrumbs,
        }}
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <Header />

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <Shield className="w-3 h-3 mr-1" />
              Trust & Safety
            </Badge>
            <Badge variant="outline">Updated February 2026</Badge>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Trust, Safety & Ethical OSINT
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8" />

          <p className="text-xl text-foreground/80 leading-relaxed mb-12">
            FootprintIQ is built on the principle that individuals should be able to understand
            their own digital exposure — using ethical, transparent methods and publicly accessible
            data only. This page explains how we operate, what we do and do not do, and the
            safeguards in place to protect users.
          </p>

          <Separator className="my-12" />

          {/* ═══ 1. Ethical OSINT for Self-Protection ═══ */}
          <section id="ethical-osint">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Ethical OSINT for Self-Protection
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ uses open-source intelligence (OSINT) techniques to help users audit
              their own digital footprint. Every scan analyses publicly available data — the same
              information already accessible to search engines, data brokers, and anyone with a
              web browser.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: Globe, label: "Public data only", desc: "No private account scraping or authentication bypass" },
                { icon: Ban, label: "No dark-web intrusion", desc: "No access to dark web markets, forums, or hidden services" },
                { icon: XCircle, label: "No data resale", desc: "Scan results are never sold, shared, or brokered" },
                { icon: ShieldCheck, label: "Defensive self-assessment", desc: "Designed for users to understand their own exposure" },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              For a detailed overview of ethical OSINT principles, see our{" "}
              <Link to="/ethical-osint-charter" className="text-primary hover:underline">
                Ethical OSINT Charter
              </Link>{" "}
              and{" "}
              <Link to="/ethical-osint-for-individuals" className="text-primary hover:underline">
                Ethical OSINT for Individuals
              </Link>{" "}
              guide.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 2. Data Ethics & Sources ═══ */}
          <section id="data-ethics">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              Data Ethics & Sources
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Sources We Use
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Public social media profiles (visible without login)</li>
                  <li>• Public forum and community registrations</li>
                  <li>• Breach disclosure databases (public metadata only)</li>
                  <li>• Data broker opt-out previews and public listings</li>
                  <li>• Archived web content from public internet archives</li>
                  <li>• DNS and WHOIS records (publicly accessible)</li>
                </ul>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Sources We Never Use
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Private or authenticated account content</li>
                  <li>• Dark web markets, forums, or hidden services</li>
                  <li>• Purchased data broker records</li>
                  <li>• Government or law-enforcement databases</li>
                  <li>• Intercepted communications or surveillance feeds</li>
                  <li>• Scraped data behind CAPTCHAs or login walls</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              FootprintIQ does not operate as a data broker. We do not aggregate, package, or
              resell personal information. Scan results belong to the user who initiated them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/trust/data-ethics">
                  <Database className="w-4 h-4 mr-2" />
                  Read Full Data Ethics Policy
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/how-we-source-data">
                  How We Source Data →
                </Link>
              </Button>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ 3. Logging & Data Retention ═══ */}
          <section id="data-retention">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              Logging & Data Retention
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ follows a minimal-logging approach. We collect only the data necessary
              to operate the service and deliver scan results.
            </p>
            <div className="space-y-4 mb-6">
              {[
                { label: "Search queries", policy: "Not stored permanently. Processed in memory and discarded after scan completion." },
                { label: "Scan results", policy: "Retained for user review. Users can request deletion at any time via account settings." },
                { label: "Account data", policy: "Email and authentication credentials only. No unnecessary profiling or tracking." },
                { label: "Server logs", policy: "Minimal operational logs retained for security monitoring. No query content logged." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.policy}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              For complete details, see our{" "}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 4. Abuse Prevention & Guardrails ═══ */}
          <section id="abuse-prevention">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Abuse Prevention & Guardrails
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ is designed for self-assessment and legitimate security research. Multiple
              safeguards prevent misuse:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Scale, title: "Rate limits", desc: "Automated throttling prevents bulk scanning and enumeration attacks." },
                { icon: FileText, title: "Terms enforcement", desc: "Violations of the Terms of Service result in immediate account suspension." },
                { icon: Shield, title: "Anti-stalking safeguards", desc: "Scan patterns are monitored for indicators of targeted harassment or surveillance." },
                { icon: BookOpen, title: "Ethical use policy", desc: "All users agree to a Responsible Use Policy that prohibits doxxing, harassment, and unauthorised investigation." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If you believe FootprintIQ is being used in violation of our policies, contact{" "}
              <a href="mailto:abuse@footprintiq.app" className="text-primary hover:underline">
                abuse@footprintiq.app
              </a>.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 5. Privacy Mode & User Control ═══ */}
          <section id="privacy-controls">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-primary" />
              Privacy Mode & User Control
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ is built to be usable with minimal personal exposure:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Pseudonymous usage:</strong> Limited free scans are available without creating an account. No real name is required for registration.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Minimal identifiers:</strong> Only an email address is required for account creation. No phone number, address, or government ID.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">Data deletion controls:</strong> Users can request complete account and data deletion at any time. Deletion is permanent and irreversible.</span>
              </li>
            </ul>
          </section>

          <Separator className="my-12" />

          {/* ═══ 6. Security & Compliance ═══ */}
          <section id="security-compliance">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              Security & Compliance
            </h2>
            <div className="space-y-4 mb-6">
              {[
                { icon: KeyRound, title: "Encryption in transit", desc: "All connections use TLS 1.3. No unencrypted data transmission." },
                { icon: Server, title: "Encryption at rest", desc: "Data at rest is encrypted using AES-256 industry-standard encryption." },
                { icon: Lock, title: "Access controls", desc: "Role-based access controls limit internal data access to authorised personnel only." },
                { icon: Eye, title: "Security review practices", desc: "Regular security assessments and dependency audits are conducted to identify and remediate vulnerabilities." },
                { icon: Globe, title: "GDPR principles", desc: "Data minimisation, purpose limitation, storage limitation, and the right to erasure are implemented throughout the platform." },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                  <item.icon className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Security questions? Contact{" "}
              <a href="mailto:security@footprintiq.app" className="text-primary hover:underline">
                security@footprintiq.app
              </a>.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 7. Research Transparency ═══ */}
          <section id="research-transparency">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Research Transparency
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ publishes original research with full methodology disclosure. Our findings
              are reproducible, our data sources are documented, and our limitations are stated
              explicitly.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The{" "}
              <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">
                2026 Username Reuse & Digital Exposure Report
              </Link>{" "}
              analyses cross-platform username patterns using ethical OSINT methodology. Key findings
              include a 41% false-positive rate in automated matching, a median of 4.2 linked
              profiles per reused username, and 89% data staleness in broker records — all derived
              from publicly accessible sources.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Research methodology, statistical findings, and ethical boundaries are disclosed in
              full. The report is licensed under CC BY 4.0 and may be cited freely with attribution.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="outline">
                <Link to="/research/username-reuse-report-2026">
                  <FileText className="w-4 h-4 mr-2" />
                  Read the 2026 Report
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/research/media-kit">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Media Kit & Citations
                </Link>
              </Button>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ FAQ ═══ */}
          <section id="faq">
            <h2 className="text-3xl font-bold mb-8 pb-3 border-b border-border">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: "Does FootprintIQ access private accounts or dark web data?",
                  a: "No. FootprintIQ analyses publicly accessible data only. No private accounts are scraped, no authentication is bypassed, and no dark web sources are accessed.",
                },
                {
                  q: "Does FootprintIQ sell or share user data?",
                  a: "No. FootprintIQ does not sell, resell, or share scan results with any third party. The platform is not a data broker. Results are delivered only to the person who initiated the scan.",
                },
                {
                  q: "How long does FootprintIQ store scan data?",
                  a: "Scan results are retained only for the duration necessary for the user to review them. Raw scan data is not stored permanently. Users can request deletion at any time via account settings.",
                },
                {
                  q: "What safeguards exist against misuse?",
                  a: "FootprintIQ enforces rate limits, terms-of-use compliance, anti-stalking safeguards, and ethical use policies. Accounts found to be engaging in harassment, doxxing, or unauthorised surveillance are suspended immediately.",
                },
                {
                  q: "Is FootprintIQ GDPR compliant?",
                  a: "FootprintIQ follows GDPR principles including data minimisation, purpose limitation, and the right to erasure. Users can request complete data deletion at any time.",
                },
                {
                  q: "Can I use FootprintIQ without creating an account?",
                  a: "Yes. A limited free scan is available without registration. Full features require an account, but only an email address is needed — no phone number, real name, or government ID.",
                },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors"
                >
                  <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                    {item.q}
                  </summary>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <Separator className="my-12" />

          {/* CTA */}
          <div className="p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border border-primary/20">
            <h3 className="text-2xl font-bold mb-3">See What's Publicly Visible About You</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Use FootprintIQ to audit your username and understand your digital exposure —
              ethically, transparently, and on your terms.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="font-medium">
                <Link to="/check-my-digital-footprint">
                  <Shield className="w-4 h-4 mr-2" />
                  Check My Digital Footprint
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-medium">
                <Link to="/pricing">
                  View Plans
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
