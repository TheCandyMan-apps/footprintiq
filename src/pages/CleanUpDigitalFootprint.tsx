import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Lock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/how-to-clean-up-your-digital-footprint";

const webPageSchema = buildWebPageSchema({
  name: "How to Clean Up Your Digital Footprint (2026 Guide) | FootprintIQ",
  description:
    "Step-by-step guide to cleaning up your digital footprint — from social media audits to data broker removals, old account deletion, and ongoing exposure management.",
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
      name: "How long does it take to clean up your digital footprint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The initial cleanup typically takes 4–8 hours spread over a few days — auditing social media, submitting data broker opt-outs, and deleting old accounts. However, digital footprint management is ongoing. Data brokers re-list information, new breaches occur, and old content gets re-indexed. Plan for periodic maintenance every quarter.",
      },
    },
    {
      "@type": "Question",
      name: "Can I completely erase my digital footprint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Complete erasure is extremely difficult and practically impossible for most people. Public records, cached pages, archived content, and data shared by others will persist. The realistic goal is to significantly reduce your unnecessary exposure, control what's easily discoverable, and monitor for re-emergence. Focus on reducing risk, not achieving invisibility.",
      },
    },
    {
      "@type": "Question",
      name: "Should I delete old social media accounts or just make them private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you no longer use an account, delete it entirely — dormant accounts with weak passwords are prime targets for compromise. If you still use the account, tighten privacy settings, remove old posts and photos that no longer represent you, and audit tagged content. Deletion is more thorough; privacy settings are a compromise.",
      },
    },
    {
      "@type": "Question",
      name: "What's the fastest way to find all my old accounts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Search your email inbox for 'welcome', 'verify your email', and 'confirm your account' to find registration emails from services you've used. Then run a username scan across platforms to find accounts you may have forgotten. Check your browser's saved passwords for a list of sites you've logged into.",
      },
    },
    {
      "@type": "Question",
      name: "Will cleaning up my footprint affect my online reputation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Done thoughtfully, yes — positively. Removing outdated or unprofessional content improves how you appear in search results and employer screening. The goal isn't to remove everything, but to curate what's publicly visible so it accurately represents your current professional identity.",
      },
    },
    {
      "@type": "Question",
      name: "How do I stop my data from reappearing after removal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can't fully prevent it, but you can reduce the likelihood: freeze your credit, opt out of pre-screened offers, use a PO Box for public-facing records, and run regular monitoring scans to catch re-listings early. Combining removal with ongoing monitoring is the most effective long-term strategy.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Clean Up Your Digital Footprint", item: PAGE_URL },
  ],
};

