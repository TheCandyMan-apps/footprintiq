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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Shield, Search, AlertTriangle, Globe, Database, ArrowRight } from "lucide-react";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";

const SLUG = "/find-accounts-by-email";
const CANONICAL = `${CANONICAL_BASE}${SLUG}`;
const TITLE = "Find Accounts By Email – Discover Linked Profiles | FootprintIQ";
const DESC = "Find accounts linked to any email address. Discover social media profiles, forum registrations, data breaches, and hidden accounts tied to an email using ethical OSINT scanning.";

const FAQS = [
  {
    q: "How do I find all accounts linked to my email?",
    a: "Use an OSINT email scanner like FootprintIQ. Enter your email address, and the tool queries breach databases, social media registration APIs, and public data sources to identify every account associated with that address. Results typically include active profiles, forgotten registrations, and breach exposure.",
  },
  {
    q: "Is it legal to search accounts by email?",
    a: "Yes, when searching your own email address or conducting authorised investigations. FootprintIQ only queries publicly available data and known breach databases. It does not access private accounts, bypass authentication, or perform unauthorised lookups.",
  },
  {
    q: "What types of accounts can be found by email?",
    a: "Email-based scans can reveal social media profiles, forum registrations, e-commerce accounts, newsletter subscriptions, developer platform accounts, and any service where the email was used during signup. Breach databases may also reveal passwords that were exposed.",
  },
  {
    q: "Can I find someone else's accounts by email?",
    a: "FootprintIQ is designed for self-auditing and authorised investigations only. Searching someone else's email without their consent may violate privacy laws in your jurisdiction. Always ensure you have proper authorisation before conducting any lookup.",
  },
  {
    q: "How do data breaches expose email-linked accounts?",
    a: "When a service suffers a data breach, email addresses — along with usernames, passwords, and personal details — are often leaked. These breaches are indexed by aggregators, making it possible to discover which services an email was registered with, even if the account was deleted.",
  },
  {
    q: "What should I do if my email appears in a breach?",
    a: "Immediately change the password on the breached service and any other account using the same credentials. Enable two-factor authentication, review connected apps, and consider using a unique email alias for future registrations to limit exposure.",
  },
  {
    q: "How is this different from a username search?",
    a: "A username search checks whether a specific handle exists across platforms. An email search identifies accounts registered with a particular email address, which may use different usernames on each platform. Combining both methods produces the most comprehensive digital footprint analysis.",
  },
  {
    q: "Can deleted accounts still be found by email?",
    a: "Yes, in many cases. Even after you delete an account, the email registration may persist in cached data, breach databases, or third-party data broker records. An email scan can reveal these lingering traces.",
  },
];

