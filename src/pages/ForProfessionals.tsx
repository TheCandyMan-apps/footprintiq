import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase, Search, GitBranch, Scale, ShieldCheck, Code2,
  CheckCircle, BarChart3, FileText, ArrowRight, Shield,
  BookOpen, Globe, Lock, Eye, AlertTriangle, Zap
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ForProfessionals() {
  const origin = "https://footprintiq.app";

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "For Professionals" },
    ],
  };

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "OSINT Exposure Intelligence for Security & Compliance Teams",
    description:
      "Structured digital footprint auditing, identity correlation analysis, and risk scoring for security teams, compliance professionals, and investigators.",
    url: `${origin}/for-professionals`,
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
        name: "What types of professionals use FootprintIQ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Security consultants, compliance officers, HR teams conducting pre-employment checks, fraud investigators, privacy researchers, and journalists use FootprintIQ for structured digital footprint auditing and exposure assessment.",
        },
      },
      {
        "@type": "Question",
        name: "How does FootprintIQ differ from enterprise OSINT suites like Maltego?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ focuses on ethical, accessible exposure intelligence — not full-spectrum intelligence gathering. It provides structured reporting, risk scoring, and identity correlation without requiring specialised training or enterprise licensing.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ provide structured reports?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Scan results can be exported as structured reports with severity rankings, confidence scores, platform categorisation, and remediation recommendations — suitable for compliance documentation and stakeholder briefings.",
        },
      },
      {
        "@type": "Question",
        name: "Is FootprintIQ GDPR compliant?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ follows GDPR principles including data minimisation, purpose limitation, and the right to erasure. The platform only analyses publicly available data and provides full data deletion controls.",
        },
      },
      {
        "@type": "Question",
        name: "Does FootprintIQ offer API access?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "API access is available for professional and enterprise users, enabling programmatic scanning, result retrieval, and integration with existing security workflows and SIEM platforms.",
        },
      },
      {
        "@type": "Question",
        name: "Can FootprintIQ be used for pre-employment screening?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "FootprintIQ can assess publicly visible digital exposure as part of authorised due diligence workflows. All usage must comply with the Responsible Use Policy, applicable employment law, and the candidate's awareness or consent where required.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="OSINT Exposure Intelligence for Security & Compliance Teams"
        description="Structured digital footprint auditing, identity correlation analysis, and risk scoring for security teams, compliance professionals, and investigators."
        canonical={`${origin}/for-professionals`}
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
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <Briefcase className="w-3 h-3 mr-1" />
              For Professionals
            </Badge>
            <Badge variant="outline">Enterprise & Security Teams</Badge>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Exposure Intelligence for Security Teams & Professionals
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8" />

          <p className="text-xl text-foreground/80 leading-relaxed mb-8">
            Security teams, compliance officers, and investigators need structured, auditable
            intelligence — not raw data dumps. FootprintIQ provides ethical exposure intelligence
            with risk scoring, identity correlation analysis, and exportable reporting designed
            for professional workflows.
          </p>

          {/* Highlights */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { icon: FileText, label: "Structured reporting", desc: "Exportable reports with severity rankings and confidence scores." },
              { icon: BarChart3, label: "Risk scoring", desc: "LENS-powered risk assessment with weighted confidence analysis." },
              { icon: Shield, label: "Defensive intelligence", desc: "Exposure mapping for protection, not offensive operations." },
              { icon: Globe, label: "GDPR-aligned", desc: "Data minimisation, purpose limitation, and right to erasure." },
            ].map((item) => (
              <div key={item.label} className="p-5 rounded-xl border border-border bg-card text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <Separator className="my-12" />

          {/* ═══ 1. Digital Footprint Auditing ═══ */}
          <section id="footprint-auditing">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Search className="w-6 h-6 text-primary" />
              Digital Footprint Auditing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Digital footprint auditing is the foundation of exposure intelligence. FootprintIQ
              scans usernames, email addresses, and phone numbers across 500+ public platforms,
              breach databases, and data broker listings to produce a comprehensive exposure profile.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Multi-vector scanning", desc: "Username, email, phone, and name-based scanning across public sources simultaneously." },
                { label: "Platform categorisation", desc: "Results organised by platform type — social media, forums, professional networks, dating sites, and more." },
                { label: "Breach correlation", desc: "Cross-reference accounts against known breach databases to identify credential exposure." },
                { label: "Data broker detection", desc: "Identify active listings on major data broker sites that may expose personal or corporate information." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card">
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Audit results are structured for professional use — exportable as reports suitable
              for compliance documentation, risk assessments, and stakeholder briefings.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 2. Identity Correlation Analysis ═══ */}
          <section id="identity-correlation">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <GitBranch className="w-6 h-6 text-primary" />
              Identity Correlation Analysis
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Individual account discoveries become actionable intelligence when correlated.
              FootprintIQ's LENS (Link & Evidence Network System) analyses how public accounts
              connect through shared identifiers — usernames, profile images, bio patterns, and
              metadata overlap.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              As documented in FootprintIQ's{" "}
              <Link to="/research/username-reuse-report-2026#cross-platform-reuse" className="text-primary hover:underline">
                2026 identity correlation study
              </Link>, the median reused username links to 4.2 distinct public profiles. However,
              automated matching alone produces a 41% false-positive rate — which is why LENS
              applies weighted confidence scoring rather than binary matching.
            </p>
            <div className="p-5 rounded-xl border border-border bg-muted/20 mb-6">
              <h3 className="font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Confidence-weighted results
              </h3>
              <p className="text-sm text-muted-foreground">
                Every correlation is assigned a probability score. Results are presented as
                likelihood assessments — not identity confirmations. This distinction is critical
                for professional workflows where evidentiary standards matter.
              </p>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ 3. Fraud & Due Diligence Support ═══ */}
          <section id="due-diligence">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Scale className="w-6 h-6 text-primary" />
              Fraud & Due Diligence Support
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              FootprintIQ supports authorised due diligence and fraud assessment workflows by
              providing structured exposure intelligence on publicly available digital footprints.
              Use cases include:
            </p>
            <ul className="space-y-3 text-muted-foreground mb-6">
              {[
                { title: "Pre-employment screening", desc: "Assess publicly visible digital exposure as part of authorised hiring workflows — subject to applicable employment law and candidate awareness." },
                { title: "Vendor & partner assessments", desc: "Evaluate the digital exposure of key personnel in third-party organisations as part of supply chain risk management." },
                { title: "Fraud investigation support", desc: "Map publicly available account patterns, username correlations, and exposure indicators relevant to authorised investigations." },
                { title: "Executive exposure audits", desc: "Assess the digital footprint of C-suite executives, board members, and public-facing personnel to identify potential reputation or security risks." },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>
                    <strong className="text-foreground">{item.title}:</strong> {item.desc}
                  </span>
                </li>
              ))}
            </ul>
            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  All due diligence usage must comply with FootprintIQ's{" "}
                  <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</Link>,
                  applicable regulations, and ethical OSINT principles. FootprintIQ does not
                  support unauthorised surveillance or investigation.
                </span>
              </p>
            </div>
          </section>

          <Separator className="my-12" />

          {/* ═══ 4. API & Integration Capabilities ═══ */}
          <section id="api-integration">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <Code2 className="w-6 h-6 text-primary" />
              API & Integration Capabilities
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              For teams that need programmatic access, FootprintIQ provides API endpoints for
              automated scanning, result retrieval, and integration with existing security
              infrastructure.
            </p>
            <div className="space-y-3 mb-6">
              {[
                { icon: Zap, title: "RESTful API", desc: "Standard REST endpoints for initiating scans, retrieving results, and managing scan history programmatically." },
                { icon: GitBranch, title: "Webhook notifications", desc: "Receive scan completion events and alert triggers via configurable webhooks." },
                { icon: FileText, title: "Structured output formats", desc: "JSON responses with severity rankings, confidence scores, and platform metadata for direct integration." },
                { icon: Lock, title: "Authenticated access", desc: "API key authentication with scoped permissions and usage tracking." },
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
              API documentation is available at{" "}
              <Link to="/docs/api" className="text-primary hover:underline">/docs/api</Link>.
              Professional and enterprise API access is available on request.
            </p>
          </section>

          <Separator className="my-12" />

          {/* ═══ 5. Ethical Guardrails & Compliance ═══ */}
          <section id="ethics-compliance">
            <h2 className="text-3xl font-bold mb-6 pb-3 border-b border-border flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Ethical Guardrails & Compliance
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Professional-grade intelligence requires professional-grade ethics. FootprintIQ
              operates within a strict ethical framework that ensures all scanning, analysis, and
              reporting adheres to legal and regulatory standards.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Globe, label: "GDPR principles", desc: "Data minimisation, purpose limitation, storage limitation, and right to erasure are implemented throughout." },
                { icon: Shield, label: "Ethical OSINT charter", desc: "Six binding principles: public data only, consent-based scanning, no data brokerage, exposure intelligence, probability-based analysis, and transparency." },
                { icon: Scale, label: "Responsible use policy", desc: "Explicit prohibition of doxxing, harassment, unauthorised surveillance, and investigation of individuals without authorisation." },
                { icon: Lock, label: "Audit trail", desc: "Scan activity is logged for compliance purposes with role-based access controls for enterprise accounts." },
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
              For complete details on our ethical framework and security practices, see the{" "}
              <Link to="/trust" className="text-primary hover:underline">Trust & Safety</Link> hub
              and our{" "}
              <Link to="/ethical-osint-charter" className="text-primary hover:underline">
                Ethical OSINT Charter
              </Link>.
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
          <div className="p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border border-primary/20 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
              <Briefcase className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Request Professional Access</h3>
            <p className="text-muted-foreground mb-6 text-lg max-w-2xl mx-auto">
              Get structured exposure intelligence, API access, and enterprise reporting
              for your security, compliance, or investigative workflows.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-medium">
                <Link to="/pricing">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Request Professional Access
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
