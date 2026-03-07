import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { HeroInputField } from "@/components/HeroInputField";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import { Fingerprint } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";

const SLUG = "/what-is-my-digital-footprint";
const CANONICAL = `${CANONICAL_BASE}${SLUG}`;
const TITLE = "What Is My Digital Footprint? – Check Your Online Identity | FootprintIQ";
const DESC = "Understand what a digital footprint is, what personal information exists about you online, and how to check and reduce your digital identity exposure using ethical OSINT scanning tools.";

const FAQS = [
  { q: "What is a digital footprint?", a: "A digital footprint is the trail of data you leave behind when using the internet — including social media profiles, forum posts, app registrations, breach records, data broker listings, and metadata. Both intentional and passive traces contribute to a discoverable identity profile." },
  { q: "How do I check my digital footprint?", a: "Enter your most-used username or email into FootprintIQ's scanner. It queries 500+ public sources simultaneously — social media, forums, data brokers, breach databases — and produces a structured exposure report with confidence scores and remediation guidance." },
  { q: "Can someone find me using my digital footprint?", a: "Yes. If you reuse the same username or email across platforms, anyone with OSINT tools can correlate your accounts and build a composite profile of your online activity, interests, and personal details." },
  { q: "Is checking my digital footprint free?", a: "Yes. FootprintIQ offers a free exposure scan showing platform matches and signal counts. Pro plans unlock deeper analysis including identity correlation graphs, breach context, risk scoring, and guided remediation." },
  { q: "What's the difference between active and passive digital footprints?", a: "Active footprints are data you deliberately share — social posts, registrations, comments. Passive footprints are collected without direct action — tracking cookies, data broker aggregation, breach leaks, and metadata embedded in files." },
  { q: "How often should I check my digital footprint?", a: "At least quarterly, or immediately after a known data breach. Pro users benefit from continuous monitoring that alerts when new exposure is detected." },
];

