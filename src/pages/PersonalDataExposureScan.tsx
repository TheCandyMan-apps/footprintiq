import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Search,
  Mail,
  Shield,
  Globe,
  Eye,
  Database,
  AlertTriangle,
  Lock,
  Layers,
  FileWarning,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/personal-data-exposure-scan";

const webPageSchema = buildWebPageSchema({
  name: "Personal Data Exposure Scan – Check How Exposed Your Data Is",
  description:
    "Run a personal data exposure scan to discover what's publicly visible about you. Check breaches, data brokers, username exposure, and dark web signals in one scan.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What is a personal data exposure scan?",
    answer:
      "A personal data exposure scan is a comprehensive check of all publicly accessible information linked to your identity. Unlike a simple breach check (which only tells you if your email appeared in a known data breach), a full exposure scan covers usernames across 500+ platforms, data broker listings, social media visibility, dark web signals, and public records. FootprintIQ provides this full-surface scan in under 60 seconds.",
  },
  {
    question: "How do I check if my personal data is exposed?",
    answer:
      "Start with a free FootprintIQ scan. Enter your username or email address, and FootprintIQ will check 500+ platforms, breach databases, data broker sites, and dark web signals. You'll receive a complete exposure report with risk scoring and prioritised remediation steps. For a manual approach, you can Google yourself, check Have I Been Pwned, and search data broker sites individually — but this takes hours and misses many sources.",
  },
  {
    question: "What types of personal data exposure exist?",
    answer:
      "There are four main types: (1) Breach exposure — credentials leaked in data breaches; (2) Data broker exposure — personal information aggregated on people-search sites; (3) Social exposure — publicly visible social media profiles and posts; (4) Dark web exposure — credentials circulating in underground databases. Most tools only check one type. FootprintIQ checks all four in a single scan.",
  },
  {
    question: "Is a personal data exposure scan the same as Have I Been Pwned?",
    answer:
      "No. Have I Been Pwned is excellent for checking email breach exposure, but it only covers one dimension of your data exposure. It doesn't check username presence across platforms, data broker listings, social media visibility, or dark web breach compilations. FootprintIQ includes breach checking (like HIBP) as one component of a much broader exposure scan.",
  },
  {
    question: "How often should I check my data exposure?",
    answer:
      "We recommend scanning at least quarterly, and immediately after receiving a data breach notification, changing jobs, or any significant life event. Digital exposure is not static — new breaches are disclosed weekly, data brokers continuously re-aggregate information, and platform privacy settings change. Regular scanning catches new exposures before they compound.",
  },
  {
    question: "What should I do if my personal data is exposed?",
    answer:
      "Prioritise by severity: (1) Change passwords on any breached accounts and enable 2FA; (2) Opt out of data broker sites listing your personal information; (3) Lock down social media privacy settings; (4) Delete or deactivate unused accounts; (5) Set up ongoing monitoring to catch new exposures. FootprintIQ provides a prioritised remediation plan with every scan.",
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
    { "@type": "ListItem", position: 2, name: "Personal Data Exposure Scan", item: PAGE_URL },
  ],
};

const exposureTypes = [
  {
    icon: Mail,
    title: "Breach Exposure",
    subtitle: "Leaked credentials from data breaches",
    description: "When companies suffer data breaches, your email, passwords, and personal information can end up in publicly circulated databases. Over 15 billion credentials have been exposed in known breaches. Even if you've changed your password, the old credentials may still be used in credential stuffing attacks against other accounts where you reused the same password.",
    severity: "Critical if passwords are reused across accounts",
    tool: "FootprintIQ checks aggregated breach databases and correlates findings with your username exposure to identify cascading credential reuse risks.",
  },
  {
    icon: Database,
    title: "Data Broker Exposure",
    subtitle: "Personal information on people-search sites",
    description: "Data brokers like Spokeo, BeenVerified, MyLife, and Whitepages aggregate public records, social media data, and purchase history into searchable profiles. These often include your home address, phone number, email, relatives' names, estimated income, and property records. Anyone can access these profiles — often for free or a small fee.",
    severity: "High — exposes physical location and contact details",
    tool: "FootprintIQ identifies which data brokers list your information and provides direct opt-out links for each one, prioritised by exposure severity.",
  },
  {
    icon: Eye,
    title: "Social Media Exposure",
    subtitle: "Publicly visible profiles and posts",
    description: "Even 'private' social media accounts often expose more than you realise. Profile photos, bios, follower counts, and connected accounts are frequently visible to unauthenticated visitors. Platform privacy defaults change during updates, sometimes re-exposing information you previously restricted.",
    severity: "Medium — enables social engineering and profiling",
    tool: "FootprintIQ checks your username across 500+ social platforms, forums, and communities to map where you have a public presence.",
  },
  {
    icon: Globe,
    title: "Dark Web Exposure",
    subtitle: "Credentials in underground databases",
    description: "Breached credentials are compiled into massive databases traded on dark web forums and marketplaces. These 'combo lists' are used for credential stuffing attacks — automated attempts to log into accounts using leaked email-password combinations. Your data may be circulating even if the original breach happened years ago.",
    severity: "Critical if credentials are still active",
    tool: "FootprintIQ's dark web signal detection checks for references to your data in known breach compilations, clearly distinguishing between types of exposure.",
  },
];

