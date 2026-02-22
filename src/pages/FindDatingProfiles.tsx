import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Shield, Heart, Mail, User, AlertTriangle, CheckCircle2 } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "Can I find someone's dating profiles?",
    answer: "You can search for publicly accessible dating profiles using username or email correlation. FootprintIQ scans public data only — it never bypasses authentication, accesses private accounts, or scrapes behind logins. Results depend on whether the platform exposes public profile data.",
  },
  {
    question: "How to search dating sites by email?",
    answer: "Email-based OSINT tools check whether an email address has been used to register on dating platforms by correlating breach data, public registration records, and API-exposed endpoints. FootprintIQ's email scan can reveal dating site registrations when that data is publicly available or present in known breaches.",
  },
  {
    question: "Is it legal to search for dating profiles?",
    answer: "Searching publicly available information is legal in most jurisdictions. FootprintIQ only queries data that is already publicly accessible. We do not access private accounts, bypass privacy settings, or engage in unauthorised surveillance. Always use OSINT tools ethically and for legitimate purposes such as self-auditing.",
  },
  {
    question: "What dating sites can FootprintIQ detect?",
    answer: "FootprintIQ can detect public profiles and breach-linked registrations across major dating platforms including Tinder, Bumble, Hinge, OkCupid, Plenty of Fish, Match.com, and others. Coverage depends on whether platforms expose public profile data or whether credentials have appeared in known data breaches.",
  },
  {
    question: "How accurate are dating profile search results?",
    answer: "Accuracy depends on the uniqueness of the username or email being searched. Common usernames may produce false positives. FootprintIQ uses LENS AI confidence scoring to flag uncertain matches and help you distinguish verified findings from possible matches.",
  },
  {
    question: "Can I search for my own dating profiles to check exposure?",
    answer: "Yes — and this is the most common ethical use case. Many people want to understand which dating platforms still hold their data after deleting accounts. A self-audit scan reveals lingering profiles, cached data, and breach-linked registrations tied to your username or email.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Find Dating Profiles by Username or Email — Free Search Tool",
  description: "Learn how to find dating profiles using username or email OSINT correlation. Ethical, privacy-first approach to discovering dating platform exposure.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/find-dating-profiles`,
};

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
    { "@type": "ListItem", position: 1, name: "Home", item: BASE },
    { "@type": "ListItem", position: 2, name: "Find Dating Profiles", item: `${BASE}/find-dating-profiles` },
  ],
};