export default function WhatIsMyDigitalFootprint() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESC} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESC} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={buildArticleSchema({ headline: "What Is My Digital Footprint?", description: DESC, url: SLUG })} />
      <JsonLd data={buildFAQSchema(FAQS)} />
      <JsonLd data={buildBreadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Resources", path: "/resources" }, { name: "What Is My Digital Footprint" }])} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ContentBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Resources", href: "/resources" }, { label: "What Is My Digital Footprint" }]} />
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Fingerprint className="h-3 w-3 mr-1.5" />Digital Identity Guide
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">What Is My Digital Footprint?</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Every time you create an account, post a comment, or sign up for a service, you leave a trace. Your digital footprint is the sum of all publicly discoverable information connected to your identity — and most people have no idea how large theirs has become.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        {/* What Information Exists About You Online */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What Information Exists About You Online</h2>
            <p>
              The volume of publicly accessible personal data is consistently larger than people expect. A comprehensive digital footprint check typically reveals information across several categories, each carrying different levels of risk and visibility.
            </p>
            <p>
              <strong>Social media profiles.</strong> Instagram, Twitter/X, Facebook, TikTok, LinkedIn, Snapchat, YouTube, and Reddit all maintain public-facing profiles tied to usernames. Even when accounts are set to private, the fact that a profile exists under a specific handle is itself a searchable data point. Public profiles expose bios, photographs, follower counts, post history, location tags, and connections — creating a rich source of personal intelligence.
            </p>
            <p>
              <strong>Forum accounts and community posts.</strong> Discussion platforms like Reddit, Quora, Stack Overflow, Hacker News, and thousands of niche communities maintain years of searchable post history tied to persistent usernames. Unlike curated social media profiles, forum posts tend to be candid and detailed. Users frequently disclose personal opinions, locations, technical expertise, health information, and relationship details across years of commenting — often without realising this information is permanently indexed by search engines.
            </p>
            <p>
              <strong>Usernames across platforms.</strong> Username reuse is the most powerful cross-platform correlation signal available. When the same handle appears on Instagram, GitHub, Steam, and a dating site, linking these accounts to a single individual becomes trivial for anyone with access to OSINT tools. Our <Link to="/research/username-reuse-report-2026">2026 Username Reuse Report</Link> found that 72% of sampled users shared at least one username across five or more platforms — creating discoverable identity chains that connect otherwise unrelated accounts.
            </p>
            <p>
              <strong>Data broker and people-search listings.</strong> Companies like Spokeo, BeenVerified, and MyLife aggregate public records, social media data, and purchase history into searchable dossiers. These listings frequently include current and previous addresses, phone numbers, email addresses, estimated income, family connections, and employment history — all accessible for a small fee or sometimes for free.
            </p>
            <p>
              <strong>Breach records.</strong> When online services suffer data breaches, leaked credentials — email addresses, passwords, security questions, payment details — enter permanent circulation. An email address that appears in multiple breaches signals an identity that is both active and potentially vulnerable to credential-stuffing attacks.
            </p>
            <p>
              <strong>Professional and developer platforms.</strong> GitHub, GitLab, npm, Stack Overflow, and portfolio sites expose technical skills, project history, contribution patterns, and — critically — commit metadata that can contain email addresses. These platforms reveal not just what you do online, but how you work, what you build, and sometimes where you're employed.
            </p>
          </div>
        </section>

        {/* Why Digital Footprints Matter */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Digital Footprints Matter</h2>
            <p>
              Your digital footprint is not an abstract concept — it has direct, practical consequences for personal safety, professional reputation, and financial security. Understanding why this information matters is the first step toward managing it effectively.
            </p>
            <p>
              <strong>Employers and recruiters screen candidates online.</strong> Before interviews, hiring managers routinely search applicants' names and usernames. Old forum posts expressing controversial opinions, unprofessional social media activity, or associations with certain communities can influence hiring decisions — often without the candidate ever knowing their digital history was reviewed.
            </p>
            <p>
              <strong>Advertisers and data brokers profit from your information.</strong> Personal data is a commodity. Data brokers aggregate publicly available information and sell access to advertisers, insurance companies, landlords, and anyone willing to pay. The more information available about you, the more precisely you can be targeted — and the less control you have over how your data is used.
            </p>
            <p>
              <strong>Attackers use public data as a starting point.</strong> Social engineering, spear phishing, and credential-stuffing attacks all begin with information gathering. The publicly visible details in your digital footprint — your employer, interests, travel history, account usernames — provide the raw material attackers need to craft convincing impersonation attempts or bypass security questions.
            </p>
            <p>
              <strong>Your digital identity persists indefinitely.</strong> Unlike physical records that degrade or get filed away, digital information is indexed, cached, archived, and replicated across services. A forum post from 2012, a dating profile created in university, or a data broker listing based on an old address can remain discoverable for decades — shaping how you're perceived by anyone who searches for you.
            </p>
          </div>
        </section>

        {/* Risks Of An Exposed Digital Identity */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Risks Of An Exposed Digital Identity</h2>
            <p>
              An unmanaged digital footprint creates specific, measurable risks. Understanding these threats helps you prioritise which aspects of your exposure to address first.
            </p>
            <p>
              <strong>Identity theft.</strong> Identity theft begins with information gathering. Attackers assemble names, addresses, dates of birth, and account details from public sources to impersonate victims with banks, government agencies, and service providers. The more personal data available publicly, the more convincing the impersonation. A comprehensive digital footprint scan reveals exactly which pieces of your identity are accessible — allowing you to restrict them before they are exploited.
            </p>
            <p>
              <strong>Account takeover and credential stuffing.</strong> When breach databases expose email/password combinations, attackers test those credentials across other services where users may have reused them. Username reuse compounds this risk: if an attacker discovers your handle on a breached platform, they can enumerate every other service where that username exists and attempt credential reuse against all of them simultaneously.
            </p>
            <p>
              <strong>Impersonation and fraud.</strong> Publicly available photographs, bios, and personal details enable fake profile creation. Impersonation accounts are used for romance scams, financial fraud, social engineering against your contacts, and reputation damage. Platforms with public profile photos — Instagram, LinkedIn, dating sites — are the primary sources for impersonation material.
            </p>
            <p>
              <strong>Stalking and harassment.</strong> Digital footprints provide a roadmap for stalkers. Username correlation allows someone who knows one handle to discover accounts on dozens of platforms within minutes. Location-tagged posts, check-ins, and geotagged photographs provide physical tracking data. For individuals in domestic abuse situations or public-facing roles, this exposure can create genuine safety risks.
            </p>
            <p>
              <strong>Reputational damage.</strong> Archived forum posts, old social media activity, and data broker listings can surface information that no longer reflects who you are. In professional, academic, or legal contexts, outdated digital traces can create misleading impressions that are difficult to correct once discovered.
            </p>
          </div>
        </section>

        {/* How To Check Your Digital Footprint */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Check Your Digital Footprint</h2>
            <p>
              Manually searching for yourself across hundreds of platforms is time-consuming and unreliable. A structured approach produces faster, more comprehensive results.
            </p>
            <p>
              <strong>Step 1: Search your primary username.</strong> Enter the username you use most frequently into FootprintIQ's <Link to="/usernames">username search tool</Link>. The platform queries 500+ public sources to identify where that handle appears, returning results with confidence scores indicating match reliability.
            </p>
            <p>
              <strong>Step 2: Scan your email address.</strong> Email scans surface breach records, newsletter subscriptions, and account registrations linked to your address. This reveals passive exposure — data that exists about you without your active participation.
            </p>
            <p>
              <strong>Step 3: Run a reverse username search.</strong> Use the <Link to="/reverse-username-search">reverse username lookup</Link> to trace connections between handles. If you've used different usernames on different platforms, this step reveals whether those handles can still be linked through shared metadata, profile photos, or bio text.
            </p>
            <p>
              <strong>Step 4: Review your exposure score.</strong> The <Link to="/digital-footprint-checker">digital footprint checker</Link> generates a Digital Exposure Score (0–100) based on profiles detected, breach exposure, username reuse density, and exposed personal information. Pro users receive the full breakdown with remediation guidance.
            </p>
            <p>
              <strong>Step 5: Explore multi-tool scanning.</strong> For a deeper understanding of how comprehensive scanning works, visit the <Link to="/username-search-engine">username search engine</Link> page, which explains how FootprintIQ orchestrates multiple OSINT tools — including Sherlock, Maigret, and WhatsMyName — to achieve coverage that no single tool provides alone.
            </p>
            <p>
              The key insight is that checking your digital footprint is not a one-time action. New exposure accumulates continuously — through new account registrations, fresh data breaches, and evolving data broker aggregation. Quarterly scans, at minimum, are recommended. Pro users benefit from continuous monitoring that alerts them the moment new exposure is detected.
            </p>
          </div>
        </section>

        {/* Tools That Scan Online Identities */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Tools That Scan Online Identities</h2>
            <p>
              Several categories of tools exist for checking digital footprints, ranging from manual search techniques to automated OSINT platforms. Understanding the landscape helps you choose the right approach for your needs.
            </p>
            <p>
              <strong>Basic username checkers.</strong> Tools like Namechk and KnowEm check whether a username is registered on a list of platforms. These are useful for quick availability checks but produce high false-positive rates and provide no identity correlation, breach analysis, or confidence scoring. They answer "does this handle exist?" but not "is this the same person?"
            </p>
            <p>
              <strong>Open-source OSINT tools.</strong> Sherlock, Maigret, and WhatsMyName are command-line tools used by security researchers to enumerate username presence across hundreds of platforms. They're powerful but require technical knowledge to install, configure, and interpret. Results are raw — no deduplication, no confidence scoring, and no remediation guidance. For a comparison, see our <Link to="/best-reverse-username-search-tools">best reverse username search tools</Link> guide.
            </p>
            <p>
              <strong>Breach notification services.</strong> Have I Been Pwned checks whether an email appeared in known data breaches. It's a valuable single-purpose tool, but it only covers breach exposure — it doesn't scan social media, forums, data brokers, or identity correlation patterns. For users who have already checked HIBP, our guide on <Link to="/after-have-i-been-pwned-what-next">what to do after Have I Been Pwned</Link> explains how to extend the investigation.
            </p>
            <p>
              <strong>FootprintIQ: unified digital footprint scanner.</strong> FootprintIQ combines the capabilities of multiple tools into a single, automated platform. It runs username enumeration via Sherlock, Maigret, and WhatsMyName simultaneously, applies AI-assisted false-positive filtering, performs cross-platform identity correlation, checks breach databases, and identifies data broker listings — all from a single input. Results include confidence scores, platform categories, risk assessment, and a structured remediation roadmap with direct opt-out links.
            </p>
            <p>
              The platform follows the <strong>Scan → Act → Verify → Measure</strong> remediation lifecycle: identify exposure, take action to reduce it, verify that removals took effect, and measure your score improvement over time. Pro users unlock continuous monitoring, the Exposure Resolution Timeline, and historical trend tracking to quantify their privacy improvement.
            </p>
            <p>
              Start with a free scan using the <Link to="/usernames">username search tool</Link>, run a <Link to="/reverse-username-search">reverse username lookup</Link>, check your overall exposure with the <Link to="/digital-footprint-checker">digital footprint checker</Link>, or explore the <Link to="/username-search-engine">username search engine</Link> to understand how multi-tool scanning works at scale.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-foreground font-medium text-left py-5">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <FinalCTA />
        <section className="py-12 bg-muted/10"><div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
}
