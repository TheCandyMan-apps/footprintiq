import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  ArrowRight,
  ChevronRight,
  UserSearch,
  RefreshCw,
  Fingerprint,
  Wrench,
  Scan,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/find-someone-by-username";

const faqs = [
  {
    q: "Can usernames reveal identity?",
    a: "Yes. When the same username appears across multiple platforms, investigators can cross-reference public profiles to build a composite picture — linking bios, photos, activity timestamps, and even real names. The more platforms a username appears on, the more identity data becomes available.",
  },
  {
    q: "How accurate are username searches?",
    a: "Accuracy varies by tool and technique. Automated scanners like Sherlock and Maigret check hundreds of platforms quickly but can produce false positives — for example, flagging a generic username that belongs to different people on different sites. Manual verification and cross-platform correlation significantly improve accuracy. FootprintIQ uses multi-tool pipelines with false-positive filtering to deliver high-confidence results.",
  },
  {
    q: "How do investigators track usernames?",
    a: "Investigators use a structured OSINT workflow: they start with a known username, run automated scans across hundreds of platforms, then correlate findings by comparing bios, profile photos, writing style, and activity patterns. Advanced techniques include metadata analysis, reverse image search, and timeline correlation to confirm whether accounts belong to the same individual.",
  },
];

const sections = [
  {
    icon: UserSearch,
    title: "Can You Find Someone by Username?",
    content: (
      <>
        <p>
          Yes — and it's more straightforward than most people realise. The average internet user reuses the same username across <strong className="text-foreground">three or more platforms</strong>, creating a traceable digital thread that connects otherwise separate online identities.
        </p>
        <p className="mt-3">
          This is known as <strong className="text-foreground">cross-platform identity correlation</strong>. When a username like <em>alex_designs</em> appears on Instagram, GitHub, Reddit, and a personal blog, each profile contributes data points — real names, photos, locations, interests, and social connections — that together form a detailed identity profile.
        </p>
        <p className="mt-3">
          Username reuse is one of the most common OSINT (Open Source Intelligence) entry points for investigators, journalists, and cybersecurity professionals. It's also a significant privacy risk for everyday users who don't realise how much their handle reveals. A{" "}
          <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link> can quickly surface these connected accounts.
        </p>
      </>
    ),
  },
  {
    icon: RefreshCw,
    title: "Why Usernames Reveal Identity",
    content: (
      <>
        <p>
          People choose usernames based on personal patterns — nicknames, birth years, hobbies, initials, or combinations of meaningful words. These patterns create <strong className="text-foreground">predictable reuse</strong> across platforms:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li><strong>Exact reuse</strong> — the same handle on every platform (e.g., <em>jsmith_92</em>)</li>
          <li><strong>Minor variations</strong> — adding underscores, numbers, or prefixes (e.g., <em>jsmith92</em>, <em>_jsmith_92</em>, <em>thejsmith92</em>)</li>
          <li><strong>Thematic consistency</strong> — different handles but consistent themes or keywords</li>
          <li><strong>Legacy handles</strong> — old usernames that still exist on abandoned accounts</li>
        </ul>
        <p className="mt-3">
          Even when a person uses different usernames, shared profile photos, similar bios, or overlapping follower networks can link accounts together. The combination of username reuse and public metadata makes it remarkably easy to trace someone's digital presence from a single starting point.
        </p>
      </>
    ),
  },
  {
    icon: Fingerprint,
    title: "How Investigators Trace Usernames",
    content: (
      <>
        <p>
          Professional OSINT investigators follow a structured workflow to trace usernames across the internet:
        </p>
        <ol className="list-decimal pl-6 space-y-3 mt-3">
          <li>
            <strong className="text-foreground">Initial enumeration</strong> — Automated tools scan the target username across 300–500+ platforms, identifying where accounts exist.
          </li>
          <li>
            <strong className="text-foreground">Profile analysis</strong> — Each discovered profile is examined for bios, display names, profile photos, post history, and linked accounts.
          </li>
          <li>
            <strong className="text-foreground">Cross-platform correlation</strong> — Findings are compared across platforms. Matching photos, similar bios, overlapping connections, or consistent writing styles confirm that accounts belong to the same person.
          </li>
          <li>
            <strong className="text-foreground">Metadata extraction</strong> — Timestamps, geotags, EXIF data from uploaded images, and timezone patterns provide additional identity signals.
          </li>
          <li>
            <strong className="text-foreground">Verification and reporting</strong> — Confirmed findings are documented with evidence, confidence scores, and source URLs for actionable intelligence.
          </li>
        </ol>
        <p className="mt-3">
          This process — from a single username to a comprehensive identity map — can take minutes with the right tools, or hours when manual verification is required for high-confidence results.
        </p>
      </>
    ),
  },
  {
    icon: Wrench,
    title: "Tools Used for Username Searches",
    content: (
      <>
        <p>
          Several open-source and commercial tools are used by investigators and security professionals to search for usernames across platforms:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-3">
          <li><strong className="text-foreground">Sherlock</strong> — Checks 400+ social networks for username availability. Fast and widely used, but can produce false positives on platforms that don't return clear signals.</li>
          <li><strong className="text-foreground">Maigret</strong> — An advanced fork of Sherlock with improved detection, tagging, and profile page analysis. Supports 2,500+ sites.</li>
          <li><strong className="text-foreground">WhatsMyName</strong> — Community-maintained username enumeration project with a focus on accuracy and reducing false positives.</li>
          <li><strong className="text-foreground">SpiderFoot</strong> — Broader OSINT automation platform that includes username search alongside email, IP, and domain reconnaissance.</li>
          <li><strong className="text-foreground">Holehe</strong> — Checks if an email address is registered on various platforms, useful for correlating email and username identities.</li>
        </ul>
        <p className="mt-3">
          For a detailed comparison of these tools, see our{" "}
          <Link to="/best-reverse-username-search-tools" className="text-primary hover:underline">best reverse username search tools</Link> guide. You can also explore common questions in the{" "}
          <Link to="/ai-answers-hub" className="text-primary hover:underline">AI Answers Hub</Link>.
        </p>
        <p className="mt-3">
          <Link to="/scan" className="text-primary hover:underline">FootprintIQ</Link> combines multiple tools in a single pipeline, applies false-positive filtering, and presents results in a clean, actionable dashboard — no technical setup required.
        </p>
      </>
    ),
  },
];

