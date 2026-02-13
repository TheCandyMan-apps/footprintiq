import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, Shield, Eye, Scale, Globe, Lock } from "lucide-react";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";

export default function WhatIsOsintBlog() {
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "What Is OSINT?" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "What Is OSINT? A Complete Beginner's Guide",
    description: "Learn what OSINT (Open-Source Intelligence) is, how it works, real-world examples, legal considerations, and how individuals can use it safely and ethically.",
    datePublished: "2026-02-13T09:00:00Z",
    dateModified: "2026-02-13T09:00:00Z",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: {
      "@type": "Organization",
      name: "FootprintIQ",
      logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" }
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/blog/what-is-osint" },
    keywords: "OSINT, open source intelligence, ethical OSINT, OSINT definition, OSINT examples, OSINT legal, digital footprint"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does OSINT stand for?",
        acceptedAnswer: { "@type": "Answer", text: "OSINT stands for Open-Source Intelligence. It refers to the collection and analysis of information from publicly available sources such as websites, social media profiles, public records, and forums." }
      },
      {
        "@type": "Question",
        name: "Is OSINT legal?",
        acceptedAnswer: { "@type": "Answer", text: "Yes, OSINT is legal when it involves gathering information from publicly accessible sources without bypassing authentication, impersonation, or violating terms of service. The legality depends on how the information is collected and used, not the practice itself." }
      },
      {
        "@type": "Question",
        name: "How is OSINT different from surveillance?",
        acceptedAnswer: { "@type": "Answer", text: "OSINT analyses information that is already publicly available. Surveillance involves actively monitoring individuals, often covertly and over time. OSINT is a snapshot of public data; surveillance is continuous and invasive." }
      },
      {
        "@type": "Question",
        name: "Can I use OSINT to check my own digital footprint?",
        acceptedAnswer: { "@type": "Answer", text: "Absolutely. Self-auditing is one of the most common and ethical uses of OSINT. Tools like FootprintIQ help you discover what information about you is publicly visible, so you can take steps to reduce your exposure." }
      },
      {
        "@type": "Question",
        name: "What tools are used for OSINT?",
        acceptedAnswer: { "@type": "Answer", text: "Common OSINT tools include username search engines, breach notification databases, data broker checkers, social media analysers, and domain/IP lookup services. FootprintIQ combines multiple OSINT techniques into a single platform focused on ethical analysis." }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="What Is OSINT? A Complete Beginner's Guide | FootprintIQ"
        description="Learn what OSINT (Open-Source Intelligence) is, how it works, real-world examples, legal considerations, and how individuals can use it safely and ethically."
        canonical="https://footprintiq.app/blog/what-is-osint"
        article={{
          publishedTime: "2026-02-13T09:00:00Z",
          modifiedTime: "2026-02-13T09:00:00Z",
          author: "FootprintIQ",
          tags: ["OSINT", "Privacy", "Cybersecurity", "Digital Footprint"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs,
          custom: [articleSchema, faqSchema]
        }}
      />

      <Header />

      <main className="flex-1">
        <article className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">

              {/* Back link */}
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Link>

              {/* Header */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary">Beginner Guide</Badge>
                  <span className="text-sm text-muted-foreground">13 Feb 2026</span>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">12 min read</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                  What Is OSINT? A Complete Beginner's Guide
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Open-Source Intelligence is one of the most powerful — and most misunderstood — disciplines in cybersecurity. 
                  This guide explains what OSINT actually is, how it works, where the legal boundaries lie, and how you can 
                  use it ethically to understand your own digital exposure.
                </p>
              </div>

              {/* Definition of OSINT */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Search className="w-6 h-6 text-primary" />
                  Definition of OSINT
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  OSINT — Open-Source Intelligence — is the practice of collecting and analysing information from publicly 
                  available sources to produce actionable insights. The term originates from military and government 
                  intelligence, where analysts have long distinguished between classified intelligence and information 
                  anyone can access.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "Publicly available" is the key phrase. OSINT does not involve hacking, bypassing login pages, intercepting 
                  communications, or accessing restricted databases. It works exclusively with data that is already visible 
                  to anyone who looks — social media profiles, forum posts, domain registration records, public court filings, 
                  news articles, and more.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  In the cybersecurity world, OSINT has become an essential methodology for threat intelligence, vulnerability 
                  assessment, incident response, and — increasingly — personal privacy auditing. Understanding what information 
                  about you is publicly accessible is the first step toward controlling your digital footprint.
                </p>

                <BlogCallout type="info" title="The Intelligence Cycle">
                  OSINT follows the same intelligence cycle used in professional analysis: requirements definition, collection, 
                  processing, analysis, and dissemination. What makes it "open source" is simply that the raw data comes from 
                  publicly accessible channels rather than classified or proprietary ones.
                </BlogCallout>
              </section>

              {/* How OSINT Works */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  How OSINT Works
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  At its core, OSINT is a structured approach to answering questions using public information. Rather than 
                  casually browsing the web, OSINT practitioners follow a deliberate methodology designed to produce reliable, 
                  verifiable findings.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The process typically involves several phases:
                </p>

                <div className="space-y-4 mb-6">
                  <Card className="p-5 border-border">
                    <h3 className="font-semibold text-foreground mb-2">1. Define the Question</h3>
                    <p className="text-sm text-muted-foreground">
                      Every investigation starts with a clear objective. "What public accounts exist under this username?" is 
                      an OSINT question. "What is someone's private email password?" is not — that crosses into illegal territory.
                    </p>
                  </Card>
                  <Card className="p-5 border-border">
                    <h3 className="font-semibold text-foreground mb-2">2. Identify Sources</h3>
                    <p className="text-sm text-muted-foreground">
                      Analysts determine which public sources are relevant. For a username investigation, this might include 
                      social media platforms, code repositories, gaming networks, forums, and public databases.
                    </p>
                  </Card>
                  <Card className="p-5 border-border">
                    <h3 className="font-semibold text-foreground mb-2">3. Collect Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Data is gathered from identified sources using search engines, specialised tools, and manual review. 
                      Tools like <Link to="/username-search-tools" className="text-primary hover:underline">username search engines</Link> automate 
                      this by checking hundreds of platforms simultaneously.
                    </p>
                  </Card>
                  <Card className="p-5 border-border">
                    <h3 className="font-semibold text-foreground mb-2">4. Analyse and Correlate</h3>
                    <p className="text-sm text-muted-foreground">
                      Raw data is cross-referenced and evaluated for accuracy. A username match on a platform doesn't 
                      necessarily mean it belongs to the person being investigated — false positives are common and must 
                      be filtered out through contextual analysis.
                    </p>
                  </Card>
                  <Card className="p-5 border-border">
                    <h3 className="font-semibold text-foreground mb-2">5. Report Findings</h3>
                    <p className="text-sm text-muted-foreground">
                      Results are compiled with confidence indicators, source attribution, and context. Ethical OSINT 
                      always distinguishes between confirmed findings and unverified indicators.
                    </p>
                  </Card>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  This structured approach is what separates OSINT from casual internet searching. The methodology matters 
                  as much as the tools — without rigorous process, results are unreliable and potentially misleading.
                </p>
              </section>

              {/* Examples of OSINT */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  Examples of OSINT
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  OSINT is used across a wide range of legitimate contexts. Here are some real-world applications where 
                  publicly available information drives important decisions:
                </p>

                <div className="grid gap-4 mb-6">
                  <div className="p-5 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Corporate Threat Intelligence</h3>
                    <p className="text-sm text-muted-foreground">
                      Security teams use OSINT to identify leaked credentials, exposed company data, phishing infrastructure, 
                      and impersonation attempts — all using publicly accessible sources like paste sites, code repositories, 
                      and domain registration databases.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Journalism and Investigations</h3>
                    <p className="text-sm text-muted-foreground">
                      Investigative journalists rely on OSINT to verify claims, trace financial networks, and fact-check 
                      information. Organisations like Bellingcat have demonstrated how public data analysis can uncover 
                      significant findings that traditional reporting methods miss.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Personal Privacy Auditing</h3>
                    <p className="text-sm text-muted-foreground">
                      Individuals use OSINT techniques to understand their own digital exposure — discovering old accounts, 
                      checking for data broker listings, and identifying where their personal information appears online. 
                      A <Link to="/digital-footprint-check" className="text-primary hover:underline">digital footprint check</Link> is 
                      one of the most accessible forms of personal OSINT.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Due Diligence and Compliance</h3>
                    <p className="text-sm text-muted-foreground">
                      Financial institutions and legal teams use OSINT for background research, sanctions screening, and 
                      regulatory compliance. This typically involves checking public records, corporate filings, and 
                      media coverage — all legitimately accessible information.
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-muted/50 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">Academic and Policy Research</h3>
                    <p className="text-sm text-muted-foreground">
                      Researchers use OSINT methodologies to study social media trends, analyse public discourse, and 
                      inform policy decisions. The transparency of the methodology makes findings reproducible and verifiable.
                    </p>
                  </div>
                </div>

                <BlogPullQuote>
                  OSINT doesn't create information that wasn't already public. It organises, correlates, and contextualises 
                  what's already visible — making patterns apparent that would otherwise remain hidden in plain sight.
                </BlogPullQuote>
              </section>

              {/* Is OSINT Legal? */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Scale className="w-6 h-6 text-primary" />
                  Is OSINT Legal?
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes — OSINT itself is legal. Accessing publicly available information is a fundamental part of how the 
                  internet works. Search engines, academic researchers, journalists, and security professionals all rely 
                  on public data collection as part of their work.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  However, legality depends on <strong className="text-foreground">how</strong> information is collected 
                  and <strong className="text-foreground">what it's used for</strong>. Several important boundaries exist:
                </p>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">No bypassing authentication.</strong> Accessing accounts, systems, or data behind login pages is not OSINT — it's unauthorised access and potentially illegal under computer fraud laws.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">No impersonation.</strong> Creating fake profiles or pretending to be someone else to extract information crosses ethical and legal lines.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Respect terms of service.</strong> Many platforms prohibit automated scraping. Ethical OSINT practitioners respect these boundaries.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Data protection laws apply.</strong> In jurisdictions like the EU (GDPR) and UK, collecting and processing personal data — even if publicly available — must comply with data protection regulations.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">Intent matters.</strong> Using OSINT for harassment, stalking, doxxing, or any form of intimidation is illegal regardless of whether the underlying data is public.</span>
                  </li>
                </ul>

                <BlogCallout type="warning" title="Legal Disclaimer">
                  This guide provides general educational information about OSINT. It is not legal advice. Laws vary by 
                  jurisdiction, and specific use cases may have additional legal requirements. When in doubt, consult a 
                  qualified legal professional.
                </BlogCallout>
              </section>

              {/* OSINT vs Surveillance */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Eye className="w-6 h-6 text-primary" />
                  OSINT vs Surveillance
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  One of the most important distinctions in this space is the difference between OSINT and surveillance. 
                  They are fundamentally different in method, scope, and ethics — though they are frequently conflated.
                </p>

                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold text-foreground">Characteristic</th>
                        <th className="text-left p-4 font-semibold text-foreground">OSINT</th>
                        <th className="text-left p-4 font-semibold text-foreground">Surveillance</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">Data source</td>
                        <td className="p-4">Publicly accessible</td>
                        <td className="p-4">Often private or restricted</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/20">
                        <td className="p-4 font-medium text-foreground">Duration</td>
                        <td className="p-4">Point-in-time snapshot</td>
                        <td className="p-4">Continuous monitoring</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">Consent</td>
                        <td className="p-4">User-initiated (in ethical use)</td>
                        <td className="p-4">Typically without knowledge</td>
                      </tr>
                      <tr className="border-t border-border bg-muted/20">
                        <td className="p-4 font-medium text-foreground">Scope</td>
                        <td className="p-4">Bounded by defined questions</td>
                        <td className="p-4">Broad, often unbounded</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="p-4 font-medium text-foreground">Transparency</td>
                        <td className="p-4">Methods are reproducible</td>
                        <td className="p-4">Methods are concealed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ethical OSINT platforms like FootprintIQ operate firmly on the OSINT side of this divide. Scans are 
                  user-initiated, results reflect a point-in-time snapshot of public data, and the methodology is transparent. 
                  There is no continuous monitoring, no covert data collection, and no access to private information.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This distinction matters because it defines the ethical framework within which OSINT operates. When tools 
                  cross the line into surveillance — continuous tracking, covert collection, accessing private data — they 
                  cease to be OSINT tools, regardless of how they market themselves.
                </p>
              </section>

              {/* How Individuals Can Use OSINT Safely */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  How Individuals Can Use OSINT Safely
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You don't need to be a cybersecurity professional to benefit from OSINT. In fact, one of the most 
                  valuable applications is personal privacy auditing — using OSINT techniques to understand and manage 
                  your own digital exposure.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Here's how to approach it responsibly:
                </p>

                <div className="space-y-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Start with a Self-Audit</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Search for your own usernames, email addresses, and name combinations. A{" "}
                      <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link>{" "}
                      reveals which platforms have public profiles associated with your identity, where your information 
                      appears in data broker listings, and whether your email has been involved in known breaches.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Understand What You Find</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Not every result is cause for alarm. A username match doesn't necessarily mean it's your account. 
                      Context matters — look at profile creation dates, associated content, and platform type. Confidence 
                      scoring helps distinguish genuine matches from coincidental ones.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Take Measured Action</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Once you understand your exposure, prioritise actions: close unused accounts, update privacy settings 
                      on active profiles, opt out of data broker listings, and consider varying your usernames across 
                      platforms to reduce cross-platform linkability.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Revisit Periodically</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Your digital footprint changes over time. New data broker listings appear, old accounts resurface in 
                      breach datasets, and platform privacy policies evolve. Regular self-audits help you stay informed 
                      without resorting to continuous monitoring.
                    </p>
                  </div>
                </div>

                <BlogCallout type="info" title="Self-Audit, Not Surveillance">
                  The key principle: use OSINT to understand your own exposure and make informed decisions. Ethical OSINT 
                  is about awareness and control — not monitoring others or invading privacy.
                </BlogCallout>
              </section>

              {/* FAQs */}
              <section className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      q: "What does OSINT stand for?",
                      a: "OSINT stands for Open-Source Intelligence. It refers to the collection and analysis of information from publicly available sources such as websites, social media profiles, public records, and forums."
                    },
                    {
                      q: "Is OSINT legal?",
                      a: "Yes, OSINT is legal when it involves gathering information from publicly accessible sources without bypassing authentication, impersonation, or violating terms of service. The legality depends on how the information is collected and used, not the practice itself."
                    },
                    {
                      q: "How is OSINT different from surveillance?",
                      a: "OSINT analyses information that is already publicly available. Surveillance involves actively monitoring individuals, often covertly and over time. OSINT is a point-in-time snapshot of public data; surveillance is continuous and invasive."
                    },
                    {
                      q: "Can I use OSINT to check my own digital footprint?",
                      a: "Absolutely. Self-auditing is one of the most common and ethical uses of OSINT. Tools like FootprintIQ help you discover what information about you is publicly visible, so you can take steps to reduce your exposure."
                    },
                    {
                      q: "What tools are used for OSINT?",
                      a: "Common OSINT tools include username search engines, breach notification databases, data broker checkers, social media analysers, and domain/IP lookup services. FootprintIQ combines multiple OSINT techniques into a single platform focused on ethical analysis."
                    }
                  ].map((faq, i) => (
                    <Card key={i} className="p-5 border-border">
                      <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="mb-12 p-8 md:p-10 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Check Your Digital Footprint
                </h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                  See what's publicly visible about you. Run a free scan to discover exposed accounts, 
                  data broker listings, and breach indicators.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/scan">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      <Search className="w-4 h-4" />
                      Run Free Scan
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/username-search-tools">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Username Search Tools
                    </Button>
                  </Link>
                </div>
              </section>

              {/* Citation */}
              <div className="mb-12 p-5 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Cite this page</p>
                <p>
                  FootprintIQ. "What Is OSINT? A Complete Beginner's Guide." FootprintIQ Blog, 13 Feb 2026.{" "}
                  <span className="text-primary">https://footprintiq.app/blog/what-is-osint</span>
                </p>
              </div>

              {/* Related Articles */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/osint-beginners-guide" className="group">
                    <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                      <Badge className="mb-3 bg-primary/10 text-primary">Beginner</Badge>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                        OSINT for Beginners: Open-Source Intelligence Explained
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        A practical introduction to OSINT tools and techniques.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog/what-is-osint-risk" className="group">
                    <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                      <Badge className="mb-3 bg-primary/10 text-primary">Deep Dive</Badge>
                      <h3 className="text-lg font-semibold group-hover:text-primary transition-colors mb-2">
                        What Is OSINT Risk? Understanding Your Digital Exposure
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        How OSINT reveals your attack surface and exposure patterns.
                      </p>
                    </Card>
                  </Link>
                </div>
              </section>

            </div>
          </div>
        </article>

        <RelatedToolsGrid currentPath="/blog/what-is-osint" />
      </main>

      <Footer />
    </div>
  );
}
