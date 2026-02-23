import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Lock, Eye, EyeOff, UserX, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { CreativeCommonsNotice } from "@/components/seo/CreativeCommonsNotice";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_TITLE = "Doxxing Defense Guide — How to Protect Yourself from Online Exposure";
const PAGE_DESCRIPTION = "A reference-grade guide to doxxing defense: what doxxing is, how it works, how to assess your risk, and step-by-step strategies to reduce your attack surface. Licensed CC BY 4.0.";
const PAGE_URL = "https://footprintiq.app/resources/doxxing-defense";

const attackVectors = [
  { title: "Username Correlation", desc: "Attackers search a known username across hundreds of platforms to build a cross-platform identity map. Even abandoned accounts leak metadata (join dates, profile photos, bio text) that can be correlated." },
  { title: "Email Enumeration", desc: "An email address is checked against breach databases and platform registration endpoints to discover which services a target has used — including dating sites, forums, and financial platforms." },
  { title: "Data Broker Aggregation", desc: "People-search sites (Spokeo, BeenVerified, TruePeopleSearch) aggregate public records, property data, phone numbers, and associates into easily accessible profiles." },
  { title: "Social Media Harvesting", desc: "Public posts, tagged photos, check-ins, friends lists, and bio details are scraped to build a comprehensive profile including workplace, routines, and relationships." },
  { title: "WHOIS & Domain Lookup", desc: "If a target owns a domain, WHOIS records may expose their real name, address, phone number, and email — even if the website itself is anonymous." },
  { title: "Reverse Image Search", desc: "A single photo can be reverse-searched to find every site where it appears, linking anonymous profiles to real identities." },
];

const defenseSteps = [
  { step: 1, title: "Audit Your Current Exposure", desc: "Before you can defend, you need to know what's already visible. Run a username and email scan to map your digital footprint across platforms, breaches, and data brokers.", link: "/scan", linkText: "Run a free scan" },
  { step: 2, title: "Remove Data Broker Listings", desc: "Submit opt-out requests to major data brokers. Focus on Spokeo, BeenVerified, Whitepages, TruePeopleSearch, and MyLife first. Most removals take 24–72 hours.", link: "/data-broker-opt-out-guide", linkText: "Data broker removal guide" },
  { step: 3, title: "Segment Your Identities", desc: "Use different usernames, email addresses, and profile photos for different contexts (professional, personal, anonymous). This prevents cross-platform correlation." },
  { step: 4, title: "Lock Down Social Media", desc: "Set all social profiles to private or friends-only. Remove location tags, disable public friends lists, and audit tagged photos. Restrict who can find you by email or phone number." },
  { step: 5, title: "Secure Domain Registrations", desc: "Enable WHOIS privacy protection on all domains you own. If WHOIS data has already been cached, submit removal requests to WHOIS history databases." },
  { step: 6, title: "Monitor Continuously", desc: "Exposure changes over time as new breaches occur and data brokers re-list information. Set up periodic scans to catch new exposure before attackers do." },
];

