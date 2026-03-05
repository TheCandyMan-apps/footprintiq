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
  Eye,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/username-search";

const faqs = [
  {
    q: "What is a username search?",
    a: "A username search is the process of checking whether a specific username exists across multiple online platforms — social networks, forums, gaming sites, and more. It helps identify all public accounts linked to that handle, revealing a person's digital footprint.",
  },
  {
    q: "Can you really find someone by username?",
    a: "Yes. Most people reuse the same username across multiple platforms. By searching for a known handle, you can discover linked accounts, public profiles, and associated metadata — such as bios, profile photos, and activity timestamps — that together paint a detailed picture of someone's online presence.",
  },
  {
    q: "Is username search legal?",
    a: "Yes. Username search tools query publicly available information — the same data anyone can access through search engines. No login credentials are used, no private accounts are accessed, and no authentication is bypassed. It's a standard OSINT technique used by investigators, journalists, and privacy-conscious individuals.",
  },
  {
    q: "How accurate are username search tools?",
    a: "Accuracy depends on the tool and platform. Automated scanners can produce false positives — flagging a common username that belongs to different people on different sites. Tools like FootprintIQ use multi-tool pipelines with AI-powered false-positive filtering to deliver higher-confidence results.",
  },
  {
    q: "What tools are used for username searches?",
    a: "Popular tools include Sherlock (400+ sites), Maigret (2,500+ sites), WhatsMyName (community-maintained accuracy focus), and SpiderFoot (broader OSINT automation). FootprintIQ combines multiple tools into a single pipeline for comprehensive, filtered results.",
  },
  {
    q: "How does FootprintIQ differ from Sherlock or Maigret?",
    a: "Sherlock and Maigret are command-line tools designed for technical users. FootprintIQ wraps multiple OSINT tools into a single scan, applies false-positive filtering, and presents results in an accessible dashboard — no terminal or technical setup required.",
  },
];

