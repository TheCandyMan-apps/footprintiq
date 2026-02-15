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
  Settings,
  UserCheck,
  AlertTriangle,
  ClipboardCheck,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/audit-your-digital-footprint";

const webPageSchema = buildWebPageSchema({
  name: "How to Audit Your Digital Footprint – Step-by-Step Guide",
  description:
    "Learn how to audit your digital footprint in 7 steps. Google yourself, check breaches, search usernames, review data brokers, and automate it all with FootprintIQ.",
  url: PAGE_URL,
  datePublished: "2026-02-15",
  dateModified: "2026-02-15",
});

const faqs = [
  {
    question: "How do I audit my digital footprint?",
    answer:
      "Start by Googling your name and usernames, then check email breach databases like Have I Been Pwned, search your usernames across platforms, review data broker sites for your personal information, audit your social media privacy settings, and check for dark web exposure. FootprintIQ automates all of these steps into a single scan, giving you a complete audit in under 60 seconds.",
  },
  {
    question: "What is a digital footprint audit?",
    answer:
      "A digital footprint audit is a systematic review of all publicly accessible information linked to your identity. It covers social media profiles, data broker listings, breach records, username presence across platforms, and public records. The goal is to understand your full exposure surface so you can prioritise what to secure, remove, or monitor.",
  },
  {
    question: "How often should I audit my digital footprint?",
    answer:
      "At minimum, conduct a full audit quarterly. You should also re-audit after any data breach notification, job change, relationship change, or major life event. Digital footprints grow continuously as new data appears on broker sites, breaches are disclosed, and platforms change their privacy defaults.",
  },
  {
    question: "Can I do a digital footprint audit for free?",
    answer:
      "Yes, but manual audits are time-consuming and incomplete. You can Google yourself and check Have I Been Pwned for free. However, checking 500+ platforms for username presence and dozens of data brokers manually would take hours. FootprintIQ offers a free tier that automates username scanning across 500+ platforms and basic breach checks.",
  },
  {
    question: "What tools do I need for a personal data audit?",
    answer:
      "For a thorough audit you need: a search engine (Google), a breach checker (Have I Been Pwned), a username search tool, access to major data broker sites, and ideally a dark web monitoring service. FootprintIQ combines all of these into one platform with AI-powered false-positive filtering, saving hours of manual work.",
  },
  {
    question: "What's the difference between a digital footprint audit and a privacy scan?",
    answer:
      "A privacy scan typically checks one dimension — such as breaches or data brokers. A digital footprint audit is comprehensive: it covers usernames, emails, social profiles, breach data, data brokers, public records, and dark web signals. FootprintIQ performs a full audit, not just a partial scan.",
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
    { "@type": "ListItem", position: 2, name: "Audit Your Digital Footprint", item: PAGE_URL },
  ],
};

