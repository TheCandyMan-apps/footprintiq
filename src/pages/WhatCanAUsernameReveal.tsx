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
  User,
  Link2,
  Image,
  MapPin,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

const PAGE_URL = "https://footprintiq.app/what-can-a-username-reveal";

const faqs = [
  {
    q: "What information can someone find from my username?",
    a: "A username can reveal public profiles, linked social media accounts, photos, bio information, activity timestamps, interests, and — through cross-platform correlation — potentially your real identity, location, and professional history. The more platforms where the same username appears, the more data becomes available.",
  },
  {
    q: "Can someone find my real name from a username?",
    a: "In many cases, yes. If the same username is linked to a platform where your real name is displayed (such as LinkedIn, Facebook, or a professional site), correlation across platforms can connect an anonymous handle to a real identity. FootprintIQ research shows 41% of usernames appear on three or more platforms, making this a realistic risk.",
  },
  {
    q: "Can photos from one account be linked to another through a username?",
    a: "Yes. If the same profile photo or similar images are used across accounts sharing a username, reverse image search and visual comparison can confirm identity links. Even different photos of the same person can be matched using facial recognition techniques available to investigators.",
  },
  {
    q: "How do I check what my username reveals about me?",
    a: "Run a free username scan on FootprintIQ to see which platforms your handle appears on and what data is publicly visible. The scan checks 500+ platforms and provides confidence scores for each finding.",
  },
  {
    q: "Is it possible to hide my identity if I use the same username everywhere?",
    a: "It becomes very difficult. Each platform adds data points that can be cross-referenced. The most effective approach is to use unique usernames per platform and review privacy settings on existing accounts. FootprintIQ can help you identify where you're currently exposed.",
  },
];

