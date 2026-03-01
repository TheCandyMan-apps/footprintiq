import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResponsibleUsePledge } from "@/components/ResponsibleUsePledge";
import {
  ShieldCheck,
  Lock,
  RefreshCw,
  UserCog,
  FileText,
  Check,
  AlertTriangle,
  Trash2,
  Download,
  Settings,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Do you resell data?",
    a: "No. FootprintIQ never sells, licenses, or shares your personal data with third parties. We are not a data broker. Your scan results belong to you.",
  },
  {
    q: "Do you store searches?",
    a: "Authenticated scans are stored in your private account so you can track changes over time. Anonymous (free) scans are processed in memory and not permanently stored. Rate-limiting metadata (IP hashes) is retained briefly for abuse prevention and then discarded.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can delete individual scan results or your entire account at any time from your account settings. Deletion is permanent and irreversible — we do not retain backups of deleted user data.",
  },
  {
    q: "How do you prevent abuse?",
    a: "We enforce per-IP and per-account rate limits, monitor for bulk or automated misuse patterns, and prohibit any use of the platform for stalking, harassment, or non-consensual investigation. Accounts found violating our Responsible Use policy are suspended immediately.",
  },
  {
    q: "What happens if there is a breach?",
    a: "In the unlikely event of a security incident, we will notify affected users within 72 hours, disclose the scope of the breach transparently, and provide clear remediation guidance. We follow industry-standard incident response procedures and maintain encrypted-at-rest storage for all sensitive data.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.lovable.app/" },
    { "@type": "ListItem", position: 2, name: "Trust & Safety", item: "https://footprintiq.lovable.app/trust-safety" },
  ],
};

const TrustSafety = () => {
  return (
    <>
      <SEO
        title="Trust & Safety — FootprintIQ"
        description="How FootprintIQ protects your privacy, prevents abuse, and handles your data. Privacy-first by design, transparent by default."
        canonical="/trust-safety"
      />
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-20 px-6 text-center border-b border-border">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trust & Safety</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Trust &amp; Safety
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Privacy, data handling, and abuse prevention aren't afterthoughts — they're product features. Here's how FootprintIQ earns your trust.
            </p>
          </div>
        </section>

        {/* Category comparison */}
        <CategoryComparisonStrip />

        {/* 1. Privacy-first by design */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <Lock className="w-6 h-6 text-primary" />
              Privacy-first by design
            </h2>
            <p className="text-muted-foreground mb-6">
              FootprintIQ is built around data minimisation, not data maximisation. We collect only what's needed, encrypt everything in transit and at rest, and follow the principle of least privilege throughout our infrastructure.
            </p>
            <ul className="space-y-3">
              {[
                "Minimised collection — we only process publicly available data relevant to your scan query",
                "Encryption — all data is encrypted in transit (TLS 1.3) and at rest (AES-256)",
                "Least privilege — internal access is restricted by role, logged, and audited",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. Data lifecycle */}
        <section className="py-16 px-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-primary" />
              Data lifecycle
            </h2>
            <p className="text-muted-foreground mb-4">
              We believe you should understand exactly what happens to your data — from the moment you start a scan to the moment you delete your results.
            </p>
            <p className="text-muted-foreground mb-4">
              Anonymous scans are processed ephemerally and not stored. Authenticated scan results are retained in your private account until you choose to delete them. We do not sell, share, or repurpose scan data for any secondary use.
            </p>
            <Link to="/data-lifecycle" className="text-primary hover:underline text-sm font-medium">
              Read our full Data Lifecycle policy →
            </Link>
          </div>
        </section>

        {/* 3. Abuse prevention */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-primary" />
              Abuse prevention
            </h2>
            <p className="text-muted-foreground mb-6">
              FootprintIQ is designed for self-assessment, safety planning, and authorised research — not for surveillance, stalking, or harassment. We enforce multiple layers of protection:
            </p>
            <ul className="space-y-3">
              {[
                "Per-IP and per-account rate limiting to prevent bulk automated misuse",
                "Behavioural misuse detection to flag suspicious scanning patterns",
                "Prohibited use cases clearly defined in our Responsible Use policy — violations result in immediate suspension",
                "No 'find anyone' workflows — the platform is designed for self-audit and authorised use only",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 4. User controls */}
        <section className="py-16 px-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <UserCog className="w-6 h-6 text-primary" />
              User controls
            </h2>
            <p className="text-muted-foreground mb-6">
              You stay in control of your data at every stage. FootprintIQ provides clear, accessible tools so you can manage what's stored and when it's removed.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Download, label: "Export", desc: "Download your scan results in structured formats at any time" },
                { icon: Trash2, label: "Delete", desc: "Permanently delete individual results or your entire account" },
                { icon: Settings, label: "Account controls", desc: "Manage authentication, notification preferences, and API keys" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="p-5 rounded-xl bg-card border border-border">
                  <Icon className="w-5 h-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">{label}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Compliance & policies */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              Compliance &amp; policies
            </h2>
            <p className="text-muted-foreground mb-6">
              Our policies are written in plain language because transparency matters more than legal jargon.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Responsible Use", to: "/responsible-use" },
                { label: "Data Lifecycle", to: "/data-lifecycle" },
              ].map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:border-primary/40 transition-colors"
                >
                  {label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FAQ */}
        <section className="py-16 px-6 bg-muted/20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-foreground">
              Frequently asked questions
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 bg-card">
                  <AccordionTrigger className="text-left text-foreground font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Internal link to /usernames */}
        <section className="py-12 px-6 text-center">
          <p className="text-muted-foreground text-sm">
            Ready to see what's publicly visible?{" "}
            <Link to="/usernames" className="text-primary hover:underline font-medium">
              Search your username across 350+ platforms →
            </Link>
          </p>
        </section>

        <ResponsibleUsePledge />
      </main>

      <Footer />
    </>
  );
};

export default TrustSafety;
