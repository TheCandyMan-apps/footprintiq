import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Quote, FileText, User, Mail, Download, Image } from "lucide-react";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { CitationWidget } from "@/components/CitationWidget";

export default function MediaKit() {
  const origin = "https://footprintiq.app";

  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "Research", item: `${origin}/research` },
      { "@type": "ListItem" as const, position: 3, name: "Media Kit" },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Media Kit & Citation Guide — FootprintIQ",
    description: "Press resources, citation guidelines, expert quotes, and brand assets for journalists and researchers covering FootprintIQ.",
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    mainEntityOfPage: `${origin}/research/media-kit`,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO
        title="Media Kit & Citation Guide"
        description="Press resources, citation guidelines, expert quotes, and brand assets for journalists and researchers covering FootprintIQ."
        canonical={`${origin}/research/media-kit`}
        ogType="article"
        schema={{ organization: organizationSchema, breadcrumbs }}
      />
      <JsonLd data={articleSchema} />
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12" id="fpiq-research-media">
          {/* Back link */}
          <Link
            to="/research/username-reuse-report-2026"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Research Report
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <FileText className="w-3 h-3 mr-1" />
              Media Kit
            </Badge>
            <Badge variant="outline">Press Resources</Badge>
          </div>

          {/* H1 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Media Kit & Citation Guide
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Resources for journalists, researchers, and publishers who wish to reference 
            FootprintIQ research in their work.
          </p>

          <Separator className="my-8" />

          {/* ── Citation Guidelines ── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Quote className="w-5 h-5 text-primary" />
              How to Cite FootprintIQ Research
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              All FootprintIQ research is published under{" "}
              <strong className="text-foreground">Creative Commons Attribution 4.0 (CC BY 4.0)</strong>. 
              You may share, adapt, and build upon the material for any purpose — including 
              commercial use — provided appropriate credit is given.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium text-foreground mb-2">APA Format</p>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  FootprintIQ Research. (2026). <em>2026 Username Reuse & Digital Exposure Report</em>. 
                  FootprintIQ. https://footprintiq.app/research/username-reuse-report-2026
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium text-foreground mb-2">Chicago / Footnote</p>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  FootprintIQ Research, "2026 Username Reuse & Digital Exposure Report," 
                  FootprintIQ, February 2026, https://footprintiq.app/research/username-reuse-report-2026.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium text-foreground mb-2">Inline Attribution (Articles & Blogs)</p>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  According to FootprintIQ Research (2026), [finding]. 
                  Source: footprintiq.app/research/username-reuse-report-2026
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="text-xs font-medium text-foreground mb-2">Broadcast / Verbal Attribution</p>
                <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                  "According to a 2026 report by FootprintIQ, an independent digital exposure research platform…"
                </p>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* ── Founder Bio ── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              About the Founder
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-base font-semibold text-foreground mb-1">Robin Clifford</p>
              <p className="text-sm text-primary mb-3">Founder, FootprintIQ</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Robin Clifford is the founder of FootprintIQ, an ethical digital footprint 
                intelligence platform. With a background in cybersecurity and open-source 
                intelligence, Robin built FootprintIQ to help individuals and organisations 
                understand their public exposure — without compromising privacy or ethics. 
                FootprintIQ's research focuses on username correlation, data broker trends, 
                and identity risk scoring using only publicly accessible data.
              </p>
            </div>
          </section>

          <Separator className="my-8" />

          {/* ── Pre-Written Expert Quotes ── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Quote className="w-5 h-5 text-primary" />
              Expert Quotes for Publication
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              The following quotes are pre-approved for use in articles, broadcasts, and 
              reports. Attribution to Robin Clifford, Founder of FootprintIQ, is required.
            </p>

            <div className="space-y-4">
              <figure className="rounded-xl border border-border bg-muted/10 p-6 relative">
                <Quote className="absolute top-4 right-4 w-5 h-5 text-primary/20" />
                <blockquote className="text-sm text-foreground leading-relaxed italic mb-3">
                  "Most people assume that if they haven't been hacked, their data is private. 
                  The reality is that a single reused username can connect dozens of accounts 
                  into a searchable profile — no breach required. It's not a security failure; 
                  it's a visibility problem that almost no one audits."
                </blockquote>
                <figcaption className="text-xs text-muted-foreground">
                  — Robin Clifford, Founder of FootprintIQ
                </figcaption>
              </figure>

              <figure className="rounded-xl border border-border bg-muted/10 p-6 relative">
                <Quote className="absolute top-4 right-4 w-5 h-5 text-primary/20" />
                <blockquote className="text-sm text-foreground leading-relaxed italic mb-3">
                  "Our research shows that 41% of automated people-search matches are false 
                  positives. The industry has a systemic accuracy problem — tools are built to 
                  show more results, not better results. That's why contextual verification 
                  matters more than raw match counts."
                </blockquote>
                <figcaption className="text-xs text-muted-foreground">
                  — Robin Clifford, Founder of FootprintIQ
                </figcaption>
              </figure>
            </div>
          </section>

          <Separator className="my-8" />

          {/* ── Press Logo Assets ── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Brand Assets
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Download official FootprintIQ logos for use in articles, presentations, and 
              press coverage. Please do not alter, recolour, or distort the logo.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">FP</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Primary Logo</p>
                <p className="text-xs text-muted-foreground mb-4">PNG, transparent background</p>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="https://storage.googleapis.com/gpt-engineer-file-uploads/2uSl18P0SSfJLWqHu910xv9mZBj1/uploads/1762544667872-FPIQ-Logo-X.png" download>
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-xl bg-foreground flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-background">FP</span>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Dark Background</p>
                <p className="text-xs text-muted-foreground mb-4">PNG, for dark contexts</p>
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href="https://storage.googleapis.com/gpt-engineer-file-uploads/2uSl18P0SSfJLWqHu910xv9mZBj1/uploads/1762544667872-FPIQ-Logo-X.png" download>
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </section>

          <Separator className="my-8" />

          {/* ── Contact ── */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Press & Media Contact
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground mb-4">
                For interview requests, data enquiries, fact-checking, or permission 
                queries beyond CC BY 4.0 scope:
              </p>
              <ul className="text-sm space-y-3">
                <li>
                  <strong className="text-foreground">Press Email:</strong>{" "}
                  <a href="mailto:press@footprintiq.app" className="text-primary hover:underline">
                    press@footprintiq.app
                  </a>
                </li>
                <li>
                  <strong className="text-foreground">General Enquiries:</strong>{" "}
                  <a href="mailto:hello@footprintiq.app" className="text-primary hover:underline">
                    hello@footprintiq.app
                  </a>
                </li>
                <li>
                  <strong className="text-foreground">Press Page:</strong>{" "}
                  <Link to="/press" className="text-primary hover:underline">
                    footprintiq.app/press
                  </Link>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4">
                Response time: within 24 hours on business days.
              </p>
            </div>
          </section>

          {/* ── Citation Widget ── */}
          <CitationWidget
            title="FootprintIQ Media Kit & Citation Guide"
            path="/research/media-kit"
            year="2026"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
