import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Search, ArrowRight, ChevronRight, AlertTriangle, Eye, Globe, Lock } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";

const FAQS = [
  {
    question: "Can I search someone's Facebook without being logged in?",
    answer: "Only limited public information may appear through search engines. Facebook's internal search requires authentication. Publicly indexed profiles, pages, and posts may be visible via Google using the site:facebook.com operator.",
  },
  {
    question: "Can I see private profiles without logging in?",
    answer: "No. Private accounts are restricted to approved connections only. No legitimate method can bypass Facebook's privacy settings to view restricted content without authentication.",
  },
  {
    question: "Why does Google show some Facebook profiles?",
    answer: "Because those profiles are set to public visibility. Facebook allows search engines to index profiles where the user has enabled public discoverability in their privacy settings.",
  },
  {
    question: "How can I remove my Facebook from Google?",
    answer: "Adjust your Facebook privacy settings: go to Settings → Privacy → 'Do you want search engines outside of Facebook to link to your profile?' and disable it. You can also use Google's removal request tool to accelerate cache expiration.",
  },
  {
    question: "How do I check my overall digital exposure?",
    answer: "Use a digital footprint scan to identify publicly visible accounts across Facebook and 500+ other platforms. FootprintIQ provides a structured exposure report showing exactly what's discoverable about you online.",
  },
];

export default function FacebookSearchWithoutLoginPage() {
  const origin = "https://footprintiq.app";
  const pageUrl = `${origin}/facebook-search-without-login`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      { "@type": "ListItem", position: 2, name: "Facebook Search Without Login", item: pageUrl },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Facebook Search Without Logging In – What's Possible in 2026?",
    description: "Understand what Facebook information is publicly accessible without logging in. Ethical methods, limitations, and how to check your own public exposure.",
    url: pageUrl,
    datePublished: "2026-02-27",
    dateModified: "2026-02-27",
    author: { "@type": "Organization", name: "FootprintIQ", url: origin },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "en",
  };

  return (
    <>
      <Helmet>
        <title>Facebook Search Without Login — What's Possible in 2026 | FootprintIQ</title>
        <meta name="description" content="Can you search Facebook without logging in? Learn what's publicly accessible, how Google indexes Facebook profiles, and how to check your own public exposure ethically." />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Facebook Search Without Login | FootprintIQ" />
        <meta property="og:description" content="What Facebook information is publicly accessible without an account. Ethical methods and limitations explained." />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-3xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Facebook Search Without Login</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="py-16 md:py-20 px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Facebook Search Without Logging In – What's Possible in 2026?
            </h1>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-3">
                Many people ask: <strong className="text-foreground">"Can I search Facebook without logging in?"</strong>
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                The short answer is: <strong className="text-foreground">not fully</strong> — but limited public information may still be accessible.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Facebook restricts most profile search functionality to logged-in users. However, some publicly available profiles, pages, and posts may still appear in external search engines.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              This guide explains what is possible, what is restricted, and how to check public exposure safely and legally.
            </p>
          </div>
        </header>

        {/* Article Body */}
        <article className="px-6 pb-16">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Section: Can You Search? */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Can You Search Facebook Without an Account?
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>Facebook's internal search bar requires login.</p>
                <p>However, you may still:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>View public business pages</li>
                  <li>See publicly indexed profiles</li>
                  <li>Access public posts indexed by search engines</li>
                  <li>View public Facebook groups (limited)</li>
                </ul>
                <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    Private profiles, friends lists, and restricted content <strong className="text-foreground">cannot</strong> be accessed without logging in. No legitimate method bypasses these restrictions.
                  </p>
                </div>
              </div>
            </section>

            {/* Section: Using Google */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Using Google to Search Public Facebook Profiles
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>You can use search operators such as:</p>
                <div className="rounded-lg bg-muted/50 border border-border p-4 font-mono text-sm text-foreground">
                  site:facebook.com [name]
                </div>
                <p>This may show:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Public pages</li>
                  <li>Public profiles</li>
                  <li>Public posts</li>
                  <li>Business listings</li>
                </ul>
                <p>
                  Results depend entirely on privacy settings. If a user has disabled search engine indexing in their Facebook privacy settings, their profile will not appear.
                </p>
              </div>
            </section>

            {/* Section: Why Public Profiles Matter */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Why Public Facebook Profiles Matter
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>Many users assume their profiles are private when they are not.</p>
                <p>Public exposure can include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Profile photo visibility</li>
                  <li>Public bio details</li>
                  <li>Tagged posts</li>
                  <li>Public comments</li>
                  <li>Location information</li>
                </ul>
                <p>
                  This contributes to your <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">digital footprint</Link>. If someone searches your name externally, they may see more than you expect.
                </p>
              </div>
            </section>

            {/* Section: How to Check */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                How to Check What's Publicly Visible About You
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Instead of manually checking multiple platforms, you can run a structured <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">digital footprint scan</Link>.
                </p>
                <p>A digital footprint scan analyses:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Public <Link to="/usernames" className="text-primary hover:underline">usernames</Link></li>
                  <li>Indexed social media accounts</li>
                  <li>Public mentions</li>
                  <li>Exposure patterns</li>
                </ul>
                <p>This gives you a clearer understanding of what information is publicly accessible — across Facebook and 500+ other platforms.</p>
              </div>
            </section>

            {/* Section: Is It Legal? */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Is It Legal to Search Facebook Without Logging In?
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>Viewing publicly available information is legal.</p>
                <p>However, the following may violate platform terms or laws:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Attempting to bypass login protections</li>
                  <li>Using scraping tools to access restricted data</li>
                  <li>Circumventing platform safeguards</li>
                </ul>
                <p>
                  Always use ethical, privacy-first methods. FootprintIQ's <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> defines clear boundaries for responsible digital research.
                </p>
              </div>
            </section>

            {/* CTA Block 1 */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
              <Eye className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Check What's Online About You</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                If you're concerned about what others can see, run a scan and review your exposure profile across Facebook and 500+ platforms.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link to="/scan">
                    Run a Free Scan <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/digital-footprint-scan">
                    Check Your Exposure
                  </Link>
                </Button>
              </div>
            </div>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {FAQS.map((faq, i) => (
                  <div key={i} className="p-6 rounded-xl bg-card border border-border/50">
                    <h3 className="font-semibold mb-2 text-foreground">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* About FootprintIQ */}
            <AboutFootprintIQBlock />

            {/* Citation Block */}
            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ is an independent, ethical digital footprint intelligence platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment and authorised research only.
              </p>
            </aside>

            {/* Internal Links */}
            <div className="text-center space-y-2 pt-4">
              <p className="text-sm text-muted-foreground">
                Related: <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link> · <Link to="/usernames" className="text-primary hover:underline">Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link>
              </p>
              <p className="text-sm text-muted-foreground">
                Guides: <Link to="/guides/facebook-search-without-login" className="text-primary hover:underline">In-Depth Facebook Search Guide</Link> · <Link to="/guides/check-whats-publicly-visible" className="text-primary hover:underline">Check What's Publicly Visible</Link>
              </p>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