const auditSteps = [
  {
    step: "1",
    icon: Search,
    title: "Google Yourself",
    description: "Search your full name, email addresses, phone numbers, and common usernames in Google. Use quotes for exact matches. Check the first five pages of results — not just the first.",
    detail: "Try variations: \"John Smith London\", \"jsmith92\", your phone number in quotes. Check Google Images too — profile photos from forgotten accounts often appear. This reveals the surface layer of your footprint.",
    action: "This gives you a baseline of what the public internet shows. Most people stop here — but Google only indexes a fraction of your exposure.",
  },
  {
    step: "2",
    icon: Mail,
    title: "Check Email Breach Databases",
    description: "Enter your email addresses into Have I Been Pwned (haveibeenpwned.com) to see which data breaches have exposed your credentials.",
    detail: "Check every email you've ever used — including old work emails, university addresses, and throwaway accounts. Each breach may have exposed different data: passwords, addresses, phone numbers, or security questions.",
    action: "If any breaches appear, change those passwords immediately and enable two-factor authentication. Check our breach cleanup checklist for a step-by-step guide.",
    link: "/data-breach-cleanup-checklist",
    linkText: "Breach Cleanup Checklist →",
  },
  {
    step: "3",
    icon: UserCheck,
    title: "Search Your Usernames Across Platforms",
    description: "Your username is a universal key to your online presence. A single username can link accounts across hundreds of platforms, even ones you've forgotten.",
    detail: "Manual tools like Sherlock or Maigret can check usernames across platforms, but they produce many false positives. FootprintIQ automates this with AI-powered confidence scoring (LENS) to filter noise and surface real matches.",
    action: "Run a username scan to discover every platform where your username appears publicly. This often reveals the most surprising exposures.",
    link: "/scan",
    linkText: "Scan Your Username →",
  },
  {
    step: "4",
    icon: Database,
    title: "Review Data Broker Sites",
    description: "People-search sites like Spokeo, BeenVerified, MyLife, and Whitepages aggregate your personal data into searchable profiles — often including your address, phone number, relatives, and estimated income.",
    detail: "Search for yourself on the top 10 data broker sites. Each one has a different opt-out process. FootprintIQ identifies which brokers list your information and provides direct links to each opt-out page.",
    action: "Opt out of every broker where your data appears. This is tedious manually — our data broker removal guide walks through each one.",
    link: "/data-broker-removal-guide",
    linkText: "Data Broker Removal Guide →",
  },
  {
    step: "5",
    icon: Eye,
    title: "Audit Social Media Privacy Settings",
    description: "Review the privacy settings on every social media account. Check what's visible to the public vs. friends-only vs. truly private.",
    detail: "Log out and view your own profiles as a stranger would. Check: profile photo, bio, friends list, posts, tagged photos, check-ins, and linked accounts. Many platforms change privacy defaults during updates without notification.",
    action: "Lock down anything you don't want publicly visible. Pay special attention to Facebook (complex privacy layers), LinkedIn (profile visibility settings), and Instagram (public vs. private account).",
  },
  {
    step: "6",
    icon: Globe,
    title: "Check for Dark Web Exposure",
    description: "Your credentials may have been compiled into dark web breach databases that circulate among attackers. Basic breach checkers don't always cover these.",
    detail: "Dark web exposure typically means your email-password combinations from old breaches are available in credential stuffing lists. FootprintIQ's dark web signal detection checks for references to your data in known compilation databases.",
    action: "If dark web exposure is found, change all affected passwords and enable 2FA everywhere. Consider using a password manager to generate unique passwords for every account.",
  },
  {
    step: "7",
    icon: ClipboardCheck,
    title: "Automate With FootprintIQ",
    description: "Steps 1–6 can take hours manually and still miss exposures. FootprintIQ automates the entire audit into a single scan that covers 500+ platforms, breach databases, data brokers, and dark web signals.",
    detail: "FootprintIQ runs all these checks simultaneously, correlates findings across categories (e.g., a breached email linked to a reused username), and produces a prioritised remediation plan. The LENS AI engine filters false positives so you only act on verified exposure.",
    action: "Run your first scan free and get your full digital footprint audit in under 60 seconds.",
    link: "/scan",
    linkText: "Start Your Free Audit →",
  },
];

