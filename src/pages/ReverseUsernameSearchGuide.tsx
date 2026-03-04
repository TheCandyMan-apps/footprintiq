import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { JsonLd } from "@/components/seo/JsonLd";
import { GuideBackLink } from "@/components/guides/GuideBackLink";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Users,
  Eye,
  Fingerprint,
  Globe,
  XCircle,
  Wrench,
} from "lucide-react";

const faqs = [
  {
    question: "What is reverse username search?",
    answer:
      "Reverse username search is the process of taking a known username and checking it against hundreds of public platforms — social media, forums, developer sites, and communities — to find every account registered under that handle. It reveals where a username appears online without accessing private data.",
  },
  {
    question: "Can usernames reveal identity?",
    answer:
      "Yes. Most people reuse the same username across multiple platforms, creating a trail that can link profiles together. When the same handle appears on a social network, a coding forum, and a dating site, it paints a detailed picture of the person behind it — even without knowing their real name.",
  },
  {
    question: "How accurate are username search tools?",
    answer:
      "Accuracy varies by tool. Basic scrapers produce high false-positive rates because they only check if a URL resolves. Advanced tools like FootprintIQ use multi-layer verification — HTTP status codes, page-content analysis, and AI filtering — to confirm whether a profile genuinely belongs to the searched username, achieving significantly higher precision.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
    {
      "@type": "ListItem",
      position: 3,
      name: "Reverse Username Search Guide",
      item: "https://footprintiq.app/reverse-username-search-guide",
    },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Reverse Username Search: How to Find Profiles Linked to a Username",
  description:
    "Learn how investigators and researchers trace online identities using usernames across 500+ platforms.",
  author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-03-04",
  dateModified: "2026-03-04",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://footprintiq.app/reverse-username-search-guide",
  },
};

const mistakes = [
  {
    icon: XCircle,
    title: "Only checking top platforms",
    desc: "Limiting searches to mainstream sites misses niche forums, developer platforms, and legacy communities where older accounts still exist.",
  },
  {
    icon: AlertTriangle,
    title: "Ignoring false positives",
    desc: "A matching URL doesn't mean a matching profile. Without content verification, you'll waste time on accounts belonging to different people.",
  },
  {
    icon: XCircle,
    title: "Assuming one username = one person",
    desc: "Common handles like 'john123' appear on thousands of platforms. Cross-referencing profile details is essential before drawing conclusions.",
  },
  {
    icon: AlertTriangle,
    title: "Skipping variation checks",
    desc: "People often add underscores, numbers, or prefixes. Searching only the exact handle misses related accounts like 'john_doe_99'.",
  },
];

const tools = [
  {
    name: "FootprintIQ",
    desc: "Scans 500+ platforms with AI-powered false-positive filtering, risk scoring, and a structured remediation roadmap.",
    highlight: true,
  },
  {
    name: "Sherlock",
    desc: "Open-source CLI tool that checks username availability across 400+ sites. Fast but produces high false-positive rates without content verification.",
    highlight: false,
  },
  {
    name: "Maigret",
    desc: "Fork of Sherlock with expanded site coverage and tag-based filtering. Requires command-line experience to use effectively.",
    highlight: false,
  },
  {
    name: "WhatsMyName",
    desc: "Community-maintained project focused on username enumeration with a regularly updated site list and web interface.",
    highlight: false,
  },
  {
    name: "SpiderFoot",
    desc: "Full OSINT automation framework that includes username search as part of broader reconnaissance workflows.",
    highlight: false,
  },
];