export default function FindAccountsByEmail() {
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
      <JsonLd data={buildArticleSchema({ headline: "Find Accounts By Email", description: DESC, url: CANONICAL, datePublished: "2026-03-07", dateModified: "2026-03-07" })} />
      <JsonLd data={buildFAQSchema(FAQS)} />
      <JsonLd data={buildBreadcrumbListSchema([{ name: "Home", url: CANONICAL_BASE }, { name: "Find Accounts By Email", url: CANONICAL }])} />

      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ContentBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Find Accounts By Email" }]} />
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Mail className="h-3 w-3 mr-1.5" />Email Account Discovery
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Find Accounts By Email</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover every account, profile, and data breach linked to an email address. FootprintIQ scans 500+ public sources to map your email exposure in minutes.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        {/* Why Email Is Your Digital Master Key */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Your Email Address Is A Digital Master Key</h2>
            <p>
              Your email address is the single most connected identifier in your digital life. Every time you sign up for a social media platform, register on a forum, subscribe to a newsletter, or create an e-commerce account, your email address becomes a permanent link between you and that service. Over years of online activity, a single email can accumulate connections to hundreds of accounts — many of which you've long forgotten.
            </p>
            <p>
              Unlike usernames, which can vary across platforms, most people use the same one or two email addresses for everything. This consistency makes email the most effective starting point for digital footprint analysis. An attacker, a recruiter, or an investigator can use a single email address to reconstruct a surprisingly complete picture of someone's online life.
            </p>
            <p>
              The problem is compounded by data breaches. When a service is compromised, the email addresses in its database become part of the public record. Breach aggregators index these records, making it trivial to check whether a particular email has been exposed — and in many cases, to discover which services that email was registered with.
            </p>
            <p>
              This is why checking which accounts are linked to your email isn't just a privacy exercise — it's a security imperative. Forgotten accounts with weak or reused passwords are prime targets for credential stuffing attacks. An old forum registration from 2014 could be the entry point that compromises your bank account in 2026.
            </p>
          </div>
        </section>

        {/* What An Email Search Reveals */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What An Email Account Search Reveals</h2>
            <p>
              When you run an email-based OSINT scan, the results typically fall into several distinct categories. Understanding what each category means helps you prioritise your response and take meaningful action to reduce your exposure.
            </p>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              {[
                { icon: Globe, title: "Social Media Profiles", desc: "Accounts on platforms like Facebook, Twitter, Instagram, LinkedIn, Reddit, and TikTok that were registered with the searched email address." },
                { icon: Database, title: "Data Breach Exposure", desc: "Services that suffered data breaches where the email appeared in leaked databases, often alongside passwords, names, and personal details." },
                { icon: Search, title: "Forum & Community Registrations", desc: "Old forum accounts, gaming communities, Q&A sites, and niche platforms where the email was used for signup — many forgotten over time." },
                { icon: Shield, title: "Developer & Professional Platforms", desc: "Accounts on GitHub, Stack Overflow, npm, and other professional services that may reveal technical skills, projects, and work history." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-6">
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <p>
              Beyond direct account matches, email scans can reveal patterns. If the same email appears in multiple breach databases, it suggests the owner has a habit of reusing credentials — a significant security risk. If the email is linked to accounts using different names, it may indicate an attempt to compartmentalise identity, or it could be a shared or compromised address.
            </p>
          </div>
        </section>

        {/* Risks Of Exposed Email Accounts */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Risks Of Exposed Email-Linked Accounts</h2>
            <p>
              The accounts connected to your email form an attack surface. Each forgotten registration, each reused password, each service that stored your data without proper encryption represents a potential vulnerability. Here are the most significant risks:
            </p>
            <ul>
              <li><strong>Credential stuffing attacks.</strong> Attackers use email-password pairs from one breach to attempt logins on other services. If you've reused passwords, a breach on a small forum could compromise your primary email or financial accounts.</li>
              <li><strong>Identity theft.</strong> The combination of email, name, date of birth, and address — often spread across multiple breached databases — provides enough information for identity fraud, credit applications, and account takeover.</li>
              <li><strong>Targeted phishing.</strong> Knowing which services you use allows attackers to craft highly convincing phishing emails. A message that references your actual account on a specific platform is far more effective than a generic spam email.</li>
              <li><strong>Social engineering.</strong> Information gathered from email-linked accounts — your interests, your employer, your social circle — can be used to manipulate you or people close to you.</li>
              <li><strong>Doxxing and harassment.</strong> A comprehensive email footprint can reveal enough personal information to enable doxxing, where private details are published online to harass or intimidate.</li>
            </ul>
            <p>
              The 2026 Username Reuse &amp; Digital Exposure Report found that 73% of email addresses tested appeared in at least two breach databases, and the average person has over 130 accounts linked to their primary email. Most of these accounts have not had their passwords changed since creation.
            </p>
          </div>
        </section>

        {/* How To Find Accounts Linked To Your Email */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Linked To Your Email</h2>
            <p>
              There are several approaches to discovering which accounts are connected to your email address. The most effective method combines multiple techniques for comprehensive coverage.
            </p>

            <h3>1. Use FootprintIQ's Email Scan</h3>
            <p>
              The fastest approach is to run an email scan using FootprintIQ. Enter your email address, and the platform queries breach databases, social media registration APIs, and public data sources simultaneously. Results are deduplicated, false positives are filtered, and findings are presented in a structured report with severity ratings and remediation guidance.
            </p>

            <h3>2. Check Breach Databases Manually</h3>
            <p>
              Services like Have I Been Pwned allow you to check whether an email appears in known breaches. However, these services only reveal breach exposure — they don't map active accounts or forgotten registrations. For a complete picture, breach checks should be combined with active account discovery.
            </p>

            <h3>3. Review Your Email Inbox</h3>
            <p>
              Search your email for common signup confirmation subjects: "Welcome to", "Verify your email", "Confirm your account". This manual approach can reveal accounts you've forgotten, but it's time-consuming and misses services that have since changed their email templates or shut down.
            </p>

            <h3>4. Check Social Login Connections</h3>
            <p>
              If you've used "Sign in with Google" or "Sign in with Apple", review the connected apps in your Google or Apple account settings. These services track which third-party applications have been granted access to your account through OAuth.
            </p>

            <h3>5. Combine Email And Username Scans</h3>
            <p>
              For the most comprehensive results, run both an email scan and a <Link to="/usernames" className="text-primary hover:underline">username search</Link> using your most common handles. This combination captures accounts that use your email but a different username, and accounts that use your username but a different email.
            </p>
          </div>
        </section>

        {/* How Email OSINT Works */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Email OSINT Scanning Works</h2>
            <p>
              Email-based OSINT combines several techniques to build a comprehensive picture of an email address's digital footprint. Understanding these methods helps you appreciate both the power and the limitations of email scanning.
            </p>
            <p>
              <strong>Registration enumeration</strong> — Some platforms reveal whether an email is registered during the login or password-reset flow. OSINT tools systematically query these endpoints to determine which services recognise a given email address. This technique works on platforms that haven't implemented anti-enumeration protections.
            </p>
            <p>
              <strong>Breach correlation</strong> — Breach databases are cross-referenced to identify which services have leaked data containing the target email. This reveals not just breach exposure, but also which services the email was registered with, since only registered users appear in breach data.
            </p>
            <p>
              <strong>Gravatar and avatar lookups</strong> — Many services hash email addresses to generate Gravatar URLs. By computing the hash of a target email, OSINT tools can retrieve associated profile pictures and metadata without needing to query each platform individually.
            </p>
            <p>
              <strong>DNS and WHOIS queries</strong> — For custom domain emails (e.g., user@company.com), domain registration records can reveal the owner, hosting provider, and associated infrastructure. This is particularly useful in corporate investigations.
            </p>
            <p>
              <strong>Social graph analysis</strong> — When an email is linked to multiple accounts, the connections between those accounts — shared friends, overlapping groups, common interests — can be analysed to build a social graph that reveals the email owner's network and behaviour patterns.
            </p>
            <p>
              FootprintIQ automates these techniques through a multi-tool pipeline powered by tools like <Link to="/reverse-username-search" className="text-primary hover:underline">Holehe, Sherlock, and SpiderFoot</Link>, producing deduplicated results with confidence scores and false-positive filtering.
            </p>
          </div>
        </section>

        {/* How To Protect Your Email Footprint */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Reduce Your Email Exposure</h2>
            <p>
              Once you've identified which accounts are linked to your email, follow this four-step remediation framework to reduce your attack surface:
            </p>
            <ol>
              <li><strong>Scan.</strong> Run a comprehensive email scan using FootprintIQ to identify all linked accounts, breach exposure, and data broker listings.</li>
              <li><strong>Act.</strong> Delete accounts you no longer use. Change passwords on active accounts — use unique, randomly generated passwords managed by a password manager. Enable two-factor authentication everywhere it's available.</li>
              <li><strong>Verify.</strong> Re-scan after making changes to confirm that accounts have been properly deleted and that new breaches haven't appeared. Check that data broker removal requests have been processed.</li>
              <li><strong>Measure.</strong> Track your digital exposure score over time. Each action you take should reduce the number of linked accounts and breach mentions associated with your email.</li>
            </ol>

            <h3>Additional Email Security Tips</h3>
            <ul>
              <li><strong>Use email aliases.</strong> Services like Apple's Hide My Email or SimpleLogin let you create unique aliases for each registration. If one is compromised, it doesn't affect your other accounts.</li>
              <li><strong>Separate personal and professional email.</strong> Use different email addresses for work, personal social media, financial services, and throwaway registrations.</li>
              <li><strong>Monitor breach notifications.</strong> Sign up for breach alert services that notify you when your email appears in new data leaks.</li>
              <li><strong>Request data deletion.</strong> Under GDPR, CCPA, and similar regulations, you have the right to request deletion of your data from services you no longer use.</li>
            </ul>
            <p>
              Use FootprintIQ's <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint checker</Link> to monitor your exposure over time, or explore the <Link to="/username-search-engine" className="text-primary hover:underline">username search engine</Link> to discover accounts that may use a different email but the same username.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/20">
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
