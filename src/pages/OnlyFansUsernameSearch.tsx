import { Link } from "react-router-dom";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Shield,
  ArrowRight,
  Globe,
  Search,
  Eye,
  Zap,
  Target,
  Filter,
  FileText,
  UserCheck,
  Lock,
  AlertTriangle,
  MapPin,
  Mail,
  AtSign,
  Users,
  Camera,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How do I search for someone on OnlyFans?",
    answer:
      "You can search OnlyFans directly using their limited internal search, but it only works with exact usernames. For broader discovery, use a username search tool like FootprintIQ to check if a handle appears across OnlyFans and 500+ other platforms simultaneously.",
  },
  {
    question: "Can you search OnlyFans by location?",
    answer:
      "OnlyFans itself does not offer location-based search. However, third-party tools like OnlyFinder allow you to browse creators by geographic area. FootprintIQ focuses on username and email-based exposure rather than location browsing.",
  },
  {
    question: "Can you find someone on OnlyFans by email?",
    answer:
      "OnlyFans does not provide an email search feature. However, if an email address has been linked to an OnlyFans account and appeared in a data breach, it may surface during an email breach check. FootprintIQ can help identify such exposure.",
  },
  {
    question: "Is it legal to search for someone on OnlyFans?",
    answer:
      "Yes. Searching publicly available information is legal. FootprintIQ does not access private content, bypass paywalls, or circumvent account protections. It only analyses publicly indexed data.",
  },
  {
    question: "Can someone link my OnlyFans to my real identity?",
    answer:
      "If you reuse the same username or email across platforms, it may be possible to connect your OnlyFans account to other profiles. A username search can reveal these connections and help you reduce the risk.",
  },
  {
    question: "Why is OnlyFans search so limited?",
    answer:
      "OnlyFans deliberately restricts its search features to protect creator privacy and encourage creators to self-promote on external platforms. This drives more traffic to OnlyFans while keeping the internal directory minimal.",
  },
  {
    question: "Does FootprintIQ access private OnlyFans content?",
    answer:
      "No. FootprintIQ does not access private content, bypass paywalls, or circumvent account protections. It only analyses publicly available information across indexed platforms.",
  },
  {
    question: "Can I find someone's OnlyFans using their real name?",
    answer:
      "OnlyFans does not support real-name search effectively. However, if someone uses a consistent username or email, searching those identifiers across platforms can sometimes surface connected accounts.",
  },
  {
    question: "How do I check if my partner is on OnlyFans?",
    answer:
      "If you know their username or email, you can run a search to check for public matches across multiple platforms, including OnlyFans. FootprintIQ provides a privacy-first approach that checks only publicly available data.",
  },
  {
    question: "Is this tool anonymous?",
    answer:
      "Yes. Searches are processed securely and designed with user privacy in mind. We do not store or sell your search queries.",
  },
];

const differentiators = [
  {
    icon: Target,
    title: "Exposure Awareness",
    description: "Understand what your username reveals across the web",
  },
  {
    icon: Shield,
    title: "Ethical OSINT",
    description: "Public data only — no hacking, scraping, or unauthorised access",
  },
  {
    icon: Zap,
    title: "Privacy-First Analysis",
    description: "Designed for self-audit and defensive use",
  },
  {
    icon: Eye,
    title: "Clear Action Steps",
    description: "Know what to do with the results — not just raw data",
  },
];

const whoShouldUse = [
  { icon: UserCheck, label: "People checking if a partner is on OnlyFans" },
  { icon: Globe, label: "Content creators managing their exposure" },
  { icon: Shield, label: "Privacy-conscious individuals" },
  { icon: AlertTriangle, label: "People checking for impersonation" },
  { icon: Search, label: "Anyone who reuses usernames across platforms" },
  { icon: Users, label: "Parents concerned about family exposure" },
];

