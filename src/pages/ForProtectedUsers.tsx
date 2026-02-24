import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ShieldAlert, Target, GitBranch, Clock, Workflow, Lock,
  CheckCircle, XCircle, Eye, ArrowRight, Shield, BookOpen,
  AlertTriangle, Fingerprint, Server
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ForProtectedUsers() {
  const origin = "https://footprintiq.app";

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "For Protected Users" },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Digital Exposure Protection for Journalists, Activists & Public Figures",
    description:
      "Assess doxxing risk, map identity correlations, and reduce digital exposure using ethical OSINT — designed for journalists, activists, and public figures.",
    url: `${origin}/for-protected-users`,
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    datePublished: "2026-02-24",
    dateModified: "2026-02-24",
    inLanguage: "en",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can FootprintIQ be used to dox someone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ is designed for defensive self-assessment only. It enforces rate limits, anti-stalking safeguards, and ethical use policies. Accounts found to engage in harassment or doxxing are suspended immediately.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ track or monitor users?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. FootprintIQ does not track users, install cookies for surveillance, or monitor scan activity beyond what is required for rate limiting and abuse prevention.",
        },
      },
      {
        "@type": "Question",
        name: "How does FootprintIQ handle identity correlation?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ's LENS system maps how public accounts link together through shared usernames, profile images, and metadata patterns. Results are probability-based assessments — not identity confirmations. Our 2026 research found a 41% false-positive rate in raw automated matching.",
        },
      },
      {
        "@type": "Question",
        name: "Is FootprintIQ suitable for journalists in authoritarian countries?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ can help journalists audit their own digital exposure before it becomes a risk. However, operational security is a broad discipline — FootprintIQ addresses digital footprint assessment specifically, not full OPSEC.",
        },
      },
      {
        "@type": "Question",
        name: "What data does FootprintIQ store about my scan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Scan results are retained for user review only. Raw query data is processed in memory and discarded. Users can request complete data deletion at any time. See our Trust & Safety page for full details.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Digital Exposure Protection for Journalists, Activists & Public Figures"
        description="Assess doxxing risk, map identity correlations, and reduce digital exposure using ethical OSINT — designed for journalists, activists, and public figures."
        canonical={`${origin}/for-protected-users`}
        ogType="website"
        schema={{ organization: organizationSchema, breadcrumbs }}
      />
      <JsonLd data={pageSchema} />
      <JsonLd data={faqSchema} />
      <Header />

      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Badge */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
              <ShieldAlert className="w-3 h-3 mr-1" />
              High-Risk Protection
            </Badge>
            <Badge variant="outline">Defensive OSINT Only</Badge>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Exposure Protection for High-Risk Individuals
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-destructive via-primary to-accent rounded-full mb-8" />

          <p className="text-xl text-foreground/80 leading-relaxed mb-8">
            Journalists, activists, domestic abuse survivors, whistleblowers, and public figures
            face targeted threats that most people never consider. A single leaked username can
            connect personal accounts, reveal home addresses, and expose private networks.
            FootprintIQ helps you see what an adversary sees — before they act.
          </p>

          {/* Ethical emphasis */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Shield, label: "Ethical OSINT", desc: "Public data only. No dark web, no private account scraping." },
              { icon: XCircle, label: "No tracking tools", desc: "No surveillance, no monitoring, no cookies for profiling." },
              { icon: Lock, label: "Defensive use only", desc: "Designed for self-assessment, not targeting others." },
            ].map((item) => (
              <div key={item.label} className="p-5 rounded-xl border border-border bg-card text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <Separator className="my-12" />

          {/* ═══ 1. Doxxing Risk Assessment ═══ */}
          <section id="doxxing-risk">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Target className="w-6 h-6 text-destructive" />
              Doxxing Risk Assessment
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Doxxing starts with publicly available data. An adversary searches for your username,
              finds linked accounts, cross-references profile details, and assembles a dossier.
              FootprintIQ simulates this process defensively — showing you exactly what can be
              discovered and where the highest risks are.
            </p>
            <div className="space-y-3 mb-6">
              {[
                "Username presence across 500+ public platforms",
                "Email exposure in known breach databases",
                "Data broker listings containing your personal details",
                "Profile metadata that connects separate accounts",
                "Archived content that may reveal outdated but still-accessible data",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              The goal isn't to alarm — it's to inform. Every finding is ranked by severity so
              you can address the most dangerous exposure first.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 2. Identity Correlation Mapping ═══ */}
          <section id="identity-correlation">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-primary" />
              Identity Correlation Mapping
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The most dangerous aspect of digital exposure isn't any single account — it's how
              accounts connect. A username reused across platforms creates a correlation chain that
              can link your professional identity to personal accounts, pseudonyms, or sensitive
              memberships.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ's LENS system maps these connections using shared usernames, profile
              images, bio patterns, and metadata overlap. As documented in our{" "}
              <Link to="/research/username-reuse-report-2026#cross-platform-reuse" className="text-primary hover:underline">
                2026 research
              </Link>, the median reused username links to 4.2 distinct public profiles — and 44%
              of users share recognisable profile images across platforms.
            </p>
            <div className="p-5 rounded-xl border border-border bg-muted/20">
              <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-primary" />
                Probability-based analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                Correlation results are presented as probability assessments, not identity
                confirmations. LENS reduces the 41% false-positive rate found in raw automated
                matching by applying weighted confidence scoring across multiple signal types.
              </p>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ 3. Legacy Account Discovery ═══ */}
          <section id="legacy-accounts">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" />
              Legacy Account Discovery
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Forgotten accounts are often the most dangerous. A forum registration from 2009, an
              abandoned dating profile, or an old gaming alias can reveal personal details you no
              longer associate with your current identity — but an adversary will.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Dormant social accounts", desc: "Old profiles on platforms you stopped using years ago." },
                { label: "Forum registrations", desc: "Public posts and usernames on forums, Q&A sites, and communities." },
                { label: "Archived content", desc: "Cached or archived versions of pages you thought were deleted." },
                { label: "Data broker re-listings", desc: "Broker sites that re-list your data after you've opted out." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Our research shows that{" "}
              <Link to="/research/username-reuse-report-2026#risk-distribution" className="text-primary hover:underline">
                58% of username-linked accounts contain stale profile data
              </Link>{" "}
              — information that's outdated but still publicly accessible and exploitable.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 4. Exposure Reduction Workflows ═══ */}
          <section id="exposure-reduction">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Workflow className="w-6 h-6 text-primary" />
              Exposure Reduction Workflows
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Discovery without action is incomplete. FootprintIQ provides structured workflows
              to systematically reduce your exposure — starting with the highest-risk findings.
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              {[
                { title: "Severity-ranked remediation", desc: "Address critical exposure first — data broker listings with home addresses, breached credentials, identity-linking profile images." },
                { title: "Opt-out & removal guides", desc: "Step-by-step instructions for major data brokers, with GDPR and CCPA templates ready to send." },
                { title: "Account deactivation checklists", desc: "Platform-specific guidance for closing, deactivating, or privacy-hardening accounts." },
                { title: "Re-scan verification", desc: "Run follow-up scans to confirm that removed listings stay down and new exposure hasn't appeared." },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">{item.title}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              For comprehensive removal resources, see the{" "}
              <Link to="/privacy-centre" className="text-primary hover:underline">Privacy Centre</Link>.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 5. Privacy-First Scan Architecture ═══ */}
          <section id="privacy-architecture">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Server className="w-6 h-6 text-primary" />
              Privacy-First Scan Architecture
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              For high-risk users, the platform itself must be trustworthy. FootprintIQ's
              architecture is designed with privacy as the default, not an afterthought.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { icon: Lock, title: "No permanent query storage", desc: "Search queries are processed in memory and discarded after scan completion. No logs of what you searched." },
                { icon: Eye, title: "Minimal data collection", desc: "Only an email address is required. No phone number, real name, or government ID." },
                { icon: Shield, title: "Encryption throughout", desc: "TLS 1.3 in transit, AES-256 at rest. No unencrypted data transmission." },
                { icon: XCircle, title: "No third-party data sharing", desc: "Scan results are never sold, shared, or made available to any third party." },
                { icon: CheckCircle, title: "User-controlled deletion", desc: "Delete your account and all associated data at any time. Deletion is permanent." },
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
            <p className="text-muted-foreground leading-relaxed">
              Full details on our security practices and ethical commitments are available on the{" "}
              <Link to="/trust" className="text-primary hover:underline">Trust & Safety</Link> page.
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
          <div className="p-8 bg-gradient-to-br from-destructive/5 via-primary/5 to-accent/5 rounded-3xl border border-destructive/20 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-destructive/10 mb-6">
              <ShieldAlert className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Assess Your Exposure Risk</h3>
            <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
              See what an adversary can find about you using publicly available data.
              Ethical, transparent, and entirely under your control.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-medium">
                <Link to="/check-my-digital-footprint">
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Assess Exposure Risk
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/trust">
                  <Shield className="w-4 h-4 mr-2" />
                  Trust & Safety
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-medium">
                <Link to="/research/username-reuse-report-2026">
                  <BookOpen className="w-4 h-4 mr-2" />
                  2026 Research
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
