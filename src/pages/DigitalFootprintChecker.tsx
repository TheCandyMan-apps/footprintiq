import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  CheckCircle,
  ArrowRight,
  Eye,
  AlertTriangle,
  Fingerprint,
  Globe,
  Lock,
  Users,
  FileText,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "What is a digital footprint checker?",
    answer:
      "A digital footprint checker is a tool that scans publicly accessible sources to identify where your personal information — usernames, email addresses, and associated data — appears online. It maps your exposure across social media platforms, forums, data broker listings, and breach databases to give you a clear picture of your public visibility.",
  },
  {
    question: "Is checking my digital footprint free?",
    answer:
      "Yes. FootprintIQ offers a free basic scan that checks your username or email across 500+ public platforms with no sign-up required. Pro scans provide deeper analysis including data broker detection, breach correlation, and a prioritised remediation roadmap.",
  },
  {
    question: "What information does a digital footprint scan find?",
    answer:
      "A scan can surface public social media profiles, forum accounts, data broker listings, breach exposure, username reuse patterns, and publicly indexed personal details. Only publicly accessible information is checked — no private accounts or authenticated content is accessed.",
  },
  {
    question: "How often should I check my digital footprint?",
    answer:
      "We recommend quarterly checks as a baseline, or immediately after receiving a data breach notification. Your digital footprint changes continuously as platforms update defaults, new data brokers emerge, and old accounts resurface in search results.",
  },
  {
    question: "Can I remove my digital footprint completely?",
    answer:
      "Complete removal is rarely possible — cached pages, archived content, and third-party aggregation make total erasure impractical. However, you can significantly reduce your exposure by deleting unused accounts, opting out of data brokers, and tightening privacy settings on active platforms.",
  },
  {
    question: "Is this the same as a background check?",
    answer:
      "No. A digital footprint checker analyses publicly available information using ethical OSINT techniques. It does not access court records, credit reports, or private databases. It's designed for self-assessment and privacy auditing, not employment screening or surveillance.",
  },
  {
    question: "Will anyone know I checked my digital footprint?",
    answer:
      "No. FootprintIQ queries publicly accessible profile URLs — the same pages anyone can visit by typing the URL into a browser. No notifications are sent, no accounts are accessed, and no interactions are recorded on target platforms.",
  },
  {
    question: "What's the difference between active and passive digital footprints?",
    answer:
      "An active digital footprint consists of data you deliberately share — social media posts, forum comments, profile bios. A passive footprint is created without your direct action — cookies, IP logs, data broker aggregation, and third-party tracking. A comprehensive digital footprint scan covers both dimensions.",
  },
];