export default function OnlyFansUsernameSearch() {
  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqItems.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FootprintIQ OnlyFans Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free OnlyFans username search tool. Find someone on OnlyFans by username, check public profiles, and assess digital footprint exposure across 500+ platforms.",
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Search Someone on OnlyFans – Complete Guide (2026)",
    description: "Learn how to find someone on OnlyFans by username, email, location, or name. Compare search methods, understand platform limitations, and check your own exposure.",
    url: "https://footprintiq.app/onlyfans-username-search",
    datePublished: "2026-02-15",
    dateModified: "2026-03-04",
    author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/onlyfans-username-search" },
    inLanguage: "en",
  };

  return (
    <>
      <SEO
        title="How to Search Someone on OnlyFans – Username Search & Finder (2026) | FootprintIQ"
        description="Find someone on OnlyFans by username, email, or name. Search OnlyFans profiles across 500+ platforms. Free, ethical, privacy-first. Updated for 2026."
        canonical="https://footprintiq.app/onlyfans-username-search"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "OnlyFans Username Search", item: "https://footprintiq.app/onlyfans-username-search" },
            ],
          },
          faq: faqSchema,
          custom: [webAppSchema, articleSchema],
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Free • Public Data Only • No Login Required
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              How to Search Someone on OnlyFans
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
              OnlyFans has over 170 million registered users — but its internal search is deliberately limited. 
              Here's how to actually find someone, whether you know their username, email, or just a name.
            </p>

            <p className="text-base text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
              This guide covers every method: username lookup, email search, location-based browsing, 
              and cross-platform exposure scanning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Search a Username Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/email-breach-check">
                  Search by Email Instead
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why OnlyFans Search Is So Limited */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Why Is OnlyFans Search So Useless?</h2>
            <p>
              If you've tried searching on OnlyFans, you already know how frustrating it is. The platform's
              internal search only works with <strong>exact usernames</strong> — you can't search by name, 
              location, email, or even browse categories effectively.
            </p>
            <p>
              This isn't a bug — it's by design. OnlyFans wants creators to <strong>self-promote</strong> on
              external platforms like Instagram, Twitter, and TikTok, which drives traffic back to OnlyFans. 
              By keeping internal discovery limited, OnlyFans forces creators to advertise their own profiles 
              elsewhere, effectively turning every creator into a marketing channel for the platform.
            </p>
            <p>
              The result? OnlyFans generates over <strong>$1 billion annually</strong> while users are left 
              with a search feature that barely functions. But there are workarounds.
            </p>

            <h2>How to Find Someone on OnlyFans by Username</h2>
            <p>
              The most direct method is a username search. If you know (or can guess) the person's OnlyFans 
              username, you have several options:
            </p>

            <h3>Method 1: Direct URL</h3>
            <p>
              Every OnlyFans profile follows the pattern <code>onlyfans.com/[username]</code>. If you know 
              the handle, you can navigate directly to it. If the profile exists, you'll see a public preview 
              (even without subscribing).
            </p>

            <h3>Method 2: Cross-Platform Username Search</h3>
            <p>
              Most people reuse usernames. If someone uses <code>alex_travels</code> on Instagram, there's 
              a good chance they use it on OnlyFans too. FootprintIQ's{" "}
              <Link to="/usernames" className="text-primary underline underline-offset-4 hover:text-primary/80">
                username search tool
              </Link>{" "}
              checks a single handle across <strong>500+ platforms</strong> simultaneously — including 
              social media, dating sites, forums, and content platforms.
            </p>
            <p>
              This is often more effective than OnlyFans' own search because it reveals the full digital 
              footprint behind a username, not just one platform.
            </p>

            <h3>Method 3: Google Search</h3>
            <p>
              Google indexes some public OnlyFans profiles. Try searching:
            </p>
            <div className="not-prose rounded-lg bg-muted/50 border border-border p-4 font-mono text-sm text-foreground my-4">
              site:onlyfans.com [username or name]
            </div>
            <p>
              This can surface profiles that OnlyFans' own search wouldn't show you. However, results 
              depend on whether the creator has made their profile discoverable.
            </p>

            <h2>How to Search OnlyFans by Email</h2>
            <p>
              OnlyFans doesn't offer email-based search. However, there are two indirect methods:
            </p>
            <ul>
              <li>
                <strong>Breach data check:</strong> If an email address has appeared in a data breach 
                linked to OnlyFans, it may surface during an{" "}
                <Link to="/email-breach-check" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  email breach check
                </Link>. This doesn't confirm an active account, but it indicates past registration.
              </li>
              <li>
                <strong>Password reset check:</strong> Some users try the OnlyFans password reset flow 
                to see if an email is registered. While this doesn't expose profile details, it can 
                confirm account existence. Note: FootprintIQ does not use this method — it relies only 
                on publicly indexed data.
              </li>
            </ul>

            <h2>How to Find OnlyFans Profiles by Location</h2>
            <p>
              OnlyFans requires creators to provide a location as part of account verification. 
              Third-party tools can leverage this data:
            </p>
            <ul>
              <li>
                <strong>OnlyFinder:</strong> A popular third-party tool that lets you browse OnlyFans 
                creators by location on an interactive map. You can set a search radius and filter by 
                region, city, or distance.
              </li>
              <li>
                <strong>FanSearch / OnlySearch:</strong> Alternative directories that index OnlyFans 
                profiles by category, location, and tags.
              </li>
            </ul>
            <p>
              FootprintIQ takes a different approach — rather than browsing by location, it focuses on 
              <strong> username and identity exposure</strong> across platforms. If you know a username, 
              our{" "}
              <Link to="/digital-footprint-scan" className="text-primary underline underline-offset-4 hover:text-primary/80">
                digital footprint scan
              </Link>{" "}
              can reveal how that identity connects across the web.
            </p>

            <h2>How to Search OnlyFans by Name</h2>
            <p>
              Searching OnlyFans by real name is the least reliable method. OnlyFans' internal search 
              only matches against display names, and with 170+ million users, common names return 
              overwhelming results.
            </p>
            <p>
              A better approach:
            </p>
            <ol>
              <li>Search the person's known username or social handle instead</li>
              <li>Use Google's <code>site:onlyfans.com</code> operator with their name</li>
              <li>Check if their other social profiles link to an OnlyFans page</li>
              <li>Run a cross-platform username search to identify connected accounts</li>
            </ol>

            <h2>Can Someone Find My OnlyFans?</h2>
            <p>
              This is one of the most common concerns. The short answer: <strong>it depends on your 
              username hygiene</strong>.
            </p>
            <p>
              If you use the same username on OnlyFans as your Instagram, Twitter, or email handle, 
              anyone can run a username search and potentially connect those accounts. This is called 
              <strong> username reuse exposure</strong>, and it's one of the most common privacy risks 
              on the internet.
            </p>
            <p>
              FootprintIQ helps you understand this risk. Run a scan with your OnlyFans username to 
              see what else it's connected to — and take steps to reduce exposure before someone else 
              finds it.
            </p>

            <h2>OnlyFans Search Tools Compared</h2>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-foreground">Tool</th>
                    <th className="text-center p-3 font-semibold text-foreground">Username Search</th>
                    <th className="text-center p-3 font-semibold text-foreground">Email Search</th>
                    <th className="text-center p-3 font-semibold text-foreground">Location Search</th>
                    <th className="text-center p-3 font-semibold text-foreground">Cross-Platform</th>
                    <th className="text-center p-3 font-semibold text-foreground">Free</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { tool: "OnlyFans (Internal)", username: true, email: false, location: false, cross: false, free: true },
                    { tool: "OnlyFinder", username: true, email: false, location: true, cross: false, free: true },
                    { tool: "Google (site:)", username: true, email: false, location: false, cross: false, free: true },
                    { tool: "UserSearch.org", username: true, email: true, location: false, cross: true, free: false },
                    { tool: "FootprintIQ", username: true, email: true, location: false, cross: true, free: true },
                  ].map((row) => (
                    <tr key={row.tool} className={`border-b border-border/50 ${row.tool === "FootprintIQ" ? "bg-primary/5" : ""}`}>
                      <td className="p-3 font-medium text-foreground">{row.tool}</td>
                      {[row.username, row.email, row.location, row.cross, row.free].map((val, i) => (
                        <td key={i} className="text-center p-3">
                          {val ? <CheckCircle className="w-4 h-4 text-primary mx-auto" /> : <XCircle className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Comparison based on publicly available features as of March 2026.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How FootprintIQ Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                No paywalls, no scraping, no hacking. Just ethical exposure awareness.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { step: 1, icon: AtSign, title: "Enter a Username or Email", desc: "Type the OnlyFans handle or email you want to check. No account or login required." },
                { step: 2, icon: Globe, title: "Scan 500+ Public Sources", desc: "Our system queries publicly accessible platforms — social media, forums, dating sites, and more." },
                { step: 3, icon: Filter, title: "Match & Score Results", desc: "Confidence scoring identifies real matches and filters out false positives from common usernames." },
                { step: 4, icon: FileText, title: "View Your Exposure Report", desc: "See exactly which platforms have matching profiles, with URLs and confidence levels." },
              ].map(({ step, icon: Icon, title, desc }) => (
                <Card key={step} className="p-6 border-l-4 border-l-primary">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        {title}
                      </h3>
                      <p className="text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Protecting Your Privacy on OnlyFans */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How to Protect Your Privacy on OnlyFans</h2>
            <p>
              Whether you're a creator or a subscriber, here are practical steps to reduce your exposure:
            </p>
            <ol>
              <li><strong>Use a unique username</strong> — never reuse a handle from other platforms</li>
              <li><strong>Create a separate email</strong> — don't use your personal or work email</li>
              <li><strong>Avoid linking social accounts</strong> — don't connect Instagram or Twitter to your OnlyFans</li>
              <li><strong>Check your exposure regularly</strong> — run a{" "}
                <Link to="/digital-footprint-scan" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  digital footprint scan
                </Link>{" "}
                to see what's publicly visible
              </li>
              <li><strong>Audit old accounts</strong> — delete forgotten profiles that share your username</li>
              <li><strong>Use a VPN</strong> — prevent IP-based location exposure</li>
            </ol>
            <p>
              For a detailed walkthrough, see our guide on{" "}
              <Link to="/blog/how-to-check-whats-online-about-you" className="text-primary underline underline-offset-4 hover:text-primary/80">
                how to check what's online about you
              </Link>.
            </p>
          </div>
        </section>

        {/* Who Should Use */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Who Uses OnlyFans Search Tools?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {whoShouldUse.map(({ icon: Icon, label }) => (
                <Card key={label} className="p-5 flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ethical Notice */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Ethical &amp; Legal Notice</h2>
              <p className="text-lg text-muted-foreground">
                FootprintIQ is designed for privacy awareness and legitimate searches.
              </p>
            </div>
            <Card className="p-8 border-2 border-primary/20">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-3">FootprintIQ does not:</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Access private OnlyFans content or bypass paywalls
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Circumvent platform login or authentication
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Hack, scrape, or collect restricted data
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Enable harassment, doxxing, or stalking
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    All results are derived from publicly available information. Use responsibly.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Search?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Enter a username or email to see what's publicly visible across OnlyFans and 500+ other platforms.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Run a Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/email-breach-check">
                  Check an Email Address
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Differentiators */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {differentiators.map((item, idx) => (
                <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Everything you need to know about searching OnlyFans
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Related Search Tools</h2>
            <p className="text-center text-muted-foreground mb-8">
              OnlyFans is just one platform. Explore more.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { href: "/usernames", title: "Username Search", desc: "Search any username across 500+ platforms" },
                { href: "/email-breach-check", title: "Email Breach Check", desc: "Check if an email appears in data breaches" },
                { href: "/find-dating-profiles", title: "Find Dating Profiles", desc: "Search Tinder, Bumble, Hinge & more" },
                { href: "/tinder-username-search", title: "Tinder Username Search", desc: "Find Tinder-linked profiles by username" },
                { href: "/instagram-username-search", title: "Instagram Username Search", desc: "Check Instagram exposure & connected accounts" },
                { href: "/digital-footprint-scanner", title: "Digital Footprint Scanner", desc: "Run a complete scan across all identifiers" },
              ].map(({ href, title, desc }) => (
                <Link key={href} to={href} className="group">
                  <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                      {title} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </Card>
                </Link>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Related guides: <Link to="/romance-scam-warning-signs" className="text-primary hover:underline">Romance Scam Warning Signs</Link> · <Link to="/search-dating-sites-by-email" className="text-primary hover:underline">Search Dating Sites by Email</Link> · <Link to="/find-dating-profiles" className="text-primary hover:underline">Find Dating Profiles</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
