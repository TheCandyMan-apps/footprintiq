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
  Heart,
  AtSign,
  Users,
  MapPin,
  Mail,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Can you search for someone on Tinder?",
    answer:
      "Tinder does not offer a username or name search feature. You can only discover profiles through the swipe interface, which is limited by location and preferences. However, third-party tools can check if a username linked to Tinder exists on other platforms.",
  },
  {
    question: "How do I find someone on Tinder without an account?",
    answer:
      "Tinder requires a logged-in account to browse profiles. Without an account, your best option is searching for their known username or email across other platforms, which may reveal a connected Tinder-linked identity.",
  },
  {
    question: "Can I search Tinder by email or phone number?",
    answer:
      "Tinder does not provide email or phone-based search. However, if an email has appeared in a breach associated with Tinder or dating platforms, an email breach check can indicate past registration.",
  },
  {
    question: "Can someone find my Tinder profile?",
    answer:
      "If you reuse the same username, photos, or bio across platforms, someone could correlate your Tinder profile with other accounts. Running a digital footprint scan helps you understand and reduce that risk.",
  },
  {
    question: "Is it legal to search for someone on Tinder?",
    answer:
      "Reviewing publicly available information is legal. FootprintIQ does not bypass Tinder's login requirements, access private profiles, or scrape restricted data. It analyses only publicly indexed information.",
  },
  {
    question: "How do I check if my partner is on Tinder?",
    answer:
      "If you know their username, email, or phone number, you can run a cross-platform search to check for dating-related exposure. FootprintIQ checks publicly available data across 500+ platforms.",
  },
  {
    question: "Can you find someone on Tinder by location?",
    answer:
      "Tinder shows profiles based on your GPS location and distance preferences. Without a Tinder account, location-based search isn't possible. FootprintIQ focuses on username and email-based exposure instead.",
  },
  {
    question: "Does FootprintIQ access private Tinder data?",
    answer:
      "No. FootprintIQ does not access Tinder's internal database, bypass login, or scrape private profiles. It only analyses publicly available information across indexed platforms.",
  },
];