const FindDatingProfiles = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Find Dating Profiles by Username or Email | Free Search Tool</title>
        <meta name="description" content="Search for dating profiles by username or email using ethical OSINT methods. Discover dating platform exposure with FootprintIQ's privacy-first scanner." />
        <link rel="canonical" href={`${BASE}/find-dating-profiles`} />
        <meta property="og:title" content="Find Dating Profiles by Username or Email | Free Search Tool" />
        <meta property="og:description" content="Search for dating profiles by username or email using ethical OSINT methods. Discover dating platform exposure with FootprintIQ's privacy-first scanner." />
        <meta property="og:url" content={`${BASE}/find-dating-profiles`} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-background to-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Dating Profile Search
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Find Dating Profiles — <span className="text-primary">Search by Username or Email</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover which dating platforms are linked to a username or email address using ethical, publicly sourced OSINT intelligence. No hacking, no login bypass — just transparent exposure mapping.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/scan">
                  <Search className="w-4 h-4" />
                  Run a Free Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/ethical-osint-charter">
                  <Shield className="w-4 h-4" />
                  Our Ethical Charter
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How Dating Profile Searches Work</h2>
            <p>
              Dating profile searches use <strong>OSINT (Open-Source Intelligence)</strong> techniques to correlate a username or email address with registrations on dating platforms. This process relies entirely on publicly available data — including breach databases, API-exposed registration endpoints, and cached public profiles.
            </p>
            <p>
              When you search for a username like <code>alex_travels</code>, FootprintIQ checks whether that handle exists on platforms such as Tinder, Bumble, Hinge, OkCupid, Plenty of Fish, and dozens more. When you search by email, the system cross-references breach data and public registration records to identify which dating services are associated with that address.
            </p>
            <p>
              <strong>Important:</strong> FootprintIQ never accesses private accounts, bypasses authentication, or scrapes data behind login walls. All results come from publicly accessible sources. This makes the process legal, ethical, and compliant with GDPR and CCPA frameworks.
            </p>

            <h2>Why People Search for Dating Profiles</h2>
            <p>There are several legitimate reasons someone might want to find dating profiles linked to a username or email:</p>
            <ul>
              <li><strong>Self-auditing:</strong> Checking which dating platforms still hold your data after you've deleted accounts. Many platforms retain cached profiles even after deactivation.</li>
              <li><strong>Breach exposure assessment:</strong> Understanding whether your dating site credentials have appeared in known data breaches, which could lead to account takeover or phishing.</li>
              <li><strong>Parental awareness:</strong> Verifying whether a minor's email or username has been registered on age-restricted platforms (with appropriate consent and legal authority).</li>
              <li><strong>Corporate security:</strong> Assessing whether executive identities have been impersonated on dating platforms as part of social engineering reconnaissance.</li>
              <li><strong>Relationship trust verification:</strong> While FootprintIQ does not encourage surveillance, self-auditing shared household credentials is a common use case.</li>
            </ul>

            <h2>Username vs Email Search: Which Is More Effective?</h2>
            <p>
              Both approaches reveal different types of exposure. <strong>Username searches</strong> are effective when someone reuses the same handle across platforms — a behaviour documented in FootprintIQ's <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">2026 Username Reuse Report</Link>, which found that 72% of users reuse at least one username across five or more platforms.
            </p>
            <p>
              <strong>Email searches</strong> are particularly powerful for dating profiles because dating platforms require email registration. Breach databases frequently contain dating site credentials, meaning an email-based search can reveal registrations even on platforms where the public profile has been deleted or hidden.
            </p>
            <p>
              For the most comprehensive results, FootprintIQ recommends running both a <Link to="/username-search" className="text-primary hover:underline">username scan</Link> and an <Link to="/email-breach-check" className="text-primary hover:underline">email breach check</Link> to capture the full spectrum of dating platform exposure.
            </p>

            <h2>How FootprintIQ Approaches Dating Profile Discovery</h2>
            <p>
              FootprintIQ — Ethical Digital Footprint Intelligence Platform — includes dating platform coverage as part of its comprehensive OSINT scanning pipeline. Unlike invasive people-search sites that scrape and sell personal data, FootprintIQ:
            </p>
            <ul>
              <li><CheckCircle2 className="inline w-4 h-4 text-primary mr-1" /> Only queries publicly accessible data sources</li>
              <li><CheckCircle2 className="inline w-4 h-4 text-primary mr-1" /> Uses <Link to="/lens" className="text-primary hover:underline">LENS AI confidence scoring</Link> to reduce false positives</li>
              <li><CheckCircle2 className="inline w-4 h-4 text-primary mr-1" /> Never stores or resells your scan results</li>
              <li><CheckCircle2 className="inline w-4 h-4 text-primary mr-1" /> Provides actionable remediation guidance for each finding</li>
              <li><CheckCircle2 className="inline w-4 h-4 text-primary mr-1" /> Follows the <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link></li>
            </ul>

            <h2>What Dating Platforms Can Be Detected?</h2>
            <p>FootprintIQ's scanning pipeline covers a wide range of dating and relationship platforms, including:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 not-prose my-6">
              {["Tinder", "Bumble", "Hinge", "OkCupid", "Plenty of Fish", "Match.com", "Badoo", "Zoosk", "Coffee Meets Bagel", "Grindr", "Her", "Feeld"].map((platform) => (
                <div key={platform} className="flex items-center gap-2 p-3 rounded-lg bg-card border border-border">
                  <Heart className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">{platform}</span>
                </div>
              ))}
            </div>
            <p>
              Coverage depends on whether platforms expose public profile data or whether credentials have appeared in known breach databases. FootprintIQ continuously updates its platform coverage as new data sources become available.
            </p>

            <h2>Ethical Considerations</h2>
            <p>
              FootprintIQ takes a firm ethical stance on dating profile discovery. We believe in <strong>transparency, consent, and responsible use</strong>. Our platform is designed primarily for <strong>self-auditing</strong> — helping you understand your own digital exposure rather than surveilling others.
            </p>
            <div className="not-prose my-6 p-6 rounded-xl border border-border bg-card">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Responsible Use Notice</h3>
                  <p className="text-sm text-muted-foreground">
                    FootprintIQ is not designed for stalking, harassment, or unauthorised surveillance. Using OSINT tools to monitor someone without their knowledge or consent may be illegal in your jurisdiction. Always use these tools ethically and within the bounds of applicable law. Read our <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</Link>.
                  </p>
                </div>
              </div>
            </div>

            <h2>Next Steps: Reduce Your Dating Platform Exposure</h2>
            <p>If your scan reveals dating profiles you didn't know existed, here's what to do:</p>
            <ol>
              <li><strong>Deactivate or delete</strong> accounts you no longer use directly through the platform's settings.</li>
              <li><strong>Change passwords</strong> on any accounts that appeared in breach data — and enable two-factor authentication.</li>
              <li><strong>Check for cached profiles</strong> using Google's <Link to="/remove-yourself-from-google-search" className="text-primary hover:underline">content removal tools</Link> to request removal of indexed dating profiles.</li>
              <li><strong>Run a follow-up scan</strong> after 30 days to verify that deleted profiles have been removed from public indexes.</li>
              <li><strong>Review data broker listings</strong> — some data brokers aggregate dating profile data. Use FootprintIQ's <Link to="/automated-removal" className="text-primary hover:underline">automated removal</Link> to opt out.</li>
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Check Your Dating Platform Exposure</h2>
            <p className="text-muted-foreground mb-8">
              Run a free scan to discover which dating sites are linked to your username or email. Privacy-first, ethical OSINT scanning.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/scan">
                <ArrowRight className="w-4 h-4" />
                Start Free Scan
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related + Footer Block */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <RelatedToolsGrid currentPath="/find-dating-profiles" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FindDatingProfiles;