export default function DigitalFootprintChecker() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Digital Footprint Checker", item: "https://footprintiq.app/digital-footprint-checker" },
    ],
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FootprintIQ Digital Footprint Checker",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", ratingCount: "423", bestRating: "5" },
    description: "Free digital footprint checker. Scan your online presence across 500+ platforms, discover exposed data, and get a prioritised cleanup plan.",
  };

  return (
    <>
      <Helmet>
        <title>Digital Footprint Checker – Scan Your Online Presence Free | FootprintIQ</title>
        <meta
          name="description"
          content="Free digital footprint checker. Check your online presence across 500+ platforms, find exposed data, and get actionable steps to reduce your digital footprint."
        />
        <link rel="canonical" href="https://footprintiq.app/digital-footprint-checker" />
        <meta property="og:title" content="Digital Footprint Checker – Scan Your Online Presence Free | FootprintIQ" />
        <meta property="og:description" content="Check your digital footprint across 500+ platforms. Discover exposed profiles, data broker listings, and breach exposure." />
        <meta property="og:url" content="https://footprintiq.app/digital-footprint-checker" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={productSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Fingerprint className="h-3 w-3 mr-1.5" />
              Online Footprint Checker
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Digital Footprint Checker
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              Check your digital footprint across 500+ public platforms. Discover exposed profiles,
              forgotten accounts, data broker listings, and breach exposure — then get a structured
              plan to reduce your online presence.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8 max-w-2xl mx-auto">
              Free scan. No login required. Only publicly accessible data is checked.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                500+ platforms
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Data broker detection
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Breach exposure check
              </span>
            </div>
            <div className="mt-8">
              <EthicalOsintTrustBlock />
            </div>
          </div>
        </section>

        {/* What Is a Digital Footprint? */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What Is a Digital Footprint?</h2>

            <p>
              A digital footprint is the cumulative trail of data created by your online activity. Every
              social media profile you create, forum post you publish, account you register, and website
              you interact with adds to this footprint. It's the publicly visible record of your existence
              on the internet — and it's almost certainly larger than you think.
            </p>

            <p>
              Digital footprints fall into two categories:
            </p>

            <ul>
              <li>
                <strong>Active footprints</strong> — data you deliberately create. Social media posts,
                profile bios, blog comments, forum contributions, product reviews, and public
                repositories. You chose to publish this information, even if you've since forgotten
                about it.
              </li>
              <li>
                <strong>Passive footprints</strong> — data created about you without direct action.
                Data broker aggregation, third-party tracking cookies, IP address logs, search engine
                indexing of your profiles, and metadata from photos you've uploaded. This data
                accumulates silently and is often the most difficult to control.
              </li>
            </ul>

            <p>
              A <strong>digital footprint checker</strong> like FootprintIQ focuses primarily on your
              active footprint — the profiles, accounts, and publicly indexed information that anyone
              can discover about you. Understanding what's visible is the essential first step toward
              managing your online privacy. For a deeper exploration of this concept, see our{" "}
              <Link to="/glossary/digital-footprint" className="text-primary hover:underline">
                digital footprint glossary entry
              </Link>.
            </p>
          </div>
        </section>

        {/* Why Checking Your Digital Footprint Matters */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Checking Your Digital Footprint Matters</h2>

            <p>
              Most people significantly underestimate their online exposure. A 2024 study found that
              the average internet user has accounts on over 100 online services — yet can only recall
              a fraction of them. Each forgotten account is a potential privacy liability: an old forum
              profile with your real name, a dating site you signed up for years ago, a gaming account
              with your primary email address.
            </p>

            <p>
              Here's why a regular <strong>digital footprint scan</strong> should be part of your
              privacy routine:
            </p>

            <ul>
              <li>
                <strong>Employment and reputation.</strong> Employers, clients, and professional contacts
                routinely search for people online. An exposed profile on an unexpected platform can
                affect professional opportunities — even if the content is innocuous.
              </li>
              <li>
                <strong>Identity theft prevention.</strong> The more personal information that's publicly
                available, the easier it is for attackers to craft convincing phishing emails, answer
                security questions, or impersonate you. Reducing your footprint directly reduces your
                attack surface.
              </li>
              <li>
                <strong>Data broker exposure.</strong> Data aggregators compile public profiles into
                searchable databases that are sold to advertisers, background check services, and
                anyone willing to pay. The less public data available, the less complete these
                dossiers become.
              </li>
              <li>
                <strong>Post-breach response.</strong> After a data breach notification, understanding
                where your compromised credentials are reused helps you prioritise password changes
                and account deletions.
              </li>
            </ul>

            <p>
              An <strong>online footprint checker</strong> automates what would otherwise take hours
              of manual searching — checking hundreds of platforms in seconds rather than visiting
              each one individually.
            </p>
          </div>
        </section>

        {/* What Information Can Be Found Online */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              What Information Can Be Found Online
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
              A comprehensive digital footprint scan can surface the following types of publicly
              accessible information. Nothing private or authenticated is accessed.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Users, title: "Social Media Profiles", desc: "Active and dormant accounts on Instagram, TikTok, Twitter/X, Facebook, LinkedIn, Reddit, and 100+ other networks." },
                { icon: Globe, title: "Forum & Community Accounts", desc: "Registrations on discussion forums, Q&A sites, niche communities, and archived web content." },
                { icon: FileText, title: "Data Broker Listings", desc: "Appearances on people-search sites and data aggregation platforms that compile and sell personal information." },
                { icon: ShieldAlert, title: "Breach Exposure", desc: "Email addresses and usernames found in publicly indexed breach datasets, indicating potential credential compromise." },
                { icon: Eye, title: "Username Reuse Patterns", desc: "Cross-platform correlations showing where the same handle appears, revealing connections between accounts." },
                { icon: Search, title: "Search Engine Indexing", desc: "Publicly indexed pages, cached profiles, and search results that surface your information to anyone who searches." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-border/50">
                  <CardContent className="p-6">
                    <Icon className="h-8 w-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How Digital Footprint Scanners Work */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Digital Footprint Scanners Work</h2>

            <p>
              A <strong>digital footprint checker</strong> combines multiple scanning techniques into a
              single, automated pipeline. Here's what happens when you enter a username or email into
              FootprintIQ:
            </p>

            <ol>
              <li>
                <strong>Input normalisation.</strong> Your username or email is cleaned, case-normalised,
                and prepared for multi-platform querying. Variations and common substitutions are also
                checked where relevant.
              </li>
              <li>
                <strong>Platform enumeration.</strong> The tool queries 500+ public platform endpoints
                simultaneously. For usernames, it constructs predictable profile URLs
                (e.g., <code>twitter.com/handle</code>) and analyses responses. For emails, it checks
                breach databases and registration signals.
              </li>
              <li>
                <strong>Response analysis.</strong> Each platform response is evaluated for profile
                existence signals — HTTP status codes, page content patterns, and profile metadata.
                This distinguishes genuine profiles from error pages, placeholder accounts, and
                coincidental matches.
              </li>
              <li>
                <strong>Confidence scoring.</strong> Results are scored based on username uniqueness,
                metadata consistency, and cross-platform correlation signals. A match on a distinctive
                handle scores higher than one on a common word.
              </li>
              <li>
                <strong>Categorisation and prioritisation.</strong> Findings are grouped by type — social
                media, professional, gaming, forum, data broker — and prioritised by risk level. High-risk
                findings (breach exposure, data broker listings) are surfaced first.
              </li>
              <li>
                <strong>Remediation guidance.</strong> Each finding includes actionable next steps:
                direct links to account deletion pages, opt-out instructions for data brokers, and
                privacy setting recommendations for active accounts.
              </li>
            </ol>

            <p>
              This multi-layered approach transforms a simple <strong>check my online presence</strong>{" "}
              query into a structured, prioritised exposure report — far more actionable than manually
              Googling yourself.
            </p>
          </div>
        </section>

        {/* Risks Of An Exposed Digital Identity */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Risks Of An Exposed Digital Identity</h2>

            <p>
              An unmanaged digital footprint creates tangible risks that extend beyond abstract privacy
              concerns. Understanding these risks is essential for prioritising which findings to
              address first.
            </p>

            <h3>Social Engineering and Phishing</h3>
            <p>
              The more publicly available information an attacker can gather, the more convincing their
              phishing attempts become. A targeted email that references your real employer, hobbies
              mentioned in a forum post, or a username from a gaming platform is far more likely to
              succeed than a generic scam. Reducing your public footprint directly reduces the quality
              of intelligence available to attackers.
            </p>

            <h3>Credential Stuffing</h3>
            <p>
              When a breach exposes credentials associated with a username or email, attackers
              automatically test those credentials across hundreds of other platforms. If you reuse
              passwords — or even usernames — across services, a single breach can cascade into
              multiple account compromises. A{" "}
              <Link to="/email-breach-check" className="text-primary hover:underline">
                breach exposure check
              </Link>{" "}
              identifies which of your identifiers have been compromised.
            </p>

            <h3>Data Broker Aggregation</h3>
            <p>
              Data brokers compile publicly available information into comprehensive profiles that are
              sold to advertisers, background check services, and sometimes malicious actors. Your
              social media profiles, forum posts, and public records are the raw material for these
              dossiers. The less data available publicly, the less complete — and less valuable —
              these profiles become.
            </p>

            <h3>Impersonation and Identity Fraud</h3>
            <p>
              Publicly visible profile photos, bios, and usernames can be cloned to create convincing
              impersonation accounts. This is particularly problematic on platforms where the real user
              doesn't have an account — there's no existing profile to compare against. A{" "}
              <Link to="/reverse-username-search" className="text-primary hover:underline">
                reverse username search
              </Link>{" "}
              helps identify platforms where your handle is unclaimed and potentially vulnerable to
              impersonation.
            </p>

            <h3>Reputational Damage</h3>
            <p>
              Forgotten accounts from years ago may contain outdated opinions, embarrassing content,
              or associations you'd prefer to leave behind. Because these accounts remain publicly
              indexed, they can surface in search results at the worst possible time — during a job
              application, client pitch, or public-facing role.
            </p>
          </div>
        </section>

        {/* How To Reduce Your Digital Footprint */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Reduce Your Digital Footprint</h2>

            <p>
              Reducing your digital footprint is a structured process, not a one-time action. After
              running a <strong>digital footprint scan</strong>, follow these steps in order of impact:
            </p>

            <ol>
              <li>
                <strong>Delete dormant accounts.</strong> Start with platforms you no longer use. Each
                abandoned account is unnecessary exposure. FootprintIQ provides direct links to
                account deletion pages where available. Prioritise accounts that contain personal
                information — real names, photos, email addresses, or location data.
              </li>
              <li>
                <strong>Opt out of data brokers.</strong> Submit removal requests to data aggregation
                sites that have compiled your information. This is an ongoing process — brokers
                re-scrape public data regularly, so periodic re-submission is necessary. Our{" "}
                <Link to="/data-broker-removal-guide" className="text-primary hover:underline">
                  data broker removal guide
                </Link>{" "}
                provides step-by-step instructions.
              </li>
              <li>
                <strong>Break the username chain.</strong> Stop reusing the same handle across platforms.
                Use unique usernames for services where privacy matters, and reserve your "public" handle
                for platforms where discoverability is intentional. A password manager can track different
                credentials across services.
              </li>
              <li>
                <strong>Tighten privacy settings.</strong> On platforms you actively use, review and
                restrict what's publicly visible. Set profiles to private where appropriate. Remove
                unnecessary personal details from bios — phone numbers, birthdates, workplace
                references, and physical locations.
              </li>
              <li>
                <strong>Address breach exposure.</strong> If your email or username appears in breach
                databases, change passwords immediately on all affected services. Enable two-factor
                authentication on every account that supports it — preferably using an authenticator
                app rather than SMS.
              </li>
              <li>
                <strong>Monitor continuously.</strong> Digital footprints grow over time. Set a quarterly
                reminder to re-run your scan. New platforms emerge, old platforms change privacy defaults,
                and data breaches expose previously secure information. Continuous monitoring catches new
                exposure before it becomes entrenched.
              </li>
            </ol>

            <p>
              For a comprehensive approach, combine the digital footprint checker with a{" "}
              <Link to="/usernames" className="text-primary hover:underline">
                username search
              </Link>{" "}
              and an{" "}
              <Link to="/email-breach-check" className="text-primary hover:underline">
                email breach check
              </Link>{" "}
              to cover all exposure vectors.
            </p>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Check Your Digital Footprint Now</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Enter a username or email to scan 500+ platforms. Free, instant results with no login required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link to="/scan">
                  Run a Free Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/check-my-digital-footprint">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-xl px-6"
                >
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Related Tools</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild variant="ghost" size="sm"><Link to="/usernames">Username Search</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/reverse-username-search">Reverse Username Search</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/email-breach-check">Email Breach Check</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/digital-footprint-scanner">Digital Footprint Scanner</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/check-my-digital-footprint">Check My Digital Footprint</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link to="/audit-your-digital-footprint">Audit Your Digital Footprint</Link></Button>
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
