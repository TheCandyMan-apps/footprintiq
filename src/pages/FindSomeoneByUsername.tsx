import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
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
  Shield,
  Globe,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/find-someone-by-username";

const faqs = [
  {
    q: "Can you really find someone using just a username?",
    a: "Yes. When a person reuses the same handle across multiple platforms, automated OSINT tools can scan hundreds of websites in seconds and surface matching profiles. Cross-referencing bios, profile photos, and activity timestamps helps confirm whether those accounts belong to the same individual. The more platforms a username appears on, the more identity data becomes available.",
  },
  {
    q: "Is searching for someone by username legal?",
    a: "Searching publicly available information is generally legal in most jurisdictions. OSINT investigators access only data that platform users have made public — profile bios, posts, display names, and follower lists. However, using that information for harassment, stalking, or identity theft is illegal. Ethical OSINT platforms like FootprintIQ enforce responsible-use policies and never access private or authenticated data.",
  },
  {
    q: "How accurate are username search results?",
    a: "Accuracy depends on the tools used and the specificity of the username. Common handles like 'john123' may return hundreds of unrelated matches across platforms. Unique handles like 'nebula_coder_77' produce far more reliable results. Multi-tool pipelines with false-positive filtering — like those used by FootprintIQ — significantly improve accuracy by correlating profile metadata rather than relying on name matches alone.",
  },
  {
    q: "What information can a username reveal?",
    a: "A username can reveal linked social media profiles, real names, locations, email addresses, profile photos, interests, professional history, and social connections. When the same username appears on platforms like LinkedIn, GitHub, Instagram, and forum sites, an investigator can piece together a detailed identity map from publicly available data.",
  },
  {
    q: "How do I protect myself from username searches?",
    a: "Use different usernames on different platforms. Avoid embedding personal information like birth years, real names, or locations in your handles. Regularly audit your digital footprint with a tool like FootprintIQ to see where your usernames appear, and deactivate or rename accounts you no longer use.",
  },
  {
    q: "What is the difference between a username search and a reverse username search?",
    a: "A standard username search checks whether a specific handle exists on known platforms. A reverse username search goes further — it takes a known username and attempts to find all connected accounts, aliases, and identity data across the web. FootprintIQ supports both approaches in a single scan.",
  },
];

