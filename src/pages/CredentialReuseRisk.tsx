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
  ChevronRight,
  Shield,
  AlertTriangle,
  Key,
  Lock,
  Repeat,
  Target,
  Users,
  Zap,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/credential-reuse-risk";

const webPageSchema = buildWebPageSchema({
  name: "Credential Reuse Risk – How Password & Username Reuse Enables Account Takeover",
  description:
    "Understand how credential reuse and credential stuffing attacks work. Learn why reusing passwords and usernames across platforms creates cascading security risks.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "What is credential reuse?",
    answer:
      "Credential reuse is the practice of using the same username, email, or password across multiple platforms. When one platform is breached, attackers can use the stolen credentials to access your accounts on other services — a technique known as credential stuffing.",
  },
  {
    question: "What is a credential stuffing attack?",
    answer:
      "Credential stuffing is an automated attack where stolen username/password pairs from one breach are systematically tested against hundreds of other websites and services. Attackers use botnets to test millions of credential combinations at scale, exploiting the fact that most people reuse passwords.",
  },
  {
    question: "Why is username reuse dangerous?",
    answer:
      "Even without password reuse, using the same username across platforms allows attackers to map your entire online identity. This identity mapping reveals which services you use, enabling targeted phishing attacks, social engineering, and prioritised credential stuffing attempts.",
  },
  {
    question: "How do I check if my credentials have been compromised?",
    answer:
      "Use FootprintIQ to scan your username and email address. The platform checks for username exposure across 500+ platforms and cross-references your email against known breach databases. This reveals both your public attack surface and any compromised credentials.",
  },
  {
    question: "What is an account discovery attack?",
    answer:
      "An account discovery attack uses a known identifier (username or email) to enumerate which services a person uses. By checking a username across hundreds of platforms, an attacker can identify high-value targets — banking, email, cloud storage — for more focused attacks.",
  },
  {
    question: "How can I protect myself from credential stuffing?",
    answer:
      "Use unique passwords for every account (via a password manager), enable multi-factor authentication (MFA) wherever possible, use different usernames for sensitive accounts, and regularly audit your digital footprint to identify exposed credentials. FootprintIQ helps with the audit step.",
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
    { "@type": "ListItem", position: 2, name: "Credential Reuse Risk", item: PAGE_URL },
  ],
};

const attackChain = [
  {
    icon: Key,
    title: "1. Initial Breach",
    description: "A platform you use is breached. Your email, username, and hashed (or plaintext) password are leaked and traded on dark web forums.",
  },
  {
    icon: Repeat,
    title: "2. Credential Stuffing",
    description: "Attackers feed stolen credentials into automated bots that test them against hundreds of other services — banking, email, cloud storage, social media.",
  },
  {
    icon: Target,
    title: "3. Account Takeover",
    description: "Because you reused your password, the attacker gains access to multiple accounts. They can change passwords, access financial data, or impersonate you.",
  },
  {
    icon: Users,
    title: "4. Identity Mapping",
    description: "Your reused username allows attackers to map your entire online presence. They know which services you use, enabling targeted phishing and social engineering.",
  },
];

const protectionSteps = [
  {
    icon: Lock,
    title: "Use a Password Manager",
    description: "Generate and store unique, complex passwords for every account. Services like 1Password, Bitwarden, or iCloud Keychain eliminate the need to remember passwords.",
  },
  {
    icon: Shield,
    title: "Enable Multi-Factor Authentication",
    description: "Add a second layer of defence. Even if your password is compromised, MFA prevents unauthorised access. Use authenticator apps over SMS where possible.",
  },
  {
    icon: Users,
    title: "Vary Your Usernames",
    description: "Use different usernames for sensitive accounts (banking, email) vs. public-facing accounts (social media, forums). This breaks the identity chain that enables account discovery attacks.",
  },
  {
    icon: Zap,
    title: "Audit Your Digital Footprint",
    description: "Regularly scan your username and email with FootprintIQ to identify exposed credentials, breached accounts, and public attack surface. You can't fix what you don't know about.",
  },
];