export default function ReverseUsernameSearchGuide() {
  return (
    <>
      <Helmet>
        <title>Reverse Username Search – Find Linked Profiles by Username | FootprintIQ</title>
        <meta
          name="description"
          content="Learn how reverse username search works. Discover how investigators trace identities across 500+ platforms using ethical OSINT techniques."
        />
        <link rel="canonical" href="https://footprintiq.app/reverse-username-search-guide" />
        <meta
          property="og:title"
          content="Reverse Username Search – Find Linked Profiles by Username | FootprintIQ"
        />
        <meta
          property="og:description"
          content="How investigators and researchers trace online identities using reverse username search across 500+ public platforms."
        />
        <meta property="og:url" content="https://footprintiq.app/reverse-username-search-guide" />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 px-6 bg-gradient-to-b from-accent/5 via-background to-background">
          <div className="max-w-4xl mx-auto text-center">
            <GuideBackLink />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Search className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">OSINT Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Reverse Username Search
              <span className="block text-2xl md:text-3xl font-semibold text-muted-foreground mt-3">
                How to Find Profiles Linked to a Username
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Learn how investigators and researchers trace online identities using usernames across
              hundreds of public platforms — ethically and legally.
            </p>
            <Button asChild size="lg">
              <Link to="/scan">
                Try a Free Username Scan <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Section 1: What Is Reverse Username Search? */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Fingerprint className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">What Is Reverse Username Search?</h2>
            </div>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                A <strong>reverse username search</strong> is the process of taking a known username and
                systematically checking it against hundreds — or even thousands — of public websites to
                discover every account registered under that handle.
              </p>
              <p>
                Unlike a traditional people search that starts with a real name, reverse username search
                starts with a digital identifier. It maps a person's online presence by finding where the
                same handle appears across social media, forums, developer platforms, gaming communities,
                and more.
              </p>
              <p>
                This technique is a cornerstone of <Link to="/guides" className="text-accent hover:underline">Open Source Intelligence (OSINT)</Link> and
                is used by security professionals, journalists, and everyday users who want to
                understand their own digital exposure.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Why Usernames Reveal Identity */}
        <section className="py-16 px-6 bg-muted/20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Why Usernames Reveal Identity</h2>
            </div>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                Most people reuse the same username across multiple platforms. Research shows that over
                <strong> 60% of internet users</strong> maintain the same handle on three or more sites.
                This creates a discoverable pattern — a digital thread that connects otherwise unrelated
                accounts.
              </p>
              <p>
                When someone uses <code>alex_travels</code> on Instagram, Twitter, Reddit, and a travel
                forum, each profile adds a layer of information. Individually, each account might reveal
                little. Together, they can expose:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span>Interests, hobbies, and professional affiliations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span>Geographic location through check-ins and metadata</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span>Social connections and group memberships</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <span>Historical activity and abandoned accounts</span>
                </li>
              </ul>
              <p>
                This is why understanding <Link to="/guides/username-reuse-risk" className="text-accent hover:underline">username reuse risk</Link> is
                critical for anyone who cares about their online privacy.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How OSINT Investigators Use Username Searches */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">How OSINT Investigators Use Username Searches</h2>
            </div>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                For OSINT practitioners, a reverse username search is often the first step in an
                investigation. Here's a typical workflow:
              </p>
            </div>

            <div className="grid gap-6 mt-8">
              {[
                {
                  step: "1",
                  title: "Identify the seed username",
                  desc: "Start with a known handle from a tip, report, or initial discovery. This becomes the anchor for the entire search.",
                  icon: Search,
                },
                {
                  step: "2",
                  title: "Run a cross-platform scan",
                  desc: "Use automated tools to check the username against hundreds of platforms simultaneously, saving hours of manual work.",
                  icon: Globe,
                },
                {
                  step: "3",
                  title: "Filter and verify results",
                  desc: "Eliminate false positives by verifying profile content, creation dates, and activity patterns. AI-powered tools do this automatically.",
                  icon: Shield,
                },
                {
                  step: "4",
                  title: "Correlate and analyse",
                  desc: "Cross-reference findings to build a profile map — connecting usernames to platforms, interests, and digital behaviours.",
                  icon: Fingerprint,
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-accent/30 transition-colors"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent font-bold text-lg shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 prose prose-lg text-muted-foreground">
              <p>
                Professional investigators also check for username <strong>variations</strong> — adding
                numbers, underscores, or prefixes — to catch related accounts that share the same
                operator but use slightly different handles.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Common Mistakes */}
        <section className="py-16 px-6 bg-muted/20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Common Mistakes When Searching Usernames</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Even experienced researchers fall into these traps. Avoid them to get reliable results.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {mistakes.map((m) => (
                <div
                  key={m.title}
                  className="p-6 rounded-2xl bg-gradient-card border border-border/50"
                >
                  <m.icon className="w-6 h-6 text-destructive mb-3" />
                  <h3 className="font-semibold text-lg mb-2">{m.title}</h3>
                  <p className="text-muted-foreground text-sm">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 5: Tools Used for Reverse Username Searches */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Wrench className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Tools Used for Reverse Username Searches</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Several OSINT tools specialise in reverse username search. Here's how the most popular
              options compare.
            </p>
            <div className="space-y-4">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className={`p-6 rounded-2xl border transition-colors ${
                    tool.highlight
                      ? "bg-accent/5 border-accent/30 shadow-[0_0_20px_rgba(0,230,230,0.08)]"
                      : "bg-gradient-card border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{tool.name}</h3>
                    {tool.highlight && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{tool.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-6">
              For a detailed comparison, see our{" "}
              <Link to="/best-reverse-username-search-tools" className="text-accent hover:underline">
                best reverse username search tools
              </Link>{" "}
              review.
            </p>
          </div>
        </section>

        {/* Section 6: CTA — Run a Username Scan */}
        <section className="py-20 px-6 bg-gradient-to-b from-accent/5 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Search className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Run a Username Scan</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              See where a username appears across 500+ public platforms. Free, instant, and no signup
              required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/scan">
                  Start Free Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/reverse-username-search">
                  Reverse Username Scanner <Search className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-gradient-card border border-border/50 hover:border-accent/50 rounded-2xl px-8 shadow-sm hover:shadow-[0_0_20px_rgba(0,230,230,0.1)] transition-all duration-300"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <EthicalOsintTrustBlock />
        <RelatedToolsGrid currentPath="/reverse-username-search-guide" />
        <AboutFootprintIQBlock />
      </main>

      <Footer />
    </>
  );
}