const faqs = [
  { q: "What is doxxing?", a: "Doxxing (or doxing) is the act of publicly revealing someone's private or identifying information — such as their real name, address, phone number, or workplace — without their consent, typically with malicious intent. The term comes from 'dropping documents' or 'docs'." },
  { q: "Is doxxing illegal?", a: "Doxxing itself is not explicitly illegal in most jurisdictions, but it often involves or enables illegal activities such as harassment, stalking, identity theft, or incitement to violence. Many jurisdictions have laws that criminalise the publication of personal information with intent to harm. The EU's GDPR also provides protections against non-consensual data publication." },
  { q: "How do I know if I've been doxxed?", a: "Signs include: receiving unexpected messages from strangers referencing personal details, finding your private information posted on forums or social media, sudden increases in harassment or spam, or being contacted by people you don't know who reference your address or workplace." },
  { q: "What should I do immediately if I'm doxxed?", a: "Document everything (screenshots with timestamps), report the content to the platform where it was posted, contact law enforcement if you feel threatened, alert your employer's security team if your workplace is exposed, and change passwords and enable 2FA on all accounts." },
  { q: "Can FootprintIQ help prevent doxxing?", a: "FootprintIQ maps your publicly visible digital footprint — the same data an attacker would find — and provides a prioritised remediation plan. By identifying and reducing your exposure proactively, you shrink the attack surface that doxxers exploit. It is the exposure intelligence layer that helps you act before an attacker does." },
  { q: "How is doxxing defense different from privacy?", a: "Privacy is a broad right. Doxxing defense is a specific, tactical practice: identifying what information about you is publicly accessible, assessing which data points are most dangerous if combined, and systematically reducing that exposure. It's proactive threat surface management." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({
    "@type": "Question",
    "name": f.q,
    "acceptedAnswer": { "@type": "Answer", "text": f.a }
  }))
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": PAGE_TITLE,
  "description": PAGE_DESCRIPTION,
  "author": { "@type": "Organization", "name": "FootprintIQ", "url": "https://footprintiq.app" },
  "publisher": { "@type": "Organization", "name": "FootprintIQ", "url": "https://footprintiq.app" },
  "datePublished": "2026-02-23",
  "dateModified": "2026-02-23",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "url": PAGE_URL,
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Defend Against Doxxing",
  "description": "A six-step process to assess and reduce your doxxing risk by mapping exposure, removing data broker listings, and segmenting identities.",
  "step": defenseSteps.map((s) => ({
    "@type": "HowToStep",
    "position": s.step,
    "name": s.title,
    "text": s.desc,
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://footprintiq.app" },
    { "@type": "ListItem", "position": 2, "name": "Resources", "item": "https://footprintiq.app/resources" },
    { "@type": "ListItem", "position": 3, "name": "Doxxing Defense Guide" },
  ]
};

export default function DoxxingDefenseGuide() {
  useScrollDepthTracking({ pageId: "doxxing-defense-guide" });

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={howToJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={buildWebPageSchema({ name: PAGE_TITLE, description: PAGE_DESCRIPTION, url: PAGE_URL })} />

      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-24 pb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink asChild><Link to="/resources">Resources</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Doxxing Defense Guide</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <section className="container mx-auto px-4 pb-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-accent" />
              <span className="text-sm font-medium text-accent uppercase tracking-wider">Reference Resource · CC BY 4.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Doxxing Defense Guide
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              A structured, neutral guide to understanding doxxing, assessing your risk, and systematically reducing your attack surface. Designed for individuals, journalists, activists, and security teams to reference, adapt, and share.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-4xl space-y-16">

            {/* What is doxxing */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">What Is Doxxing?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Doxxing (also spelled "doxing") is the act of publicly revealing someone's private or identifying information — such as their real name, home address, phone number, email, workplace, or family members — without their consent, typically with malicious intent. The term derives from "dropping documents" or "docs."
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Doxxing is a form of targeted harassment that can lead to real-world consequences: swatting, stalking, job loss, threats to physical safety, and psychological harm. It disproportionately affects journalists, activists, researchers, public figures, and marginalised communities.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The core defense is <strong>attack surface reduction</strong> — systematically minimising the amount of personal information that is publicly accessible and correlatable. This guide explains how.
              </p>
            </section>

            {/* Attack Vectors */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How Doxxing Works: Common Attack Vectors</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Understanding how doxxers find and correlate information is essential to defending against them. These are the most common techniques used to build identity profiles from public data.
              </p>
              <div className="grid gap-4">
                {attackVectors.map((v, i) => (
                  <Card key={i}>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground mb-1">{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Defense Steps */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Six-Step Doxxing Defense Plan</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Doxxing defense is not a one-time action — it is an ongoing practice of exposure monitoring and reduction. These six steps form a repeatable framework.
              </p>
              <div className="space-y-4">
                {defenseSteps.map((s) => (
                  <Card key={s.step}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <span className="w-9 h-9 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">{s.step}</span>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-2">{s.desc}</p>
                          {s.link && (
                            <Link to={s.link} className="text-sm text-accent hover:underline inline-flex items-center gap-1">
                              {s.linkText} <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* High-Risk Groups */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Who Is Most at Risk?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                While anyone can be doxxed, certain groups face disproportionate risk due to their public visibility, advocacy work, or the adversaries they encounter.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { group: "Journalists & Reporters", reason: "Investigative work creates adversaries who may attempt intimidation through exposure of personal details." },
                  { group: "Activists & NGO Workers", reason: "Advocacy on controversial issues attracts targeted harassment campaigns from opposing groups." },
                  { group: "LGBTQ+ Individuals", reason: "Exposure of identity or location can create safety risks in hostile environments." },
                  { group: "Domestic Abuse Survivors", reason: "Abusers may use public records and social media to locate and monitor victims." },
                  { group: "Online Content Creators", reason: "Public-facing personas attract obsessive followers who attempt to discover real identities." },
                  { group: "Security Researchers", reason: "Disclosing vulnerabilities creates adversarial relationships with threat actors." },
                ].map((g, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground text-sm mb-1">{g.group}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                For high-risk individuals, FootprintIQ provides detailed exposure analysis through its <Link to="/osint-for-high-risk-users" className="text-accent hover:underline">OSINT for High-Risk Users</Link> guide.
              </p>
            </section>

            {/* FAQs */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* CTA */}
            <section className="bg-accent/5 rounded-xl p-6 md:p-8 border border-accent/20">
              <h2 className="text-xl font-bold text-foreground mb-2">Map Your Exposure Before an Attacker Does</h2>
              <p className="text-muted-foreground mb-4">FootprintIQ scans the same public data sources that doxxers use — and gives you a plan to reduce what's visible.</p>
              <Link to="/scan" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-accent/90 transition-colors">
                Run a Free Scan <ArrowRight className="w-4 h-4" />
              </Link>
            </section>

            <CreativeCommonsNotice pageTitle="Doxxing Defense Guide" />
            <AboutFootprintIQBlock />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