export default function FindSomeoneByUsername() {
  return (
    <>
      <Helmet>
        <title>Find Someone By Username – Locate Social Media Accounts | FootprintIQ</title>
        <meta
          name="description"
          content="Find someone by username across 500+ platforms. Learn how OSINT investigators locate someone online, find social media accounts by username, and trace digital identities."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Find Someone By Username – Locate Social Media Accounts | FootprintIQ" />
        <meta property="og:description" content="Learn how to find social media accounts by username using OSINT techniques and cross-platform scanning tools." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How To Find Someone Online Using A Username",
          description: "Learn how to find social media accounts by username using OSINT techniques and cross-platform scanning tools.",
          url: PAGE_URL,
          author: { "@type": "Organization", name: "FootprintIQ Research Team", url: "https://footprintiq.app" },
          publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
          datePublished: "2026-03-04",
          dateModified: "2026-03-07",
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
            { "@type": "ListItem", position: 2, name: "Find Someone By Username", item: PAGE_URL },
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
              <span className="text-foreground font-medium">Find Someone By Username</span>
            </nav>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <UserSearch className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Username Investigation Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              How To Find Someone Online Using A Username
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A username is often the fastest way to locate someone online. Learn how investigators find social media accounts by username, trace digital identities across platforms, and uncover connections hidden in public data.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Run a Free Username Scan
              </Link>
            </Button>
          </div>
        </header>

        {/* Section 1: Why Usernames Reveal Digital Identities */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <RefreshCw className="h-7 w-7 text-primary shrink-0" />
              Why Usernames Reveal Digital Identities
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Most people don't think of a username as sensitive information. It's just a handle — a label they chose years ago to sign up for a forum or social network. But in practice, usernames are one of the most powerful identifiers available in open-source intelligence. They're public, persistent, and almost always reused.
              </p>
              <p>
                Studies suggest the average internet user maintains accounts on more than <strong className="text-foreground">seven platforms</strong>, and a significant majority reuse the same username — or a close variation — across at least three of them. This behaviour creates what OSINT analysts call a <strong className="text-foreground">correlation chain</strong>: a sequence of linked accounts that, individually, reveal little, but together paint a detailed picture of someone's identity.
              </p>
              <p>
                Consider a username like <em>kai_builds_things</em>. If that handle appears on GitHub, it reveals coding skills and project history. On LinkedIn, it surfaces a professional profile. On Reddit, it exposes interests and opinions. On Instagram, it shows photos and locations. Each platform contributes a layer, and the username is the thread that binds them together.
              </p>
              <p>
                This is why a username investigation is often the first step in any OSINT workflow. Before searching emails, phone numbers, or images, experienced investigators start with the username — because it's the identifier most likely to produce immediate, cross-platform results. You can see this in action with a{" "}
                <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link>.
              </p>
              <p>
                People also embed personal details directly in their usernames: birth years (<em>sarah_1994</em>), locations (<em>mike_from_austin</em>), or professions (<em>drjones_dds</em>). These embedded signals provide additional identity markers that accelerate the investigation process.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: How Investigators Search Usernames */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Fingerprint className="h-7 w-7 text-primary shrink-0" />
              How Investigators Search Usernames
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Professional OSINT investigators follow a structured methodology when conducting a username investigation. The process moves from broad enumeration to targeted verification, ensuring both coverage and accuracy.
              </p>
              <p>
                <strong className="text-foreground">Step 1: Automated enumeration.</strong> The investigator inputs a target username into one or more scanning tools. These tools send HTTP requests to hundreds of platforms — checking profile pages, API endpoints, and registration systems to determine whether an account with that username exists. A single scan can cover 500+ websites in under a minute.
              </p>
              <p>
                <strong className="text-foreground">Step 2: False-positive filtering.</strong> Raw results from automated scans contain noise. Some platforms return generic pages for any username, others redirect all queries to a search page, and some reserve usernames without creating public profiles. Filtering removes these false signals, leaving only confirmed matches.
              </p>
              <p>
                <strong className="text-foreground">Step 3: Profile analysis.</strong> Each confirmed profile is examined. Investigators extract display names, bios, profile photos, post history, follower counts, and linked URLs. This metadata provides the raw material for identity correlation.
              </p>
              <p>
                <strong className="text-foreground">Step 4: Cross-platform correlation.</strong> The extracted data is compared across all discovered profiles. If the same profile photo appears on three platforms, if bios reference the same city, or if posting timestamps cluster in the same timezone, confidence increases that the accounts belong to a single individual.
              </p>
              <p>
                <strong className="text-foreground">Step 5: Documentation.</strong> Verified findings are compiled into a structured report with evidence links, confidence scores, and identity assessments. For a deeper dive into these techniques, see our{" "}
                <Link to="/how-investigators-trace-usernames" className="text-primary hover:underline">guide to how investigators trace usernames</Link>.
              </p>
              <p>
                <Link to="/usernames" className="text-primary hover:underline">FootprintIQ's username search tool</Link> automates steps 1–4, running multiple OSINT tools in parallel and presenting filtered, correlated results in a single dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Searching Social Media Platforms */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Globe className="h-7 w-7 text-primary shrink-0" />
              Searching Social Media Platforms
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Not every platform responds to username queries in the same way. Understanding how major social networks handle profile lookups is essential for efficient investigation.
              </p>
              <p>
                <strong className="text-foreground">Instagram</strong> provides public profiles accessible via direct URL (<em>instagram.com/username</em>). Profile bios, post counts, and follower numbers are visible without authentication. However, private accounts hide post content. Our{" "}
                <Link to="/search-instagram-username" className="text-primary hover:underline">Instagram username search</Link> guide covers platform-specific techniques.
              </p>
              <p>
                <strong className="text-foreground">Reddit</strong> profiles reveal post and comment history, karma scores, account age, and subreddit activity. Reddit's pseudonymous culture means users often share personal opinions and interests they wouldn't post elsewhere. See our{" "}
                <Link to="/search-reddit-username" className="text-primary hover:underline">Reddit username search</Link> guide for details.
              </p>
              <p>
                <strong className="text-foreground">GitHub</strong> exposes code repositories, commit histories, and — critically — commit email addresses. A single repository can reveal a developer's real name, employer, and contact information embedded in Git metadata. Explore our{" "}
                <Link to="/search-github-username" className="text-primary hover:underline">GitHub username search</Link> guide.
              </p>
              <p>
                <strong className="text-foreground">TikTok</strong> profiles show video content, follower counts, and bio links. Background details in videos — room layouts, window views, uniforms — can provide geolocation and lifestyle intelligence.
              </p>
              <p>
                <strong className="text-foreground">Discord, Telegram, and Snapchat</strong> are more challenging. These platforms prioritise privacy and don't expose profiles via direct URL. However, usernames from these services often appear in public directories, paste sites, and leaked databases, providing indirect pathways for investigation.
              </p>
              <p>
                FootprintIQ covers 500+ platforms — including niche forums, gaming networks, and professional communities — giving investigators comprehensive coverage that goes far beyond major social networks. Use the{" "}
                <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint scanner</Link> to see the full picture.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Risks Of Username Reuse */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Shield className="h-7 w-7 text-primary shrink-0" />
              Risks Of Username Reuse
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                Username reuse is the digital equivalent of leaving the same key under every doormat. Each platform you join with the same handle adds another node to your public identity graph — making it progressively easier for anyone to locate someone online.
              </p>
              <p>
                The risks are concrete and well-documented:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Identity correlation.</strong> Reusing a username across professional and personal platforms lets anyone connect your LinkedIn profile to your Reddit activity, your GitHub commits to your dating profile, or your forum posts to your real name.</li>
                <li><strong className="text-foreground">Credential stuffing.</strong> When a data breach exposes your username and password on one platform, attackers test the same credentials on hundreds of other sites. A shared username makes this attack trivial.</li>
                <li><strong className="text-foreground">Social engineering.</strong> Information gathered from multiple profiles gives attackers material for highly targeted phishing messages. If they know your employer from LinkedIn, your hobbies from Reddit, and your location from Instagram, a convincing pretext is easy to craft.</li>
                <li><strong className="text-foreground">Reputation risk.</strong> Opinions posted pseudonymously on a forum can be linked back to a professional identity. A username that felt anonymous when you created it may not stay that way.</li>
              </ul>
              <p>
                For a detailed analysis of these risks, read our guide on{" "}
                <Link to="/username-reuse-risks" className="text-primary hover:underline">username reuse risks</Link>. The core takeaway: every platform where your username appears is another data point available to anyone who knows how to search.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Tools That Help Identify Online Profiles */}
        <section className="py-16 px-6 bg-muted/30 border-y border-border">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Wrench className="h-7 w-7 text-primary shrink-0" />
              Tools That Help Identify Online Profiles
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                The OSINT community has developed a range of tools designed to find social media accounts by username. Each serves a different purpose and has distinct strengths:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong className="text-foreground">Sherlock</strong> — The most widely known username enumeration tool. Checks 400+ social networks using HTTP response analysis. Fast and open-source, but prone to false positives on platforms with ambiguous response codes.</li>
                <li><strong className="text-foreground">Maigret</strong> — A more advanced tool that supports 2,500+ sites with improved detection logic, profile page parsing, and tagging. It extracts structured data from discovered profiles, not just existence checks.</li>
                <li><strong className="text-foreground">WhatsMyName</strong> — A community-maintained project focused on accuracy. Its strength is a curated database of platform-specific detection rules that minimise false positives.</li>
                <li><strong className="text-foreground">SpiderFoot</strong> — A broader OSINT automation framework that includes username search alongside email, IP, domain, and dark web reconnaissance. Useful for comprehensive investigations that go beyond username lookup.</li>
                <li><strong className="text-foreground">Holehe</strong> — Checks whether an email address is registered on platforms. Valuable for correlating email and username identities when both are known.</li>
              </ul>
              <p>
                Each of these tools has limitations when used in isolation. Sherlock finds accounts but doesn't verify ownership. Maigret parses profiles but requires technical setup. WhatsMyName is accurate but limited in scope.
              </p>
              <p>
                <Link to="/scan" className="text-primary hover:underline">FootprintIQ</Link> solves this by combining multiple tools into a single, automated pipeline. It runs Sherlock, Maigret, WhatsMyName, and other scanners in parallel, applies intelligent false-positive filtering, correlates results across tools, and presents clean, actionable intelligence in a dashboard designed for both professionals and everyday users.
              </p>
              <p>
                For a side-by-side comparison, see our{" "}
                <Link to="/best-reverse-username-search-tools" className="text-primary hover:underline">best reverse username search tools</Link> guide, or explore the{" "}
                <Link to="/username-search-engine" className="text-primary hover:underline">username search engine</Link> to understand how multi-tool scanning works at scale.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-accent/5">
          <div className="max-w-3xl mx-auto text-center">
            <Scan className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Find Someone By Username Now
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              FootprintIQ scans 500+ platforms to show you exactly where a username appears, what data is publicly visible, and how identities connect across the web. Start a free, private, and ethical scan.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/scan">
                  Start Your Free Scan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/username-osint-techniques">
                  Explore OSINT Techniques
                </Link>
              </Button>
            </div>
            <EthicalOsintTrustBlock />
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