export default function AuditYourDigitalFootprint() {
  return (
    <>
      <Helmet>
        <title>How to Audit Your Digital Footprint – 7-Step Guide | FootprintIQ</title>
        <meta
          name="description"
          content="Learn how to audit your digital footprint in 7 steps. Google yourself, check breaches, search usernames, review data brokers, and automate it all with FootprintIQ."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Audit Your Digital Footprint – Step-by-Step Guide | FootprintIQ" />
        <meta property="og:description" content="Complete 7-step guide to auditing your digital footprint. Discover every publicly visible data point and learn how to reduce your exposure." />
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
            <li className="text-foreground font-medium">Audit Your Digital Footprint</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <ClipboardCheck className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Digital Footprint Audit</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to Audit Your Digital Footprint: A Complete 7-Step Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Your digital footprint grows every day. Old accounts, data brokers, breach records, and social profiles accumulate into a detailed map of your life. Here's how to audit it — and take back control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Automate My Audit Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Audit */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Why Should You Audit Your Digital Footprint?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              A digital footprint audit reveals what anyone — employers, scammers, data brokers, or strangers — can discover about you using publicly available sources. Most people dramatically underestimate their exposure. A 2026 study found that the average person has <strong className="text-foreground">over 120 publicly discoverable data points</strong> spread across social media, breach databases, and data broker sites.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Without an audit, you can't know what to fix. You might change a password on one breached account while ignoring the same reused password on 15 other platforms. You might lock down your Facebook while your Spokeo profile lists your home address for anyone to find.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A thorough audit gives you the complete picture. FootprintIQ automates this process — but whether you use our tool or do it manually, auditing is the essential first step to <Link to="/reduce-digital-footprint" className="text-accent hover:underline">reducing your digital footprint</Link>.
            </p>
          </div>
        </section>

        {/* 7 Steps */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">7 Steps to a Complete Digital Footprint Audit</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Follow these steps in order to systematically map your entire online exposure. Each step builds on the previous one.
            </p>

            <div className="space-y-8">
              {auditSteps.map((s) => (
                <div key={s.step} className="rounded-xl border border-border/50 bg-card p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <span className="text-accent font-bold text-lg">{s.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <s.icon className="w-5 h-5 text-accent" />
                        <h3 className="text-xl font-bold">{s.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed mb-3">{s.description}</p>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed mb-3">{s.detail}</p>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-foreground leading-relaxed">{s.action}</p>
                          {s.link && (
                            <Link to={s.link} className="text-sm text-accent hover:underline font-medium mt-1 inline-block">
                              {s.linkText}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Manual vs Automated */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Manual Audit vs. Automated Audit</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-semibold text-foreground">Aspect</th>
                    <th className="text-left p-4 font-semibold text-foreground">Manual Audit</th>
                    <th className="text-left p-4 font-semibold text-accent">FootprintIQ Automated</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Time required</td>
                    <td className="p-4">4–8 hours</td>
                    <td className="p-4">Under 60 seconds</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Platforms checked</td>
                    <td className="p-4">10–20 (manual searches)</td>
                    <td className="p-4">500+ platforms</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">False-positive filtering</td>
                    <td className="p-4">Manual judgement</td>
                    <td className="p-4">AI-powered (LENS)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Dark web coverage</td>
                    <td className="p-4">Limited (HIBP only)</td>
                    <td className="p-4">Breach compilations + dark web signals</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Data broker identification</td>
                    <td className="p-4">Manual site-by-site search</td>
                    <td className="p-4">Automated scanning with opt-out links</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-4 font-medium text-foreground">Cross-correlation</td>
                    <td className="p-4">None</td>
                    <td className="p-4">Links breaches, usernames, and brokers</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Remediation guidance</td>
                    <td className="p-4">Self-research</td>
                    <td className="p-4">Prioritised action plan</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-10 text-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/scan">
                  Start Your Free Audit <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What Happens After */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What to Do After Your Audit</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              An audit is only valuable if you act on the findings. Here's the recommended order of operations based on risk severity:
            </p>
            <div className="space-y-4">
              {[
                { priority: "Critical", action: "Change breached passwords and enable 2FA on all accounts with compromised credentials.", color: "text-destructive" },
                { priority: "High", action: "Opt out of data broker sites that display your home address, phone number, or financial information.", color: "text-orange-500" },
                { priority: "Medium", action: "Delete or deactivate unused accounts on platforms you no longer use. Each dormant account is an attack surface.", color: "text-yellow-500" },
                { priority: "Low", action: "Tighten privacy settings on active social media accounts. Restrict who can see your posts, friends list, and tagged photos.", color: "text-accent" },
                { priority: "Ongoing", action: "Schedule regular re-audits. Set a quarterly reminder, or use FootprintIQ's continuous monitoring to catch new exposures automatically.", color: "text-muted-foreground" },
              ].map((item) => (
                <div key={item.priority} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card">
                  <span className={`text-sm font-bold ${item.color} min-w-[70px]`}>{item.priority}</span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.action}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mt-6">
              For a detailed post-breach action plan, see our <Link to="/data-breach-cleanup-checklist" className="text-accent hover:underline">Data Breach Cleanup Checklist</Link>. For data broker removal, follow our <Link to="/data-broker-removal-guide" className="text-accent hover:underline">step-by-step removal guide</Link>.
            </p>
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
            <RelatedToolsGrid currentPath="/audit-your-digital-footprint" />
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
