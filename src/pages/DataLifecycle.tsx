import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResponsibleUsePledge } from "@/components/ResponsibleUsePledge";
import {
  Upload,
  Search,
  BarChart3,
  Database,
  Settings,
  Trash2,
  ArrowRight,
  Info,
  Shield,
  FileText,
  Scale,
} from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "1. Input",
    desc: "You provide a username, email address, phone number, or domain. We never collect data you haven't explicitly submitted.",
    colour: "text-primary",
  },
  {
    icon: Search,
    title: "2. Public-Source Analysis",
    desc: "We query publicly accessible OSINT sources — social platforms, breach databases, DNS records, and data-broker indexes. We never access private accounts, messages, or paywalled content.",
    colour: "text-blue-400",
  },
  {
    icon: BarChart3,
    title: "3. Results Generation",
    desc: "Raw findings are deduplicated, scored for confidence, and assembled into exposure signals — platform matches, breach records, and risk indicators.",
    colour: "text-amber-400",
  },
  {
    icon: Database,
    title: "4. Retention",
    desc: "Scan inputs (the query itself) are deleted within 2–5 minutes. Aggregated results are retained for up to 30 days so you can review, export, or act on them. No raw personal data is kept beyond this window.",
    colour: "text-emerald-400",
  },
  {
    icon: Settings,
    title: "5. User Controls",
    desc: "You can export your results as PDF or CSV at any time. You can also delete individual scans or your entire account from the dashboard — no support ticket required.",
    colour: "text-violet-400",
  },
  {
    icon: Trash2,
    title: "6. Deletion",
    desc: "When you delete data or your account, all associated records are permanently removed from our database within 48 hours. There is no soft-delete or hidden archive.",
    colour: "text-destructive",
  },
];

const faqs = [
  {
    q: "What data do you collect when I run a scan?",
    a: "We collect only the identifier you submit (username, email, phone, or domain) and the scan results returned by public OSINT sources. We do not collect browsing history, contacts, or any data from your device.",
  },
  {
    q: "How long do you keep my scan results?",
    a: "Scan inputs are deleted within 2–5 minutes. Aggregated results are retained for up to 30 days so you can review and export them. After that, they are permanently deleted.",
  },
  {
    q: "Can I delete my data before the retention period ends?",
    a: "Yes. You can delete individual scan results or your entire account at any time from your dashboard. Deletion is permanent and completed within 48 hours.",
  },
  {
    q: "Do you share my data with third parties?",
    a: "No. We do not sell, rent, or share your personal data with third parties. Scan results are visible only to you. We use sub-processors (hosting, analytics) under strict data-processing agreements.",
  },
  {
    q: "What happens to my data if I delete my account?",
    a: "All scan results, profile information, and associated metadata are permanently removed from our systems within 48 hours. We retain only anonymised, aggregated analytics that cannot be linked back to you.",
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
    { "@type": "ListItem", position: 2, name: "Data Lifecycle", item: "https://footprintiq.lovable.app/data-lifecycle" },
  ],
};

export default function DataLifecycle() {
  return (
    <>
      <Helmet>
        <title>Data Lifecycle — How FootprintIQ Handles Your Data</title>
        <meta
          name="description"
          content="See exactly how FootprintIQ collects, processes, retains, and deletes your data. Plain-English summary, visual lifecycle diagram, and FAQ."
        />
        <link rel="canonical" href="https://footprintiq.lovable.app/data-lifecycle" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Navbar />

      <main className="min-h-screen bg-background text-foreground">
        {/* Hero */}
        <section className="pt-24 pb-12 px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Data Lifecycle</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transparency is a feature. Here's exactly what happens to your data — from the moment
            you submit a scan to the moment it's deleted.
          </p>
        </section>

        {/* Plain English Summary */}
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Plain English Summary
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">What we collect:</strong> Only the identifier you
                submit (username, email, phone, or domain) and the publicly available results we find.
              </li>
              <li>
                <strong className="text-foreground">Why we collect it:</strong> To generate your
                exposure report and give you actionable steps to reduce your digital footprint.
              </li>
              <li>
                <strong className="text-foreground">How long we keep it:</strong> Scan inputs are
                deleted within 2–5 minutes. Results are kept for up to 30 days for your review.
              </li>
              <li>
                <strong className="text-foreground">How to delete it:</strong> Delete individual
                scans or your entire account from the dashboard at any time — no ticket needed.
              </li>
            </ul>
          </div>
        </section>

        {/* Lifecycle Diagram */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-10">Data Lifecycle Diagram</h2>

          <div className="relative space-y-0">
            {steps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-4 relative">
                {/* Vertical connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center shrink-0 ${step.colour}`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-full min-h-[3rem] bg-border" />
                  )}
                </div>

                {/* Content */}
                <div className="pb-8">
                  <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-border rounded-lg p-5 bg-card">
                <h3 className="font-semibold mb-2">{f.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related links */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-xl font-bold mb-4">Related Policies</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { to: "/trust-safety", icon: Shield, label: "Trust & Safety" },
              { to: "/privacy", icon: FileText, label: "Privacy Policy" },
              { to: "/responsible-use", icon: Scale, label: "Responsible Use" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:shadow-elevated transition-shadow text-sm font-medium"
              >
                <link.icon className="w-5 h-5 text-primary shrink-0" />
                {link.label}
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>

        <ResponsibleUsePledge />
      </main>

      <Footer />
    </>
  );
}