export default function UsernameSearchPage() {
  return (
    <>
      <Helmet>
        <title>Username Search – Find Online Profiles by Username | FootprintIQ</title>
        <meta
          name="description"
          content="Search any username across 500+ platforms. Discover linked profiles, trace digital identities, and understand your exposure with free ethical OSINT tools."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Username Search – Find Online Profiles by Username | FootprintIQ" />
        <meta property="og:description" content="Search any username across 500+ platforms. Discover linked profiles and trace digital identities with ethical OSINT." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Username Search: Find Online Profiles Linked to a Username",
          description: "Learn how investigators trace usernames across websites to discover linked online profiles using ethical OSINT techniques.",
          url: PAGE_URL,
          publisher: {
            "@type": "Organization",
            name: "FootprintIQ",
            url: "https://footprintiq.app",
          },
          datePublished: "2026-03-05",
          dateModified: "2026-03-05",
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
            { "@type": "ListItem", position: 2, name: "Username Search", item: PAGE_URL },
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
              <span className="text-foreground font-medium">Username Search</span>
            </nav>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <UserSearch className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">OSINT Username Intelligence</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Username Search: Find Online Profiles Linked to a Username
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Learn how investigators trace usernames across websites to discover linked accounts, map digital identities, and assess exposure — using ethical OSINT techniques.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Run a Free Username Scan
              </Link>
            </Button>
          </div>
        </header>

        {/* Section 1 — What Is Username Search */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <UserSearch className="h-7 w-7 text-primary shrink-0" />
              What Is Username Search?
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                A <strong className="text-foreground">username search</strong> is the process of checking whether a specific handle exists across multiple online platforms — social networks, forums, marketplaces, gaming sites, and developer communities. It's one of the most fundamental techniques in{" "}
                <Link to="/what-is-osint" className="text-primary hover:underline">Open Source Intelligence (OSINT)</Link>.
              </p>
              <p>
                The average internet user maintains accounts on <strong className="text-foreground">7–10 platforms</strong>, often using the same or similar usernames. A username search exploits this pattern to discover all public profiles linked to a single handle — revealing bios, profile photos, post history, and social connections.
              </p>
              <p>
                Unlike searching on a single platform, a comprehensive username search queries <strong className="text-foreground">hundreds of sites simultaneously</strong>, building a complete map of someone's publicly visible online presence. This is the foundation of{" "}
                <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> — starting from a known username and working outward to{" "}
                <Link to="/find-someone-by-username" className="text-primary hover:underline">find someone by username</Link> across connected identities.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2 — Why Usernames Reveal Identity */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <RefreshCw className="h-7 w-7 text-primary shrink-0" />
              Why Usernames Reveal Identity
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                People create usernames based on deeply personal patterns — nicknames, birth years, hobbies, initials, or combinations of meaningful words. These patterns create <strong className="text-foreground">predictable reuse</strong> that investigators can leverage:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-foreground">Exact reuse</strong> — the same handle on every platform (e.g., <em>night_owl_dev</em>)</li>
                <li><strong className="text-foreground">Minor variations</strong> — adding underscores, numbers, or prefixes (e.g., <em>nightowldev</em>, <em>_night_owl_dev</em>, <em>thenightowldev</em>)</li>
                <li><strong className="text-foreground">Thematic consistency</strong> — different handles but consistent themes or keywords across platforms</li>
                <li><strong className="text-foreground">Legacy handles</strong> — old usernames that still exist on abandoned accounts, creating a historical trail</li>
              </ul>
              <p>
                Even when a person uses different usernames, shared <strong className="text-foreground">profile photos, similar bios, overlapping follower networks,</strong> and consistent writing styles can link accounts together. Research shows that{" "}
                <Link to="/research/username-reuse-statistics" className="text-primary hover:underline">over 60% of users reuse their primary username</Link> across three or more platforms — making cross-platform correlation remarkably effective.
              </p>
              <p>
                This reuse pattern is why a single username can serve as a powerful entry point for mapping someone's entire digital footprint. Learn more about{" "}
                <Link to="/what-can-a-username-reveal" className="text-primary hover:underline">what a username can reveal</Link>, or explore our guide on{" "}
                <Link to="/where-is-this-username-used" className="text-primary hover:underline">where a username is used</Link> across the web.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 — How Username Searches Work */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Fingerprint className="h-7 w-7 text-primary shrink-0" />
              How Username Searches Work
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Modern username search combines automated platform enumeration with intelligent correlation. Here's how the OSINT workflow operates:
              </p>
              <ol className="list-decimal pl-6 space-y-3 mt-3">
                <li>
                  <strong className="text-foreground">Platform enumeration</strong> — The target username is queried against 300–500+ platforms simultaneously. Each site returns a signal: the username exists, is available, or the response is ambiguous.
                </li>
                <li>
                  <strong className="text-foreground">Response analysis</strong> — Tools analyse HTTP status codes, page content, and error messages to distinguish genuine profiles from false positives (e.g., generic "user not found" pages that still return 200 OK).
                </li>
                <li>
                  <strong className="text-foreground">Profile correlation</strong> — Discovered profiles are compared across platforms. Matching profile photos, similar bios, overlapping connections, and consistent activity patterns confirm shared ownership.
                </li>
                <li>
                  <strong className="text-foreground">Metadata extraction</strong> — Timestamps, geolocation data, EXIF metadata from uploaded images, and timezone patterns provide additional identity signals.
                </li>
                <li>
                  <strong className="text-foreground">Confidence scoring</strong> — Each finding is assigned a confidence level based on the strength of the match, reducing noise and highlighting high-probability results.
                </li>
              </ol>
              <p>
                For more detail on this process, read our guide on{" "}
                <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline">how username search tools work</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 — Tools Used for Username Search */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Wrench className="h-7 w-7 text-primary shrink-0" />
              Tools Used for Username Search
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Several open-source and commercial tools power username searches across the OSINT community:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong className="text-foreground">Sherlock</strong> — The most popular open-source username checker, scanning 400+ social networks. Fast and widely adopted, but can produce false positives on platforms with weak response signals.</li>
                <li><strong className="text-foreground">Maigret</strong> — An advanced evolution of Sherlock with improved detection logic, tagging, profile page analysis, and support for 2,500+ sites. Considered more accurate for in-depth investigations.</li>
                <li><strong className="text-foreground">WhatsMyName</strong> — A community-maintained project focused on accuracy and reducing false positives through curated site definitions and response validation.</li>
                <li><strong className="text-foreground">SpiderFoot</strong> — A broader OSINT automation platform that includes username search alongside email, IP, domain, and phone number reconnaissance.</li>
                <li><strong className="text-foreground">Holehe</strong> — Checks if an email address is registered on various platforms — useful for correlating email-based and username-based identities.</li>
              </ul>
              <p>
                For a side-by-side comparison, see our{" "}
                <Link to="/best-reverse-username-search-tools" className="text-primary hover:underline">best reverse username search tools (2026)</Link> guide. FootprintIQ combines multiple tools into a single pipeline with{" "}
                <Link to="/ai-answers/are-username-search-tools-accurate" className="text-primary hover:underline">AI-powered false-positive filtering</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5 — Example Username Investigation */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Eye className="h-7 w-7 text-primary shrink-0" />
              Example Username Investigation
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Here's how a realistic username search unfolds. Suppose you want to check the exposure of the handle <strong className="text-foreground">pixel_wanderer</strong>:
              </p>

              <div className="bg-background border border-border rounded-xl p-6 mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Scan</h3>
                  <p>A multi-tool scan checks <em>pixel_wanderer</em> across 500+ platforms. Within seconds, matches appear on <strong className="text-foreground">Instagram, GitHub, Reddit, DeviantArt, Steam, and a personal blog</strong>.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Correlate</h3>
                  <p>The Instagram and GitHub profiles share the same avatar photo. The Reddit bio references "pixel art + hiking" — matching the DeviantArt bio. The personal blog links directly to the GitHub account.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Step 3: Analyse</h3>
                  <p>Activity timestamps cluster between 7–11 PM GMT, suggesting a UK timezone. The GitHub profile lists a real first name. The Steam profile includes a city-level location.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Step 4: Assess</h3>
                  <p>From a single username, six linked accounts are confirmed. Combined, they reveal a name, approximate location, professional interests, hobbies, and social connections — all from publicly available data.</p>
                </div>
              </div>

              <p className="mt-4">
                This scenario illustrates why username reuse is a significant privacy risk. A single handle can expose far more information than most users realise. Learn about the{" "}
                <Link to="/guides/username-reuse-risk" className="text-primary hover:underline">risks of username reuse</Link> and{" "}
                <Link to="/check-my-digital-footprint" className="text-primary hover:underline">check your own digital footprint</Link> to see what's publicly visible about you.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6 — CTA */}
        <section className="py-20 px-6 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <Scan className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Run a Username Scan
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              FootprintIQ scans 500+ platforms to show you exactly where a username appears, what data is publicly visible, and how identities connect across the web. Free, private, and ethical.
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
          <RelatedToolsGrid currentPath="/username-search" />
        </div>
      </main>

      <Footer />
    </>
  );
}
