import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Lock,
  CreditCard,
  Eye,
  KeyRound,
  ShieldCheck,
  Snowflake,
  TrendingDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/data-breach-cleanup-checklist";

const webPageSchema = buildWebPageSchema({
  name: "Data Breach Cleanup Checklist (Step-by-Step Guide) | FootprintIQ",
  description:
    "Step-by-step data breach cleanup checklist. Change passwords, enable 2FA, freeze credit, and map your full digital exposure with FootprintIQ.",
  url: PAGE_URL,
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What should I do first after a data breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Change the password for the breached account immediately. If you reused that password anywhere else, change those too. Then enable two-factor authentication on every account that supports it. These two steps contain the most immediate risk from compromised credentials.",
      },
    },
    {
      "@type": "Question",
      name: "How long does data breach cleanup take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The immediate steps — changing passwords and enabling 2FA — can be done in an hour or two. Credit monitoring and fraud alerts take a few minutes to set up. Full digital exposure mapping and remediation is an ongoing process, but an initial scan with FootprintIQ takes minutes and provides a prioritised action plan.",
      },
    },
    {
      "@type": "Question",
      name: "Should I freeze my credit after a data breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If the breach exposed sensitive personal information like your Social Security number, date of birth, or financial details, a credit freeze is strongly recommended. It's free to place and lift with all three major credit bureaus (Equifax, Experian, TransUnion) and prevents new accounts from being opened in your name.",
      },
    },
    {
      "@type": "Question",
      name: "Is changing passwords enough after a breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Changing passwords addresses credential exposure, but it doesn't address the broader digital footprint risk. Your username, email, public profiles, and data broker listings may still be publicly visible. A comprehensive cleanup should include mapping your full public exposure to understand what's discoverable beyond the breached credentials.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Exposure Reduction Score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Exposure Reduction Score™ is FootprintIQ's primary metric for digital health. Scored from 0–100, it starts at 100 and applies deductions based on active exposure count, severity weighting, data broker presence, breach linkage, and search indexing. It provides a clear, quantifiable measure of your digital risk that you can track over time as you remediate exposures.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ remove my data from breached databases?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. FootprintIQ is an ethical digital footprint intelligence platform, not a removal service. It maps your full public exposure, scores your risk, and provides a prioritised remediation roadmap with official opt-out links. The remediation action is guided but user-directed, ensuring full transparency and consent.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Data Breach Cleanup Checklist", item: PAGE_URL },
  ],
};