export default function PersonalDataExposureScan() {
  return (
    <>
      <Helmet>
        <title>Personal Data Exposure Scan – Check How Exposed Your Data Is | FootprintIQ</title>
        <meta
          name="description"
          content="Run a personal data exposure scan to discover what's publicly visible about you. Check breaches, data brokers, username exposure, and dark web signals in one scan."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Personal Data Exposure Scan – Full Exposure Check | FootprintIQ" />
        <meta property="og:description" content="Discover how exposed your personal data is. Check breaches, data brokers, social profiles, and dark web signals in one comprehensive scan." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Personal Data Exposure Scan</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <FileWarning className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Data Exposure Scanner</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Personal Data Exposure Scan: How Exposed Is Your Personal Information?
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Your personal data is more exposed than you think. Breach records, data broker profiles, social media visibility, and dark web databases create a traceable map of your identity. Find out exactly how exposed you are.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Check My Data Exposure <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What is Data Exposure */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What Is Personal Data Exposure?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Personal data exposure refers to any instance where your private information — name, email, phone number, address, passwords, or online activity — becomes publicly accessible or discoverable through legal, public-data sources. This happens through data breaches, data broker aggregation, social media over-sharing, and credential leaks.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Data exposure is cumulative. A single breach might expose your email and password. A data broker might list your home address. A social media profile reveals your employer and location. Individually, each piece seems minor. Combined, they create a detailed identity profile that enables <Link to="/how-identity-theft-starts" className="text-accent hover:underline">identity theft</Link>, targeted phishing, social engineering, and account takeover attacks.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Understanding the full surface of your exposure — not just breaches — is the first step to reducing it. That's what a personal data exposure scan provides.
            </p>
          </div>
        </section>

        {/* Why It Matters */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Why Does Data Exposure Matter?</h2>
            <div className="space-y-4">
              {[
                { title: "Identity Theft", description: "Exposed personal details (address, date of birth, SSN fragments) are used to open fraudulent accounts, file fake tax returns, and steal your identity." },
                { title: "Account Takeover", description: "Leaked credentials from breaches are used in credential stuffing attacks. If you reuse passwords, a single breach can compromise dozens of accounts." },
                { title: "Targeted Phishing", description: "Attackers use exposed personal data to craft convincing phishing emails. Knowing your employer, bank, and recent purchases makes social engineering far more effective." },
                { title: "Reputation Damage", description: "Employers, colleagues, and acquaintances can discover outdated, embarrassing, or inaccurate information about you through data brokers and public profiles." },
                { title: "Physical Safety", description: "Home addresses on data broker sites create risks for stalking, harassment, and home invasions — particularly for public figures, activists, and domestic abuse survivors." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-lg border border-border/50 bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <h3 className="font-bold text-foreground">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4 Types of Exposure */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">4 Types of Personal Data Exposure</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Most tools only check one type of exposure. FootprintIQ covers all four in a single scan.
            </p>

            <div className="space-y-6">
              {exposureTypes.map((type) => (
                <div key={type.title} className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <type.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-3">{type.description}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                      <span className="text-muted-foreground"><strong className="text-foreground">Severity:</strong> {type.severity}</span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{type.tool}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FootprintIQ vs Breach-Only */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">
              Full Exposure Scan vs. Breach-Only Checkers
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Tools like Have I Been Pwned are excellent — but they only check one dimension. Here's what a full exposure scan adds.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Capability</th>
                    <th className="text-left p-4 font-semibold text-muted-foreground">HIBP / Breach Checkers</th>
                    <th className="text-left p-4 font-semibold text-accent">FootprintIQ Full Scan</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Email breach detection</td>
                    <td className="p-4">✓</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Username search (500+ platforms)</td>
                    <td className="p-4">✗</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Data broker scanning</td>
                    <td className="p-4">✗</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Dark web signal detection</td>
                    <td className="p-4">Limited</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Social profile visibility</td>
                    <td className="p-4">✗</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Cross-correlation of findings</td>
                    <td className="p-4">✗</td>
                    <td className="p-4">✓</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">AI false-positive filtering</td>
                    <td className="p-4">✗</td>
                    <td className="p-4">✓ (LENS)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Remediation guidance</td>
                    <td className="p-4">Basic (change password)</td>
                    <td className="p-4">Prioritised action plan</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 rounded-xl border border-accent/20 bg-accent/5 text-center">
              <p className="text-muted-foreground mb-4">
                <strong className="text-foreground">Have I Been Pwned is a great starting point.</strong> FootprintIQ is where you go next — to see the full picture and act on it.
              </p>
              <p className="text-sm text-muted-foreground">
                Learn more: <Link to="/after-have-i-been-pwned-what-next" className="text-accent hover:underline">After Have I Been Pwned — What's Next?</Link>
              </p>
            </div>

            <div className="mt-10 text-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run My Exposure Scan Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-border/50 bg-card px-6">
                  <AccordionTrigger className="text-left font-semibold text-base py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Internal Links & Footer */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto space-y-12">
            <RelatedToolsGrid currentPath="/personal-data-exposure-scan" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
