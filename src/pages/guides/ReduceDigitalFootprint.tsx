import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ResponsibleUsePledge } from "@/components/ResponsibleUsePledge";
import { GuideBackLink } from "@/components/guides/GuideBackLink";
import { DiscoveryToProofSection } from "@/components/DiscoveryToProofSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  { q: "How long does remediation take?", a: "It depends on the number of exposures. Removing a single data-broker listing can take 24–72 hours. A full clean-up across dozens of sites typically takes 2–4 weeks of periodic effort." },
  { q: "Do I need technical skills?", a: "No. Most remediation steps involve visiting a website and submitting an opt-out form. FootprintIQ provides direct links and step-by-step instructions for every recommended action." },
  { q: "Will my exposure score reach zero?", a: "Unlikely. Some public records are legally required to remain accessible. The goal is to minimise unnecessary exposure — not achieve total invisibility." },
  { q: "How often should I re-scan?", a: "We recommend scanning once a month. New data-broker listings and breach disclosures appear regularly, so periodic checks catch new exposures early." },
  { q: "Does FootprintIQ remove data for me?", a: "No. FootprintIQ identifies exposure and guides you through removal. You submit removal requests yourself, which keeps you in control of your own data." },
];

export default function ReduceDigitalFootprint() {
  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqs.map((f) => ({
      "@type": "Question" as const,
      name: f.q,
      acceptedAnswer: { "@type": "Answer" as const, text: f.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
      { "@type": "ListItem", position: 2, name: "Guides", item: "https://footprintiq.app/guides" },
      { "@type": "ListItem", position: 3, name: "Reduce Your Digital Footprint", item: "https://footprintiq.app/guides/reduce-digital-footprint" },
    ],
  };

  return (
    <>
      <SEO
        title="How to Reduce Your Digital Footprint — Step-by-Step Guide | FootprintIQ"
        description="A practical, step-by-step guide to reducing your online exposure. Learn how to find, prioritise, and remove public data using ethical OSINT techniques."
        canonical="https://footprintiq.app/guides/reduce-digital-footprint"
        schema={{ faq: faqSchema, breadcrumbs: breadcrumbSchema }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-3xl mx-auto">
            <GuideBackLink />
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              How to Reduce Your Digital Footprint
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A practical, 1,200-word guide to discovering, prioritising, and removing your public exposure — using ethical OSINT principles and measurable outcomes.
            </p>
          </div>
        </section>

        {/* Article body */}
        <section className="py-12 px-6">
          <article className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2>Why Your Digital Footprint Matters</h2>
            <p>
              Every account you create, every forum you post on, and every data broker that scrapes your details adds another layer to your digital footprint. This accumulated exposure creates a discoverable profile that anyone — recruiters, scammers, stalkers, or automated bots — can piece together using freely available tools.
            </p>
            <p>
              The problem is not that the information exists; it is that most people have no idea how much of it is out there. A{" "}
              <Link to="/free-scan">free FootprintIQ scan</Link> typically surfaces 20–80 public data points that the user had forgotten about or never knew were indexed.
            </p>

            <h2>Step 1 — Discover What Is Exposed</h2>
            <p>
              Before you can reduce anything, you need an accurate inventory. Start with a username scan across 500+ platforms. Add an email breach check to see whether your credentials have appeared in known data leaks. If you operate a domain, run a WHOIS look-up to check registrant details.
            </p>
            <p>
              FootprintIQ combines these checks into a single workflow, producing a consolidated exposure report with confidence-scored findings. Each finding includes the source, URL, and a severity rating so you can prioritise effectively. For a deeper understanding of this process, see our{" "}
              <Link to="/how-it-works">How It Works</Link> overview.
            </p>

            <h2>Step 2 — Prioritise by Risk</h2>
            <p>
              Not all exposure is equally dangerous. A LinkedIn profile you actively maintain is very different from an old forum account that still displays your real name, email address, and location. Prioritisation should follow a simple hierarchy:
            </p>
            <ol>
              <li><strong>Critical:</strong> Breach data containing passwords, financial details, or government IDs.</li>
              <li><strong>High:</strong> Data-broker listings that aggregate your phone number, address, and family connections.</li>
              <li><strong>Medium:</strong> Forgotten social media accounts with personal photos or location data.</li>
              <li><strong>Low:</strong> Usernames that exist on platforms but contain no meaningful personal information.</li>
            </ol>
            <p>
              FootprintIQ assigns a remediation priority to each finding, helping you focus effort where it matters most. Learn more about how risk is categorised in our{" "}
              <Link to="/ethical-osint-charter">Ethical OSINT Charter</Link>.
            </p>

            <h2>Step 3 — Act on Each Finding</h2>
            <p>
              Remediation actions fall into a few categories:
            </p>
            <ul>
              <li><strong>Delete the account.</strong> Log in and permanently delete accounts you no longer use. Most platforms provide a settings page for this.</li>
              <li><strong>Submit opt-out requests.</strong> Data brokers are legally required (in many jurisdictions) to remove your data when you request it. FootprintIQ links directly to each broker's opt-out page.</li>
              <li><strong>Change exposed credentials.</strong> If a password appeared in a breach, change it immediately — and anywhere else you reused it. Enable two-factor authentication.</li>
              <li><strong>Adjust privacy settings.</strong> For accounts you want to keep, tighten visibility. Set profiles to private, remove public contact details, and disable search-engine indexing where possible.</li>
              <li><strong>Contact the platform.</strong> Some content — cached pages, archived posts — requires a direct request to the platform or to Google's{" "}
                <a href="https://support.google.com/websearch/troubleshooter/9685456" target="_blank" rel="noopener noreferrer">removal request tool</a>.
              </li>
            </ul>
            <p>
              For a structured checklist, see our <Link to="/reduce-digital-footprint">Reduce Digital Footprint</Link> resource page, which includes platform-specific instructions.
            </p>

            <h2>Step 4 — Verify Your Progress</h2>
            <p>
              Remediation is not a one-time event. After submitting removal requests and deleting accounts, run a follow-up scan to confirm the changes have taken effect. Data brokers can take 24–72 hours to process requests, and some re-list data within weeks.
            </p>
            <p>
              FootprintIQ's re-scan feature lets you compare your current exposure against a previous baseline. This before-and-after comparison provides measurable proof that your efforts are working — or highlights areas that still need attention.
            </p>

            <h2>Step 5 — Measure and Maintain</h2>
            <p>
              Your digital footprint is not static. New breaches occur, new data-broker sites launch, and platforms change their privacy defaults. Ongoing monitoring is the only way to stay ahead.
            </p>
            <p>
              We recommend:
            </p>
            <ul>
              <li>A full scan once per month.</li>
              <li>Immediate re-scans after major life events (new job, moving house, changing phone number).</li>
              <li>Using unique usernames per platform to prevent cross-site correlation.</li>
              <li>Reviewing privacy settings quarterly on active accounts.</li>
            </ul>
            <p>
              Over time, your exposure score should trend downwards. FootprintIQ tracks this trajectory, giving you a clear, quantified view of your progress. For a detailed look at how we handle your scan data, visit our{" "}
              <Link to="/data-lifecycle">Data Lifecycle</Link> page.
            </p>

            <h2>Common Mistakes to Avoid</h2>
            <ul>
              <li><strong>Deactivating instead of deleting.</strong> Deactivated accounts often remain indexed and searchable. Always confirm permanent deletion.</li>
              <li><strong>Ignoring data brokers.</strong> Social media is only half the picture. People-search sites like Spokeo, BeenVerified, and WhitePages aggregate data from public records and sell access to anyone.</li>
              <li><strong>Using the same password everywhere.</strong> A single breach can compromise every account that shares the same credentials.</li>
              <li><strong>Panicking over low-risk findings.</strong> Not every result is urgent. Prioritisation prevents burnout and ensures you address the most impactful exposures first.</li>
            </ul>

            <h2>Related Searches</h2>
            <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
              <Link to="/usernames" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <span className="font-medium text-foreground">Username Search</span>
                <p className="text-sm text-muted-foreground mt-1">Find where your username appears across 500+ platforms.</p>
              </Link>
              <Link to="/email-breach-check" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <span className="font-medium text-foreground">Email Breach Check</span>
                <p className="text-sm text-muted-foreground mt-1">See if your email has appeared in known data breaches.</p>
              </Link>
              <Link to="/digital-footprint-scanner" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <span className="font-medium text-foreground">Digital Footprint Scanner</span>
                <p className="text-sm text-muted-foreground mt-1">Run a comprehensive exposure analysis.</p>
              </Link>
              <Link to="/trust-safety" className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <span className="font-medium text-foreground">Trust & Safety</span>
                <p className="text-sm text-muted-foreground mt-1">How we protect your data and prevent misuse.</p>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              FootprintIQ – Ethical Digital Footprint Intelligence Platform. We help individuals understand and reduce their public online exposure using transparent, responsible OSINT methods.
            </p>
          </article>
        </section>

        {/* Discovery to Proof flow */}
        <DiscoveryToProofSection />

        {/* FAQ */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <ResponsibleUsePledge />
      <Footer />
    </>
  );
}
