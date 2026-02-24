import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane, Newspaper, Briefcase, BookOpen, FileText, Shield } from "lucide-react";

const playbooks = [
  {
    title: "Pre-Travel Executive Exposure Check",
    description: "Audit an executive's digital exposure before international travel, conferences, or public appearances. Designed for EAs, security teams, and chief-of-staff roles.",
    href: "/playbooks/executive-travel-check",
    icon: Plane,
    audience: "Executives · Security Teams · EAs",
  },
  {
    title: "Journalist & Activist Risk Audit",
    description: "Assess your publicly visible digital footprint before sensitive investigations, field deployments, or public campaigns. Built for journalists, NGO workers, and activists.",
    href: "/playbooks/journalist-risk-audit",
    icon: Newspaper,
    audience: "Journalists · Activists · NGOs",
  },
  {
    title: "Pre-Employment Digital Exposure Review",
    description: "A compliance-aligned workflow for HR and security teams to ethically assess a candidate's or employee's public digital exposure — with full consent.",
    href: "/playbooks/pre-employment-exposure-review",
    icon: Briefcase,
    audience: "HR · Compliance · Security",
  },
];

const resources = [
  { title: "Ethical OSINT Framework", href: "/resources/ethical-osint-framework", icon: Shield },
  { title: "Doxxing Defence Guide", href: "/resources/doxxing-defense", icon: FileText },
  { title: "Digital Footprint Mapping", href: "/resources/digital-footprint-mapping", icon: BookOpen },
];

export default function PlaybooksHub() {
  const pageUrl = "https://footprintiq.app/playbooks";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "FootprintIQ Playbooks – Practical Exposure Workflows",
    description: "Step-by-step playbooks for executives, journalists, HR teams, and security professionals to audit digital exposure using ethical OSINT.",
    url: pageUrl,
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: playbooks.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `https://footprintiq.app${p.href}`,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>Playbooks – Exposure Workflows | FootprintIQ</title>
        <meta name="description" content="Practical, step-by-step playbooks for auditing digital exposure. Designed for executives, journalists, HR teams, and security professionals." />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Playbooks – Exposure Workflows | FootprintIQ" />
        <meta property="og:description" content="Practical playbooks for auditing digital exposure using ethical OSINT." />
        <meta property="og:url" content={pageUrl} />
      </Helmet>
      <JsonLd data={collectionSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <header className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <BookOpen className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Playbooks & Frameworks</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Exposure Audit Playbooks
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Step-by-step workflows for professionals who need to audit digital exposure — ethically, systematically, and with confidence.
            </p>
          </div>
        </header>

        {/* Playbook Cards */}
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-1">
            {playbooks.map((playbook) => {
              const Icon = playbook.icon;
              return (
                <Link
                  key={playbook.href}
                  to={playbook.href}
                  className="group block rounded-2xl border border-border/50 bg-card p-6 md:p-8 hover:border-accent/40 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-4 md:gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors mb-2">
                        {playbook.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-3">
                        {playbook.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-muted-foreground/70 bg-muted/50 px-2.5 py-1 rounded-full">
                          {playbook.audience}
                        </span>
                        <span className="text-sm font-medium text-accent flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Read playbook <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Advisory Resources */}
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Advisory Resources</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Reference-grade frameworks and checklists that professionals can adopt into their own security programmes. Licensed under CC BY 4.0 for use in your own playbooks.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link
                    key={resource.href}
                    to={resource.href}
                    className="group rounded-xl border border-border/50 bg-card p-5 hover:border-accent/40 transition-all duration-200"
                  >
                    <Icon className="w-5 h-5 text-accent mb-3" />
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                      {resource.title}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-8 text-center">
              <p className="text-lg font-semibold mb-2">Ready to run your first exposure audit?</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start with a free scan to understand your digital footprint, then follow the playbook that fits your role.
              </p>
              <Button asChild size="lg">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* About Block */}
        <section className="px-6 pb-16">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
