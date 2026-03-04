import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, Search, ArrowRight, ChevronRight, AlertTriangle, Eye, Globe, Lock, CheckCircle, XCircle, Users, AtSign, Mail, MapPin, FileText, Filter } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Can I search someone's Facebook without being logged in?",
    answer: "Only limited public information may appear through search engines. Facebook's internal search requires authentication. Publicly indexed profiles, pages, and posts may be visible via Google using the site:facebook.com operator.",
  },
  {
    question: "How do I find someone on Facebook by name?",
    answer: "Without logging in, you can use Google with the operator site:facebook.com followed by the person's name. This will return any publicly indexed profiles. For more comprehensive results, Facebook's internal search (requires login) allows filtering by location, workplace, and school.",
  },
  {
    question: "Can I search Facebook by email or phone number?",
    answer: "Facebook removed public email/phone search in 2019 to prevent data scraping. However, if an email has appeared in a Facebook-related breach, it may surface in an email breach check. FootprintIQ can check email exposure across 500+ platforms.",
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
    question: "Can someone find my Facebook using my username?",
    answer: "Yes. If you have a custom Facebook URL (facebook.com/yourname), anyone who knows that username can search for it across platforms. A username search can reveal this and other connected accounts.",
  },
  {
    question: "How do I find someone's Facebook from Instagram or other platforms?",
    answer: "If someone uses the same username across platforms, a cross-platform username search can reveal connected accounts. Many people link their Facebook to Instagram, making correlation straightforward.",
  },
  {
    question: "Is it legal to search for someone on Facebook?",
    answer: "Yes. Viewing publicly available information is legal. However, scraping data, bypassing privacy settings, or creating fake accounts to access restricted information may violate platform terms and local laws.",
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
    headline: "How to Find Someone on Facebook Without Logging In (2026 Guide)",
    description: "Learn how to search Facebook profiles, pages, and posts without an account. Methods for searching by name, email, phone, and username — with ethical guidelines.",
    url: pageUrl,
    datePublished: "2026-02-27",
    dateModified: "2026-03-04",
    author: { "@type": "Organization", name: "FootprintIQ", url: origin },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "en",
  };

  return (
    <>
      <Helmet>
        <title>How to Find Someone on Facebook Without Login (2026 Guide) | FootprintIQ</title>
        <meta name="description" content="Search Facebook profiles without logging in. Find someone by name, email, or username. Learn what's publicly accessible, Google search operators, and how to check your own exposure." />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="How to Find Someone on Facebook Without Login | FootprintIQ" />
        <meta property="og:description" content="Search Facebook profiles, pages, and posts without an account. Ethical methods, limitations, and privacy-first alternatives." />
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
              How to Find Someone on Facebook Without Logging In
            </h1>
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 mb-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-3">
                <strong className="text-foreground">Facebook has 3 billion monthly active users</strong> — but 
                searching for someone without an account is surprisingly difficult.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Facebook restricts most search features to logged-in users. However, public profiles, 
                business pages, and indexed posts can still be found through external search engines.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This guide covers every method: Google operators, username searches, email lookups, 
                and cross-platform scanning.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link to="/scan">
                  Search a Username <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/email-breach-check">
                  Search by Email
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="px-6 pb-16">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Method 1: Google Search */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Method 1: Search Facebook Using Google
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  The most effective way to search Facebook without logging in is through Google. 
                  Use the <code>site:</code> operator to restrict results to Facebook:
                </p>
                <div className="rounded-lg bg-muted/50 border border-border p-4 font-mono text-sm text-foreground space-y-2">
                  <div>site:facebook.com "John Smith" London</div>
                  <div>site:facebook.com/groups "photography club"</div>
                  <div>site:facebook.com inurl:profile.php "Jane Doe"</div>
                </div>
                <p>This can surface:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Public profiles with search engine indexing enabled</li>
                  <li>Public business pages</li>
                  <li>Public group posts</li>
                  <li>Event pages</li>
                  <li>Public photos and albums</li>
                </ul>
                <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    <strong className="text-foreground">Limitation:</strong> This only works for profiles 
                    with public discoverability enabled. Private profiles will not appear in Google results.
                  </p>
                </div>
              </div>
            </section>

            {/* Method 2: Direct URL */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Method 2: Direct Profile URL
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  If you know someone's Facebook username, you can go directly to their profile:
                </p>
                <div className="rounded-lg bg-muted/50 border border-border p-4 font-mono text-sm text-foreground">
                  facebook.com/[username]
                </div>
                <p>
                  Even without logging in, you'll see whatever the profile owner has set to "Public" 
                  — typically their profile photo, cover photo, and any publicly shared posts.
                </p>
                <p>
                  Don't know the username? A{" "}
                  <Link to="/usernames" className="text-primary hover:underline font-medium">
                    cross-platform username search
                  </Link>{" "}
                  can check if a known handle exists on Facebook and 500+ other platforms.
                </p>
              </div>
            </section>

            {/* Method 3: Email Search */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Method 3: Find Facebook by Email
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Facebook disabled email-based profile search in 2019 after a massive scraping 
                  incident exposed data from 533 million accounts. You can no longer type an email 
                  into Facebook's search bar to find a matching profile.
                </p>
                <p>However, alternatives include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Email breach check:</strong> The 2019 Facebook data breach exposed emails 
                    and phone numbers. An{" "}
                    <Link to="/email-breach-check" className="text-primary hover:underline">
                      email breach check
                    </Link>{" "}
                    can reveal if an email was part of this or other breaches.
                  </li>
                  <li>
                    <strong>Google search:</strong> Try <code>"email@example.com" site:facebook.com</code> — 
                    some profiles have email addresses visible on public pages.
                  </li>
                  <li>
                    <strong>Cross-platform scan:</strong> Check if the email is linked to other social 
                    platforms, which may in turn link to a Facebook profile.
                  </li>
                </ul>
              </div>
            </section>

            {/* Method 4: Phone Number */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Method 4: Find Facebook by Phone Number
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Like email, Facebook no longer allows phone number lookups. However:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The 2019 breach included 533 million phone numbers linked to Facebook profiles</li>
                  <li>Some third-party OSINT tools may have this data indexed</li>
                  <li>FootprintIQ can check phone number exposure across public sources</li>
                </ul>
                <p>
                  Enter a phone number in FootprintIQ's{" "}
                  <Link to="/scan" className="text-primary hover:underline font-medium">scanner</Link>{" "}
                  to check for publicly visible exposure.
                </p>
              </div>
            </section>

            {/* Why Public Profiles Matter */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Why Public Facebook Profiles Are a Risk
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>Many users assume their profiles are private when they are not. Public exposure can include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Profile and cover photos (always public by default)</li>
                  <li>Bio information — workplace, education, location</li>
                  <li>Public posts and comments</li>
                  <li>Tagged photos</li>
                  <li>Friends list (if not restricted)</li>
                  <li>Check-ins and location history</li>
                </ul>
                <p>
                  This data contributes to your{" "}
                  <Link to="/digital-footprint-scan" className="text-primary hover:underline font-medium">
                    digital footprint
                  </Link>. Combined with information from other platforms, 
                  it can paint a surprisingly detailed picture of someone's life.
                </p>
              </div>
            </section>

            {/* CTA Block */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
              <Eye className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Check What's Publicly Visible About You</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
                Run a scan to see what others can find about you across Facebook, Google, and 500+ other platforms.
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

            {/* How to Lock Down Facebook */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                How to Lock Down Your Facebook Privacy
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>If you're concerned about your Facebook being discoverable, take these steps:</p>
                <ol className="list-decimal list-inside space-y-3 ml-4">
                  <li><strong>Disable search engine indexing:</strong> Settings → Privacy → "Do you want search engines outside of Facebook to link to your profile?" → No</li>
                  <li><strong>Set posts to Friends Only:</strong> Settings → Privacy → "Who can see your future posts?" → Friends</li>
                  <li><strong>Review tagged photos:</strong> Enable tag review so tagged photos require your approval</li>
                  <li><strong>Lock your profile:</strong> Use Facebook's "Lock Profile" feature (available in some regions)</li>
                  <li><strong>Limit friends list visibility:</strong> Settings → Privacy → "Who can see your friends list?" → Only me</li>
                  <li><strong>Remove old public posts:</strong> Use "Limit Past Posts" in privacy settings to make all past posts Friends Only</li>
                  <li><strong>Check your public view:</strong> Visit your profile while logged out to see what strangers see</li>
                </ol>
              </div>
            </section>

            {/* Comparison */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                Facebook Search Methods Compared
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 font-semibold text-foreground">Method</th>
                      <th className="text-center p-3 font-semibold text-foreground">No Login</th>
                      <th className="text-center p-3 font-semibold text-foreground">Name Search</th>
                      <th className="text-center p-3 font-semibold text-foreground">Email/Phone</th>
                      <th className="text-center p-3 font-semibold text-foreground">Cross-Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { method: "Facebook Internal", noLogin: false, name: true, email: false, cross: false },
                      { method: "Google site: operator", noLogin: true, name: true, email: false, cross: false },
                      { method: "Direct URL", noLogin: true, name: false, email: false, cross: false },
                      { method: "UserSearch.org", noLogin: true, name: false, email: true, cross: true },
                      { method: "FootprintIQ", noLogin: true, name: false, email: true, cross: true },
                    ].map((row) => (
                      <tr key={row.method} className={`border-b border-border/50 ${row.method === "FootprintIQ" ? "bg-primary/5" : ""}`}>
                        <td className="p-3 font-medium text-foreground">{row.method}</td>
                        {[row.noLogin, row.name, row.email, row.cross].map((val, i) => (
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
            </section>

            {/* Is It Legal? */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Is It Legal to Search Facebook Without Logging In?
              </h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>Viewing publicly available information is legal.</p>
                <p>However, the following may violate platform terms or laws:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Creating fake accounts to access restricted content</li>
                  <li>Using scraping tools to collect profile data at scale</li>
                  <li>Bypassing privacy settings or platform protections</li>
                  <li>Using gathered information for harassment or stalking</li>
                </ul>
                <p>
                  FootprintIQ's <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link> defines 
                  clear boundaries for responsible digital research.
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
                Related: <Link to="/digital-footprint-scan" className="text-primary hover:underline">Digital Footprint Scan</Link> · <Link to="/usernames" className="text-primary hover:underline">Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Username Search</Link> · <Link to="/tinder-username-search" className="text-primary hover:underline">Tinder Username Search</Link>
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