export default function TinderUsernameSearch() {
  const origin = "https://footprintiq.app";
  const pageUrl = `${origin}/tinder-username-search`;

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
    name: "FootprintIQ Tinder Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free Tinder username search tool. Find dating profiles by username, check cross-platform exposure, and search dating sites ethically.",
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Find Someone on Tinder – Username Search & Lookup Guide (2026)",
    description: "Learn how to search Tinder by username, email, phone number, or name. Compare methods, understand limitations, and check your own dating profile exposure.",
    url: pageUrl,
    datePublished: "2026-03-04",
    dateModified: "2026-03-04",
    author: { "@type": "Organization", name: "FootprintIQ", url: origin },
    publisher: { "@type": "Organization", name: "FootprintIQ", url: origin },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    inLanguage: "en",
  };

  return (
    <>
      <SEO
        title="How to Find Someone on Tinder – Username Search & Lookup (2026) | FootprintIQ"
        description="Search Tinder profiles by username, email, or phone number. Find dating profiles across Tinder, Bumble, Hinge & 500+ platforms. Free, ethical, privacy-first."
        canonical={pageUrl}
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
              { "@type": "ListItem", position: 2, name: "Tinder Username Search", item: pageUrl },
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
              How to Find Someone on Tinder
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Tinder doesn't let you search by name, username, or email. But if someone reuses 
              their handle across platforms, you can still find their dating profile through 
              cross-platform scanning.
            </p>

            <p className="text-base text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
              This guide covers every method to search Tinder — by username, email, phone number, 
              and name — plus how to protect your own dating profile privacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Search a Username Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/find-dating-profiles">
                  Find Dating Profiles
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Tinder Search Doesn't Exist */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Why Can't You Search Tinder Directly?</h2>
            <p>
              Unlike most social platforms, Tinder has <strong>no search feature at all</strong>. You 
              can't look someone up by name, username, email, or phone number within the app. The only 
              way to discover profiles is through the swipe interface, which is limited by:
            </p>
            <ul>
              <li>Your GPS location and distance settings</li>
              <li>Age and gender preferences</li>
              <li>Tinder's matching algorithm</li>
            </ul>
            <p>
              This means even if someone is on Tinder, you might never see their profile through 
              normal use. But there are workarounds.
            </p>

            <h2>How to Find Someone on Tinder by Username</h2>
            <p>
              Tinder doesn't use traditional usernames — profiles are linked to first names and 
              photos. However, many people use the <strong>same username across dating apps and 
              social media</strong>.
            </p>
            <p>
              If someone uses <code>jake_adventurer</code> on Instagram, they might use the same 
              handle on Bumble, Hinge, or other dating platforms. A{" "}
              <Link to="/usernames" className="text-primary underline underline-offset-4 hover:text-primary/80">
                cross-platform username search
              </Link>{" "}
              can reveal these connections across 500+ platforms.
            </p>

            <h2>How to Search Tinder by Email</h2>
            <p>
              Tinder accounts are registered with either a phone number or email address. While 
              Tinder doesn't expose this information, there are indirect methods:
            </p>
            <ul>
              <li>
                <strong>Email breach check:</strong> If the email has appeared in a dating platform 
                breach, it may surface in an{" "}
                <Link to="/email-breach-check" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  email breach check
                </Link>.
              </li>
              <li>
                <strong>Cross-reference:</strong> Check if the email is linked to other dating 
                profiles on platforms with public profiles (Bumble, Hinge, OkCupid).
              </li>
            </ul>

            <h2>How to Find Someone on Tinder by Phone Number</h2>
            <p>
              Many Tinder accounts are linked to phone numbers. While you can't search Tinder 
              directly by phone, some approaches include:
            </p>
            <ul>
              <li>Contact sync on dating apps (requires a dating app account)</li>
              <li>Reverse phone lookup services</li>
              <li>Checking if the number appears in public breach databases</li>
            </ul>
            <p>
              FootprintIQ supports phone-based exposure scanning — enter a phone number to check 
              if it's connected to publicly visible accounts.
            </p>

            <h2>How to Find Someone on Tinder by Name</h2>
            <p>
              Searching by name alone is unreliable because Tinder only shows first names, and 
              common names return too many results across other platforms. A better approach:
            </p>
            <ol>
              <li>Identify their social media username from other platforms</li>
              <li>Run a cross-platform username search</li>
              <li>Check for connected dating profiles in the results</li>
              <li>Use Google: <code>site:tinder.com [name]</code> (limited results)</li>
            </ol>

            <h2>Can Someone Find My Tinder Profile?</h2>
            <p>
              Your Tinder profile can be discovered if:
            </p>
            <ul>
              <li>You reuse photos from Instagram or Facebook</li>
              <li>You use the same bio text across platforms</li>
              <li>Your linked Instagram or Spotify is visible on Tinder</li>
              <li>You use the same username on Bumble, Hinge, or other apps</li>
            </ul>
            <p>
              A{" "}
              <Link to="/digital-footprint-scan" className="text-primary underline underline-offset-4 hover:text-primary/80">
                digital footprint scan
              </Link>{" "}
              helps you understand exactly what's discoverable about you across dating and social platforms.
            </p>

            <h2>Tinder Search Tools Compared</h2>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-foreground">Method</th>
                    <th className="text-center p-3 font-semibold text-foreground">Works Without Account</th>
                    <th className="text-center p-3 font-semibold text-foreground">Cross-Platform</th>
                    <th className="text-center p-3 font-semibold text-foreground">Email/Phone</th>
                    <th className="text-center p-3 font-semibold text-foreground">Free</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { method: "Tinder Swipe", noAccount: false, cross: false, email: false, free: true },
                    { method: "Google Search", noAccount: true, cross: false, email: false, free: true },
                    { method: "Social Catfish", noAccount: true, cross: true, email: true, free: false },
                    { method: "Cheaterbuster (discontinued)", noAccount: true, cross: false, email: false, free: false },
                    { method: "FootprintIQ", noAccount: true, cross: true, email: true, free: true },
                  ].map((row) => (
                    <tr key={row.method} className={`border-b border-border/50 ${row.method === "FootprintIQ" ? "bg-primary/5" : ""}`}>
                      <td className="p-3 font-medium text-foreground">{row.method}</td>
                      {[row.noAccount, row.cross, row.email, row.free].map((val, i) => (
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
              <h2 className="text-3xl font-bold mb-4">How FootprintIQ Finds Dating Profiles</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                No Tinder account needed. No swiping. Just enter a username or email.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { step: 1, icon: AtSign, title: "Enter a Username or Email", desc: "Type the handle, email, or phone number you want to check." },
                { step: 2, icon: Globe, title: "Scan 500+ Platforms", desc: "We check dating sites, social media, forums, and more — all from public sources." },
                { step: 3, icon: Heart, title: "Identify Dating Profiles", desc: "Results highlight matches on Tinder-linked platforms, Bumble, Hinge, OkCupid, and others." },
                { step: 4, icon: FileText, title: "Review & Take Action", desc: "See your exposure report with confidence scores and remediation guidance." },
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

        {/* Protect Your Dating Privacy */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How to Protect Your Tinder Privacy</h2>
            <ol>
              <li><strong>Don't link Instagram or Spotify</strong> — these connections make you more identifiable</li>
              <li><strong>Use unique photos</strong> — reverse image search can link Tinder photos to other accounts</li>
              <li><strong>Use a separate phone number</strong> — consider a secondary number for dating apps</li>
              <li><strong>Don't reuse your bio</strong> — identical bios across platforms are easy to correlate</li>
              <li><strong>Audit your exposure</strong> — run a{" "}
                <Link to="/scan" className="text-primary underline underline-offset-4 hover:text-primary/80">
                  free scan
                </Link>{" "}
                to see what's publicly visible
              </li>
            </ol>
          </div>
        </section>

        {/* Ethical Notice */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-primary/20">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-3">Ethical &amp; Legal Notice</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      FootprintIQ does not access Tinder's internal database
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      No login bypass, scraping, or API exploitation
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                      Not intended for stalking, harassment, or controlling behaviour
                    </li>
                  </ul>
                  <p className="mt-4 text-sm text-muted-foreground">
                    All results are derived from publicly available information. This tool is designed for self-assessment, safety planning, and privacy awareness.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Search Dating Profiles Now</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Enter a username, email, or phone number to check exposure across Tinder and 500+ platforms.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/scan">
                  Run a Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/email-breach-check">
                  Check by Email <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
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
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { href: "/find-dating-profiles", title: "Find Dating Profiles", desc: "Search across Tinder, Bumble, Hinge & more" },
                { href: "/dating-profile-lookup", title: "Dating Profile Lookup", desc: "Verify dating identities ethically" },
                { href: "/search-dating-sites-by-email", title: "Search Dating Sites by Email", desc: "Check if an email is linked to dating platforms" },
                { href: "/onlyfans-username-search", title: "OnlyFans Username Search", desc: "Search OnlyFans usernames across platforms" },
                { href: "/usernames", title: "Username Search", desc: "Search any username across 500+ platforms" },
                { href: "/romance-scam-warning-signs", title: "Romance Scam Warning Signs", desc: "Recognise and avoid dating scams" },
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
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