export default function CredentialReuseRisk() {
  return (
    <>
      <Helmet>
        <title>Credential Reuse Risk – How Password Reuse Enables Account Takeover | FootprintIQ</title>
        <meta
          name="description"
          content="Understand how credential reuse and credential stuffing attacks work. Learn why reusing passwords and usernames across platforms creates cascading security risks."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Credential Reuse Risk | FootprintIQ" />
        <meta property="og:description" content="How password and username reuse enables credential stuffing, account takeover, and identity mapping attacks." />
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
            <li className="text-foreground font-medium">Credential Reuse Risk</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20 mb-8">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Security Risk</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Credential Reuse Risk: How Password & Username Reuse Enables Account Takeover
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              81% of data breaches involve reused or weak passwords. When you reuse credentials across platforms, a single breach can compromise your entire digital identity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Check Your Exposure <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/username-reuse-risk">Username Reuse Risk</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What Is Credential Reuse */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What Is Credential Reuse?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Credential reuse is the practice of using the same password, email, or username combination across multiple online services. While convenient, this creates a cascading security vulnerability: when any one of those services is breached, every account sharing those credentials becomes compromised.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              This is different from <Link to="/username-reuse-risk" className="text-accent hover:underline">username reuse risk</Link>, which focuses on how using the same username across platforms enables identity mapping. Credential reuse risk specifically addresses how shared <strong className="text-foreground">authentication credentials</strong> (passwords + usernames) enable automated attacks.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The primary attack vector enabled by credential reuse is <strong className="text-foreground">credential stuffing</strong> — an automated technique where stolen credentials from one breach are systematically tested against hundreds of other services.
            </p>
          </div>
        </section>

        {/* Attack Chain */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">The Credential Stuffing Attack Chain</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A single breached password can trigger a cascade of account compromises. Here's how attackers exploit credential reuse.
            </p>

            <div className="space-y-6">
              {attackChain.map((step) => (
                <div key={step.title} className="flex gap-4 items-start rounded-xl border border-border/50 bg-card p-6">
                  <div className="p-2 rounded-lg bg-destructive/10 flex-shrink-0">
                    <step.icon className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scale of the Problem */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Scale of the Problem</h2>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { stat: "15B+", label: "Stolen credentials circulating on the dark web" },
                { stat: "81%", label: "Of data breaches involve reused or weak passwords" },
                { stat: "65%", label: "Of people reuse passwords across multiple accounts" },
              ].map((item) => (
                <div key={item.label} className="text-center p-6 rounded-xl border border-border/50 bg-card">
                  <p className="text-3xl font-bold text-accent mb-2">{item.stat}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Credential stuffing attacks are industrialised. Attackers use automated tools that can test millions of credential pairs per hour against thousands of websites simultaneously. The only effective defence is ensuring that no two accounts share the same password.
            </p>
          </div>
        </section>

        {/* Protection Steps */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How to Protect Yourself</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Four practical steps to break the credential reuse chain and reduce your attack surface.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {protectionSteps.map((step) => (
                <div key={step.title} className="rounded-xl border border-border/50 bg-card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <step.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Connection to FootprintIQ */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How FootprintIQ Helps</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              FootprintIQ directly addresses credential reuse risk by mapping your public attack surface:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                "Username enumeration reveals which platforms you're registered on — showing attackers' potential targets",
                "Email breach detection identifies which of your credentials have already been compromised",
                "Cross-referencing username and breach data reveals credential reuse patterns",
                "Risk scoring prioritises which accounts need immediate password changes",
                "Remediation guidance provides platform-specific steps for securing each account",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Read more about <Link to="/username-reuse-risk" className="text-accent hover:underline">username reuse risk</Link> and how identity mapping compounds credential stuffing attacks. Review our <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> for how we handle this data responsibly.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related Tools */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-5xl mx-auto">
            <RelatedToolsGrid currentPath="/credential-reuse-risk" />
          </div>
        </section>

        {/* About */}
        <section className="py-8 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Assess Your Credential Reuse Risk</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover which of your accounts are exposed and which credentials may be compromised.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