const checklistSteps = [
  {
    icon: KeyRound,
    title: "Step 1: Change All Compromised Passwords",
    content: (
      <>
        <p>Start with the breached account. Change its password immediately to something unique and strong — at least 16 characters, mixing letters, numbers, and symbols. Then audit every other account where you used the same or a similar password. Password reuse is the single biggest amplifier of breach damage.</p>
        <p className="mt-3">Use a password manager like Bitwarden, 1Password, or KeePass to generate and store unique credentials for every service. This eliminates reuse entirely and makes future breaches far less impactful.</p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    title: "Step 2: Enable Two-Factor Authentication (2FA)",
    content: (
      <>
        <p>Enable 2FA on every account that supports it. App-based authenticators (Authy, Google Authenticator, Microsoft Authenticator) are significantly more secure than SMS-based codes, which are vulnerable to SIM-swap attacks.</p>
        <p className="mt-3">Prioritise enabling 2FA on: email accounts (the master key to password resets), financial services, social media, and cloud storage. Hardware security keys (YubiKey, Titan) offer the strongest protection for high-value accounts.</p>
      </>
    ),
  },
  {
    icon: CreditCard,
    title: "Step 3: Check Financial Accounts and Statements",
    content: (
      <>
        <p>Review recent transactions across all bank accounts, credit cards, and payment services. Look for unfamiliar charges, small "test" transactions (often precursors to larger fraud), or new payees you didn't add.</p>
        <p className="mt-3">Set up transaction alerts with your bank so you're notified immediately of any activity. If you find suspicious charges, report them to your bank and file a fraud report. Most financial institutions have dedicated fraud teams that can freeze accounts and reverse unauthorised transactions quickly.</p>
      </>
    ),
  },
  {
    icon: Snowflake,
    title: "Step 4: Freeze Your Credit (If Needed)",
    content: (
      <>
        <p>If the breach exposed sensitive personal information — Social Security numbers, dates of birth, addresses, or financial data — place a credit freeze with all three major credit bureaus: Equifax, Experian, and TransUnion. This is free and prevents anyone from opening new credit accounts in your name.</p>
        <p className="mt-3">A credit freeze doesn't affect your existing accounts or your credit score. You can temporarily lift it whenever you need to apply for credit. Consider also placing a fraud alert, which requires creditors to verify your identity before issuing new credit. For US residents, you can freeze your credit online at each bureau's website in minutes.</p>
      </>
    ),
  },
  {
    icon: Eye,
    title: "Step 5: Map Your Full Digital Footprint Exposure",
    content: (
      <>
        <p>This is where most breach cleanup guides stop — but it's arguably the most important step. Changing passwords secures your accounts. Mapping your digital footprint reveals what's <strong>publicly visible</strong> about you right now, independent of any breach.</p>
        <p className="mt-3"><Link to="/how-it-works" className="text-accent hover:underline">FootprintIQ's scanning pipeline</Link> checks hundreds of platforms for username reuse, public profiles, data broker listings, and search engine indexing. It provides a structured view of your entire public presence — not just what was leaked, but what anyone can find about you today.</p>
        <p className="mt-3">This step transforms breach cleanup from a reactive exercise into a proactive privacy strategy. You move from "what was leaked?" to "what can someone find about me?" — a fundamentally more useful question.</p>
      </>
    ),
  },
];

const DataBreachCleanupChecklist = () => {
  return (
    <>
      <Helmet>
        <title>Data Breach Cleanup Checklist (Step-by-Step Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Step-by-step data breach cleanup checklist. Change passwords, enable 2FA, freeze credit, and map your full digital exposure with FootprintIQ."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Data Breach Cleanup Checklist (Step-by-Step Guide) | FootprintIQ" />
        <meta property="og:description" content="A practical, step-by-step guide to cleaning up after a data breach — from password changes to full exposure mapping." />
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
            <li className="text-foreground font-medium">Data Breach Cleanup Checklist</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Breach Response Guide</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How To Clean Up{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                After a Data Breach
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A practical, step-by-step checklist for securing your accounts, protecting your finances, and mapping your full digital exposure after a breach.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Map Your Exposure Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Introduction ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why You Need a Structured Cleanup Plan</h2>
            <p>
              Finding out your data has been exposed in a breach is unsettling. The natural response is to change your password and move on. But a single password change addresses only one dimension of the risk. Data breaches can expose email addresses, usernames, phone numbers, physical addresses, and sometimes financial information — each of which creates different downstream risks.
            </p>
            <p>
              A structured cleanup plan ensures you address every exposure vector systematically, rather than reacting to the most obvious one and missing the rest. This checklist covers the five essential steps, from immediate credential security through to full digital footprint mapping — the step most people skip, and arguably the most important one.
            </p>
            <p>
              This guide is provided by <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong>, which helps individuals and organisations map, prioritise, and reduce their online exposure using public-data OSINT.
            </p>
          </div>
        </section>

        {/* ── Checklist Steps ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                The 5-Step Breach Cleanup Checklist
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Follow these steps in order. Each builds on the previous one to create a comprehensive response.
              </p>
            </div>

            <div className="space-y-6">
              {checklistSteps.map((step) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-border/50 bg-card p-6 md:p-8 hover:border-accent/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <div className="text-muted-foreground leading-relaxed">
                        {step.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Cleanup Should Include Public Exposure Mapping ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why Cleanup Should Include Public Exposure Mapping</h2>
            <p>
              Most breach cleanup advice focuses on credentials: change your password, enable 2FA, monitor your credit. These are essential steps. But they address the <em>direct</em> consequences of the breach — they don't address the <em>ambient</em> exposure that exists independently of any single incident.
            </p>
            <p>
              Consider what a motivated attacker can do with information from a breach combined with publicly available data:
            </p>
            <ul>
              <li><strong>Username correlation:</strong> A breached username can be searched across hundreds of platforms to find other accounts belonging to the same person. If you reuse usernames, one breach creates a map of your entire online presence.</li>
              <li><strong>Social engineering:</strong> Breached data combined with public social media profiles, forum posts, and data broker listings gives attackers the context they need for convincing phishing attacks or identity theft.</li>
              <li><strong>Data broker aggregation:</strong> People-search sites combine public records with commercial data to create detailed profiles. A breach adds another data point to these existing profiles, making them more complete and more dangerous.</li>
              <li><strong>Search engine persistence:</strong> Even after you secure an account, cached pages, archived forum posts, and indexed profiles may continue appearing in search results for months or years.</li>
            </ul>
            <p>
              This is why breach cleanup should extend beyond credential security to include a full assessment of your public digital footprint. You need to know not just what was leaked, but what's <strong>findable</strong> — and <Link to="/ethical-osint-charter" className="text-accent hover:underline">FootprintIQ's ethical approach</Link> ensures this assessment uses only publicly accessible data.
            </p>
          </div>
        </section>

        {/* ── Exposure Reduction Score ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Measure Your Progress:{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Exposure Reduction Score™</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A single number that tells you how well-protected your digital identity is — and how to improve it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                <div className="text-muted-foreground leading-relaxed space-y-3">
                  <p>
                    The Exposure Reduction Score™ is FootprintIQ's primary metric for digital health. Scored from 0–100, it starts at 100 (perfect privacy) and applies deductions based on five key factors:
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Active exposure count across platforms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Severity weighting of each exposure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Data broker presence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Breach linkage signals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span>Search engine indexing</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-4">Score Levels</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-semibold text-sm">0–39: High Risk</p>
                      <p className="text-xs text-muted-foreground">Significant public exposure requiring urgent action</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Lock className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-semibold text-sm">40–69: Moderate Risk</p>
                      <p className="text-xs text-muted-foreground">Notable exposures that should be addressed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-semibold text-sm">70–89: Good</p>
                      <p className="text-xs text-muted-foreground">Well-managed exposure with room for improvement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-sm">90–100: Strong</p>
                      <p className="text-xs text-muted-foreground">Minimal public exposure — excellent digital hygiene</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8 prose prose-lg dark:prose-invert">
              <p>
                Pro users can track their Exposure Reduction Score over time, viewing trend graphs and historical data that show how remediation efforts translate into measurable privacy improvements. Free users see a current snapshot — enough to understand where they stand and what to prioritise. Learn more about how this fits into the full platform on our <Link to="/how-it-works" className="text-accent hover:underline">How It Works</Link> page.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.acceptedAnswer.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't Stop at Passwords
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Secure your accounts, then map your full digital exposure. Know what's visible. Know what to fix first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Ethical Footprint Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer Reinforcement Block ── */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default DataBreachCleanupChecklist;