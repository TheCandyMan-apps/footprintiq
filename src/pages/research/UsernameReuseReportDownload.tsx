import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText, Mail, BarChart3, Shield, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { CitationWidget } from "@/components/CitationWidget";
import { toast } from "sonner";

export default function UsernameReuseReportDownload() {
  const origin = "https://footprintiq.app";
  const [email, setEmail] = useState("");
  const [downloading, setDownloading] = useState(false);

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "Research", item: `${origin}/research` },
      { "@type": "ListItem" as const, position: 3, name: "2026 Report", item: `${origin}/research/username-reuse-report-2026` },
      { "@type": "ListItem" as const, position: 4, name: "Download" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Download: 2026 Username Reuse & Digital Exposure Report",
    author: { "@type": "Organization", name: "FootprintIQ Research" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    datePublished: "2026-02-02T00:00:00Z",
    description:
      "Download the full PDF version of FootprintIQ's independent research on cross-platform username reuse and digital exposure patterns.",
    mainEntityOfPage: `${origin}/research/username-reuse-report-2026-download`,
  };

  const handleDownload = () => {
    setDownloading(true);
    // In production this would hit an edge function to generate/serve the PDF
    toast.success("Your download will begin shortly.", {
      description: email
        ? "We'll also send a copy to your email."
        : "No email required — downloading now.",
    });
    setTimeout(() => {
      setDownloading(false);
      // Placeholder: open the report page as fallback until real PDF is wired
      window.open("/research/username-reuse-report-2026", "_blank");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Download: 2026 Username Reuse Report (PDF)"
        description="Download the full PDF version of FootprintIQ's 2026 research on username reuse, digital exposure, and identity correlation risks."
        canonical={`${origin}/research/username-reuse-report-2026-download`}
        ogType="article"
        schema={{ organization: organizationSchema, breadcrumbs }}
      />
      <JsonLd data={articleSchema} />
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12" id="fpiq-research-pdf">
          {/* Back link */}
          <Link
            to="/research/username-reuse-report-2026"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Full Report
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <FileText className="w-3 h-3 mr-1" />
              PDF Download
            </Badge>
            <Badge variant="outline">2026 Edition</Badge>
          </div>

          {/* H1 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Download the 2026 Username Reuse & Digital Exposure Report
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Get the complete research report as a professionally formatted PDF — 
            ideal for sharing with colleagues, citing in publications, or offline reading.
          </p>

          <Separator className="my-8" />

          {/* ── Key Statistics ── */}
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Key Findings at a Glance
          </h2>

          <div className="grid gap-4 md:grid-cols-3 mb-10">
            {[
              {
                stat: "4.2",
                unit: "platforms",
                desc: "Median public profiles linked to a single reused username",
              },
              {
                stat: "41%",
                unit: "false positives",
                desc: "Automated people-search matches that are unverified or incorrect",
              },
              {
                stat: "73%",
                unit: "broker linkage",
                desc: "Users reusing a username on 3+ platforms appear in data broker records",
              },
            ].map((item) => (
              <div
                key={item.unit}
                className="rounded-xl border border-border bg-card p-5 text-center"
              >
                <p className="text-3xl font-bold text-primary">{item.stat}</p>
                <p className="text-sm font-medium text-foreground mt-1">{item.unit}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── Report Summary ── */}
          <h2 className="text-xl font-semibold mb-4">What's in the Report</h2>
          <ul className="space-y-2 text-muted-foreground text-sm mb-10 list-disc pl-5">
            <li>Executive summary with headline statistics</li>
            <li>Research methodology and ethical framework</li>
            <li>Cross-platform username reuse frequency analysis</li>
            <li>False positive rates and namespace collision findings</li>
            <li>Dating and social media overlap patterns</li>
            <li>Data broker exposure trends and legacy indexing</li>
            <li>Identity risk scoring model overview</li>
            <li>Risk distribution snapshot with visual breakdowns</li>
            <li>Actionable exposure reduction checklist</li>
            <li>Full FAQ and citation guidelines</li>
          </ul>

          <Separator className="my-8" />

          {/* ── Download Section ── */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-10">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Download PDF
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              No account required. Optionally enter your email to receive a copy and future 
              research updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2 min-w-[180px]"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Preparing…" : "Download PDF"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              By downloading, you agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>
              . We never share your email.
            </p>
          </div>

          {/* ── Citation Guidelines ── */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Quote className="w-5 h-5 text-primary" />
              Citation Guidelines
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              This report is licensed under{" "}
              <strong>Creative Commons Attribution 4.0 (CC BY 4.0)</strong>. 
              You may share and adapt the material for any purpose, provided appropriate 
              credit is given.
            </p>

            <div className="rounded-lg border border-border bg-muted/20 p-4 mb-4">
              <p className="text-xs font-medium text-foreground mb-2">APA Format</p>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                FootprintIQ Research. (2026). <em>2026 Username Reuse & Digital Exposure Report</em>. 
                FootprintIQ. https://footprintiq.app/research/username-reuse-report-2026
              </p>
            </div>

            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-medium text-foreground mb-2">Inline Attribution</p>
              <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                According to FootprintIQ Research (2026), [finding]. Source: footprintiq.app
              </p>
            </div>
          </div>

          {/* ── Media Contact ── */}
          <div className="rounded-xl border border-border bg-muted/10 p-6 mb-10">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Media & Press Enquiries
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Journalists, researchers, and publishers are welcome to cite this report. 
              For interviews, data requests, or press enquiries:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <strong className="text-foreground">Email:</strong>{" "}
                <a href="mailto:press@footprintiq.app" className="text-primary hover:underline">
                  press@footprintiq.app
                </a>
              </li>
              <li>
                <strong className="text-foreground">Press Kit:</strong>{" "}
                <Link to="/press" className="text-primary hover:underline">
                  footprintiq.app/press
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Citation Widget ── */}
          <CitationWidget
            title="2026 Username Reuse & Digital Exposure Report"
            path="/research/username-reuse-report-2026"
            year="2026"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