const CleanUpDigitalFootprint = () => {
  return (
    <>
      <Helmet>
        <title>How to Clean Up Your Digital Footprint (2026 Guide) | FootprintIQ</title>
        <meta name="description" content="Step-by-step guide to cleaning up your digital footprint — social media audits, data broker removals, old account deletion, and ongoing exposure management." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Clean Up Your Digital Footprint (2026)" />
        <meta property="og:description" content="Practical, step-by-step process for reducing your online exposure and managing your digital footprint." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Clean Up Your Digital Footprint</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Practical Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How to Clean Up Your{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Digital Footprint</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A practical, step-by-step guide to reducing your online exposure — from quick wins to long-term strategies that actually work.
            </p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">Find What Needs Cleaning <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why Cleaning Up Matters</h2>
            <p>
              Your digital footprint is the cumulative trail of information you've left across the internet — every account created, post shared, form filled out, and photo uploaded. Over years of online activity, this trail grows into a surprisingly detailed public record of your life.
            </p>
            <p>
              Most of this information serves no purpose anymore but remains publicly accessible. Old forum accounts, abandoned social profiles, data broker listings, and breach-exposed credentials all contribute to an exposure surface that you've probably never fully mapped.
            </p>
            <p>
              Cleaning up isn't about going off-grid. It's about making deliberate choices about what stays visible and what doesn't — reducing unnecessary risk while keeping the parts of your online presence that serve you.
            </p>
          </div>
        </section>

        {/* Step-by-step */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Trash2 className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Step-by-Step Cleanup Process</h2>
            </div>

            <div className="space-y-4">
              {[
                { step: "1", title: "Map your current exposure", desc: "Before you can clean up, you need to know what's out there. Run a digital footprint scan or manually search for yourself across Google, social platforms, and data broker sites. Document everything you find." },
                { step: "2", title: "Audit and tighten social media", desc: "Review every social platform you use. Set profiles to private or friends-only where appropriate. Delete old posts, photos, and comments that no longer represent you. Remove tags from others' content. Check what's visible when logged out." },
                { step: "3", title: "Delete dormant accounts", desc: "Search your email for old registration confirmations. Use JustDeleteMe (justdeleteme.xyz) for direct links to account deletion pages. Prioritise accounts with weak or reused passwords — they're the highest risk." },
                { step: "4", title: "Opt out of data brokers", desc: "Submit removal requests to major data brokers — Spokeo, BeenVerified, Whitepages, Radaris, and others. Each has a different process. See our data broker opt-out guide for broker-by-broker instructions." },
                { step: "5", title: "Address breach exposure", desc: "Check haveibeenpwned.com for breached accounts. Change passwords for any compromised services. Enable two-factor authentication everywhere possible. Use unique passwords for every account." },
                { step: "6", title: "Request Google de-indexing", desc: "For pages you've removed at the source but that still appear in Google results, use Google's Removals tool (search.google.com/search-console/removals) to request de-indexing." },
                { step: "7", title: "Set up ongoing monitoring", desc: "Cleanup is not a one-time event. Data brokers re-list, new breaches occur, and old content gets re-indexed. Set up regular re-scans or continuous monitoring to catch new exposures early." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start bg-card border border-border/50 rounded-xl p-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">{item.step}</span>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Related guides:{" "}
              <Link to="/data-broker-opt-out-guide" className="text-accent hover:underline">Data Broker Opt-Out Guide</Link>{" · "}
              <Link to="/how-to-remove-yourself-from-data-brokers" className="text-accent hover:underline">Remove Yourself from Data Brokers</Link>
            </p>
          </div>
        </section>

        {/* Risks */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Risks of Doing Nothing</h2>
            </div>
            <p>Every piece of unnecessary public information increases your risk surface:</p>
            <ul>
              <li><strong>Credential stuffing:</strong> Breached passwords are tested against hundreds of services. If you reuse passwords, one breach compromises all your accounts.</li>
              <li><strong>Social engineering:</strong> The more personal details available publicly, the easier it is for attackers to impersonate you to your bank, phone provider, or employer.</li>
              <li><strong>Doxxing risk:</strong> Connected pieces of information — username reuse, email patterns, address history — can be pieced together to reveal details you thought were private.</li>
              <li><strong>Professional impact:</strong> Employers, clients, and colleagues can find old content that doesn't reflect your current values or capabilities. See <Link to="/how-employers-check-your-online-presence" className="text-accent hover:underline">how employers check your online presence</Link>.</li>
              <li><strong>Compounding exposure:</strong> The longer you wait, the more data accumulates. New broker listings, new breaches, and continued indexing make cleanup progressively harder over time.</li>
            </ul>
          </div>
        </section>

        {/* FootprintIQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">How FootprintIQ Helps</h2>
            </div>
            <p>
              The hardest part of cleaning up your digital footprint is knowing where to start. FootprintIQ solves this by mapping your complete exposure in a single scan — across platforms, brokers, breach databases, and public records.
            </p>
            <p>
              Results are prioritised by risk, so you tackle the highest-impact items first. The free tier gives you a full snapshot. <Link to="/pricing" className="text-accent hover:underline">Pro</Link> adds continuous monitoring to track your progress over time, alert you to new exposures, and ensure your cleanup efforts stick.
            </p>
            <p>
              All scanning uses ethical, publicly accessible methods — no private database access, no account impersonation. See our <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.
            </p>
          </div>
        </section>

        {/* Alternatives */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Other Tools and Approaches</h2>
            </div>
            <ul>
              <li><strong>JustDeleteMe</strong> — a free directory of direct links to account deletion pages. Useful for the account-deletion step of your cleanup.</li>
              <li><strong>Have I Been Pwned</strong> — free breach checking for email addresses. Essential for identifying compromised credentials.</li>
              <li><strong>DeleteMe / Optery</strong> — paid services that automate data broker opt-outs. Useful if you want to outsource that specific part of the cleanup.</li>
              <li><strong>Google's Results About You</strong> — Google's tool for managing personal information that appears in search results.</li>
              <li><strong>Platform privacy checkups</strong> — Facebook, Google, Instagram, and LinkedIn each offer built-in privacy review tools for their own platform.</li>
            </ul>
            <p>
              The most thorough approach combines FootprintIQ for comprehensive exposure mapping with specialised tools for each cleanup step. See our <Link to="/best-digital-footprint-scanner" className="text-accent hover:underline">scanner comparison</Link> for more options.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.acceptedAnswer.text}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Cleanup Today</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Run a free scan to map your current exposure, then follow this guide to systematically reduce it.</p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        <section className="py-12 px-6"><div className="max-w-3xl mx-auto"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
};

export default CleanUpDigitalFootprint;