export default function WhatCanAUsernameReveal() {
  const sections = [
    {
      icon: User,
      title: "Public Profiles",
      content: (
        <>
          <p>
            The most immediate information a username reveals is the set of <strong className="text-foreground">public profiles</strong> associated with it. When someone searches your username across platforms, they can find:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Display names and bios</strong> — often containing real names, job titles, locations, or personal interests</li>
            <li><strong>Account creation dates</strong> — revealing how long someone has been active online</li>
            <li><strong>Activity patterns</strong> — post frequency, last active timestamps, and engagement history</li>
            <li><strong>Follower and following lists</strong> — exposing social connections and interests</li>
            <li><strong>Public posts and comments</strong> — opinions, interests, writing style, and personal details shared over time</li>
          </ul>
          <p className="mt-3">
            Each platform reveals different facets of a person's life. A gaming profile shows leisure habits, a developer profile shows technical skills, and a social media profile shows personal interests and social connections. Combined, they create a surprisingly detailed composite.
          </p>
        </>
      ),
    },
    {
      icon: Link2,
      title: "Linked Identities",
      content: (
        <>
          <p>
            When the same username appears on multiple platforms, investigators can <strong className="text-foreground">correlate these accounts</strong> to build a unified identity profile. This process — known as identity correlation — is the core technique behind{" "}
            <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username search</Link>.
          </p>
          <p>
            FootprintIQ's{" "}
            <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">2026 research</Link>{" "}
            found that the median reused username links to <strong className="text-foreground">4.2 distinct public profiles</strong>. For power users, this number exceeds 15 platforms.
          </p>
          <p>
            Cross-platform linking works because people often share consistent details: similar bios, the same profile photo, overlapping friend networks, or identical email addresses in public fields. Even without explicit connections, shared activity patterns (posting at the same times, engaging with the same topics) can confirm a link.
          </p>
          <p>
            This means an anonymous Reddit account can potentially be connected to a LinkedIn profile, a Twitter handle, and a GitHub account — all through a shared username.
          </p>
        </>
      ),
    },
    {
      icon: Image,
      title: "Photos and Metadata",
      content: (
        <>
          <p>
            Profile photos and uploaded images carry more information than most people realise:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Visual identity confirmation</strong> — the same face or distinctive photo across accounts confirms identity correlation beyond username matching alone</li>
            <li><strong>Reverse image search</strong> — profile photos can be searched using tools like Google Images or TinEye to find additional accounts and appearances</li>
            <li><strong>EXIF metadata</strong> — some platforms strip metadata from uploads, but others preserve GPS coordinates, camera model, timestamps, and software information embedded in images</li>
            <li><strong>Facial recognition</strong> — publicly available facial recognition services can match photos across platforms even when different images are used</li>
            <li><strong>Background clues</strong> — landmarks, signage, room layouts, and other visual details in photos can reveal location information</li>
          </ul>
          <p className="mt-3">
            Even a single profile photo reused across platforms creates a strong identity link. When combined with username matching, photo correlation raises identity confidence from approximately 40% to over 90%.
          </p>
        </>
      ),
    },
    {
      icon: MapPin,
      title: "Location Clues",
      content: (
        <>
          <p>
            Usernames can inadvertently reveal location through several channels:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li><strong>Geo-tagged posts</strong> — social media check-ins, tagged photos, and location-enabled posts reveal specific locations and movement patterns</li>
            <li><strong>Time zone analysis</strong> — posting timestamps across platforms can indicate a user's time zone and approximate geographic region</li>
            <li><strong>Local community membership</strong> — following local businesses, joining city-specific subreddits, or participating in regional forums reveals location</li>
            <li><strong>Profile information</strong> — many users include city, country, or neighbourhood in their bios, especially on professional and dating platforms</li>
            <li><strong>Language and dialect</strong> — writing patterns, slang, and language choices can narrow down geographic origin</li>
          </ul>
          <p className="mt-3">
            When location signals from multiple platforms are combined, an investigator can often determine a user's city of residence with reasonable confidence — all from publicly available data connected through a shared username.
          </p>
        </>
      ),
    },
    {
      icon: ShieldAlert,
      title: "Risk of Identity Exposure",
      content: (
        <>
          <p>
            The cumulative effect of username reuse creates a <strong className="text-foreground">compounding exposure risk</strong>. Each additional platform where a handle appears adds new data points that can be cross-referenced:
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {[
              { label: "1 platform", risk: "Low", desc: "Limited to a single profile's public data" },
              { label: "2–3 platforms", risk: "Moderate", desc: "Cross-referencing begins to reveal patterns" },
              { label: "4–5 platforms", risk: "High", desc: "Identity correlation becomes reliable" },
              { label: "5+ platforms", risk: "Critical", desc: "Comprehensive identity profile assemblable" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.risk === "Low" ? "bg-accent/20 text-accent-foreground" :
                    item.risk === "Moderate" ? "bg-primary/20 text-primary" :
                    item.risk === "High" ? "bg-destructive/20 text-destructive" :
                    "bg-destructive/30 text-destructive"
                  }`}>
                    {item.risk}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            According to FootprintIQ research, <strong className="text-foreground">41% of usernames appear on at least three platforms</strong> and <strong className="text-foreground">28% appear on five or more</strong>. This means a significant proportion of internet users have enough publicly connected accounts to enable reliable identity correlation.
          </p>
          <p>
            The most effective mitigation strategies include using{" "}
            <Link to="/check-my-digital-footprint" className="text-primary hover:underline">unique usernames per platform</Link>,
            regularly auditing your digital footprint, and removing or deactivating accounts you no longer use.
          </p>
        </>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>What Can a Username Reveal? – Identity Exposure Guide | FootprintIQ</title>
        <meta
          name="description"
          content="Discover what information a username can reveal: public profiles, linked identities, photos, location clues, and identity exposure risks. Free scan available."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="What Can a Username Reveal About You?" />
        <meta property="og:description" content="Learn what personal data can be found from a username — profiles, photos, locations, and linked identities across platforms." />
        <meta property="og:url" content={PAGE_URL} />
      </Helmet>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "What Can a Username Reveal?",
        description: "A comprehensive guide to what personal information can be discovered through a username, including public profiles, linked identities, photos, location clues, and exposure risks.",
        author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
        publisher: { "@type": "Organization", name: "FootprintIQ" },
        datePublished: "2026-03-04",
        dateModified: "2026-03-04",
        mainEntityOfPage: { "@type": "WebPage", "@id": PAGE_URL },
      }} />

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }} />

      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
          { "@type": "ListItem", position: 3, name: "What Can a Username Reveal?", item: PAGE_URL },
        ],
      }} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-3xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">What Can a Username Reveal?</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="py-16 md:py-24 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <AlertTriangle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Identity Exposure Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              What Can a Username Reveal?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A single username can expose far more than you expect — public profiles, linked identities, photos, location clues, and enough data to assemble a comprehensive identity profile.
            </p>
            <Button size="lg" className="text-lg px-8 py-6 h-auto" asChild>
              <Link to="/scan">
                <Search className="w-5 h-5 mr-2" />
                Check What Your Username Reveals
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
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              See What Your Username Reveals
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              FootprintIQ scans 500+ platforms to show you exactly where your username appears and what data is publicly visible. Free, private, and ethical.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/scan">
                  Run Your Free Scan
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/check-my-digital-footprint">
                  Check My Digital Footprint
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
          <RelatedToolsGrid currentPath="/what-can-a-username-reveal" />
        </div>
      </main>

      <Footer />
    </>
  );
}