export default function FindSomeoneByUsername() {
  return (
    <>
      <Helmet>
        <title>Find Someone by Username – Trace Online Identities | FootprintIQ</title>
        <meta
          name="description"
          content="Learn how to find someone by username across 500+ platforms. Understand OSINT techniques, tools like Sherlock & Maigret, and cross-platform identity correlation."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Find Someone by Username – Trace Online Identities | FootprintIQ" />
        <meta property="og:description" content="Learn how investigators trace online identities using usernames across hundreds of public platforms." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to Find Someone by Username",
          description: "Learn how investigators trace online identities using usernames across hundreds of public platforms.",
          url: PAGE_URL,
          publisher: {
            "@type": "Organization",
            name: "FootprintIQ",
            url: "https://footprintiq.app",
          },
          datePublished: "2026-03-04",
          dateModified: "2026-03-04",
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
            { "@type": "ListItem", position: 2, name: "Find Someone by Username", item: PAGE_URL },
          ],
        }}
      />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <header className="py-20 md:py-28 px-6 text-center bg-gradient-to-b from-muted/40 to-background border-b border-border">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium">Find Someone by Username</span>
            </nav>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <UserSearch className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Username Investigation Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              How to Find Someone by Username
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Learn how investigators trace online identities using usernames across hundreds of public platforms.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Run a Free Username Scan
              </Link>
            </Button>
          </div>
        </header>

        {/* Sections */}
        {sections.map((section, i) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className={`py-16 px-6 ${i % 2 === 0 ? "bg-muted/30 border-y border-border" : ""}`}
            >
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Icon className="h-7 w-7 text-primary shrink-0" />
                  {section.title}
                </h2>
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
                  {section.content}
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA */}
        <section className="py-20 px-6 bg-accent/5">
          <div className="max-w-3xl mx-auto text-center">
            <Scan className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Run a Username Scan
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              FootprintIQ scans 500+ platforms to show you exactly where a username appears, what data is publicly visible, and how identities connect. Free, private, and ethical.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/scan">
                  Start Your Free Scan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/reverse-username-search-guide">
                  Read the Full OSINT Guide
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-lg px-5 bg-background">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* About + Related */}
        <div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
          <AboutFootprintIQBlock />
          <RelatedToolsGrid currentPath="/find-someone-by-username" />
        </div>
      </main>

      <Footer />
    </>
  );
}
