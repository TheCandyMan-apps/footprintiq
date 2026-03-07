import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { EthicalOsintTrustBlock } from "@/components/EthicalOsintTrustBlock";
import { HeroInputField } from "@/components/HeroInputField";
import { FinalCTA } from "@/components/FinalCTA";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, ArrowRight } from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find someone online using their email address?", a: "Yes. Email addresses are one of the most reliable identifiers for digital footprint analysis. They are used to register accounts across social media, forums, e-commerce, and professional platforms. OSINT tools can check whether an email appears in breach databases, data broker listings, and public registrations." },
  { q: "Is it legal to search for someone by email?", a: "Yes, when searching publicly available information. FootprintIQ queries public data sources — breach databases with publicly indexed records, data broker listings, and platform registrations. It never accesses private accounts or bypasses authentication." },
  { q: "What can an email address reveal about someone?", a: "An email address can reveal associated social media accounts, breach history, data broker listings, domain registrations, professional profiles, forum memberships, and in some cases, real names and locations linked to the address." },
  { q: "Can you find social media accounts linked to an email?", a: "Some platforms allow account lookup by email (if the user hasn't disabled this). Additionally, breach databases and data broker records frequently correlate email addresses with usernames and platform registrations." },
  { q: "Does FootprintIQ store the email addresses I search?", a: "FootprintIQ follows a data minimisation approach. Queries are processed in real time and are not retained for third-party use. See our privacy policy for full details." },
  { q: "What's the difference between email search and username search?", a: "Email searches query breach databases, data broker listings, and platform registration checks. Username searches enumerate profile URLs across 500+ platforms. Both approaches are complementary — combining them produces the most comprehensive results." },
];

export default function FindSomeoneByEmail() {
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem", position: 2, name: "Find Someone By Email", item: "https://footprintiq.app/find-someone-by-email" },
    ],
  };
  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    headline: "How To Find Someone Online Using Their Email Address",
    description: "Learn how email addresses are used in OSINT investigations to trace digital identities, discover linked accounts, and assess online exposure.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/og-image.png" } },
    datePublished: "2026-03-07", dateModified: "2026-03-07",
    mainEntityOfPage: { "@type": "WebPage", "@id": "https://footprintiq.app/find-someone-by-email" },
  };

  return (
    <>
      <Helmet>
        <title>Find Someone By Email – Trace Online Identity | FootprintIQ</title>
        <meta name="description" content="Find someone by email address. Discover linked social media accounts, breach history, and data broker listings using ethical OSINT techniques." />
        <link rel="canonical" href="https://footprintiq.app/find-someone-by-email" />
        <meta property="og:title" content="Find Someone By Email – Trace Online Identity | FootprintIQ" />
        <meta property="og:description" content="Find someone by email address. Discover linked accounts, breach history, and data broker listings." />
        <meta property="og:url" content="https://footprintiq.app/find-someone-by-email" />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={articleSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Mail className="h-3 w-3 mr-1.5" />Email OSINT Investigation
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              How To Find Someone Online Using Their Email Address
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              An email address is one of the most powerful starting points for digital identity investigation. Learn how OSINT professionals trace online identities from a single email — and how FootprintIQ automates this process across hundreds of data sources.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Email Addresses Are Powerful Identifiers</h2>
            <p>
              Email addresses occupy a unique position in digital identity. Unlike usernames — which are chosen per platform and may vary — email addresses serve as the universal account registration key. The same email address is typically used to create accounts across social media, e-commerce, professional networking, forums, and cloud services.
            </p>
            <p>
              This makes email addresses one of the most reliable pivots in OSINT investigation. A single email can reveal:
            </p>
            <ul>
              <li><strong>Registered accounts.</strong> Platforms where the email was used to create an account, including social media, forums, and professional sites.</li>
              <li><strong>Breach history.</strong> Whether the email appears in known data breach datasets, indicating compromised credentials and exposed personal data.</li>
              <li><strong>Data broker presence.</strong> Appearances on people-search sites and data aggregation platforms that compile and resell personal information.</li>
              <li><strong>Domain ownership.</strong> WHOIS records for domains registered with the email address, potentially revealing real names and addresses.</li>
              <li><strong>Professional identity.</strong> Corporate email patterns (firstname.lastname@company.com) directly reveal employer and full name.</li>
            </ul>
            <p>
              FootprintIQ's <Link to="/email-breach-check" className="text-primary hover:underline">email breach check</Link> automates this analysis, querying breach databases and exposure sources to deliver a comprehensive view of email-linked digital exposure.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Email-Based OSINT Investigations Work</h2>
            <p>
              Professional OSINT investigators use email addresses as a primary pivot point in digital investigations. The structured workflow follows several stages:
            </p>
            <ol>
              <li><strong>Breach database query.</strong> The email is checked against known breach datasets to determine if it has been compromised. Breach records often include associated usernames, password hashes, IP addresses, and registration dates — each providing additional investigative leads.</li>
              <li><strong>Platform registration check.</strong> Tools like Holehe check whether the email is registered on specific platforms by analysing password reset and registration flows. This reveals which services the email holder uses.</li>
              <li><strong>Data broker scanning.</strong> People-search sites and data aggregation platforms are queried to identify listings that include the email address, potentially revealing associated names, addresses, and phone numbers.</li>
              <li><strong>Domain and WHOIS analysis.</strong> If the email uses a custom domain, WHOIS records may reveal registrant details. Even privacy-protected registrations can expose the registrar and registration dates.</li>
              <li><strong>Username extraction.</strong> Email local parts (the portion before @) frequently match usernames on other platforms. This pivot from email to username enables cross-platform enumeration using FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search</Link>.</li>
              <li><strong>Correlation and reporting.</strong> All findings are correlated, deduplicated, and assessed for confidence. The result is a structured intelligence report with prioritised findings.</li>
            </ol>
            <p>
              FootprintIQ compresses this multi-step process into a single automated scan, delivering results in seconds rather than hours.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What Information Can Be Found From An Email Address</h2>
            <p>
              The depth of information discoverable from an email address depends on the email holder's online activity and privacy practices. Common findings include:
            </p>
            <ul>
              <li><strong>Social media accounts.</strong> Instagram, Twitter/X, LinkedIn, Facebook, and other platforms where the email was used for registration.</li>
              <li><strong>Breach data.</strong> Compromised credentials, registration timestamps, IP addresses, and associated usernames from data breach records.</li>
              <li><strong>Data broker listings.</strong> Personal details — names, addresses, phone numbers, relatives — compiled and resold by people-search sites.</li>
              <li><strong>Professional details.</strong> Corporate email patterns reveal employer, role, and professional network. LinkedIn profiles are frequently discoverable from work email addresses.</li>
              <li><strong>Forum and community memberships.</strong> Registration on discussion boards, Q&A platforms, and niche communities.</li>
              <li><strong>E-commerce accounts.</strong> While not publicly visible, breach records may reveal e-commerce platform registrations.</li>
              <li><strong>Domain registrations.</strong> Websites and domains registered using the email address, accessible through WHOIS lookup.</li>
            </ul>
            <p>
              The correlation of these data points — email linked to username linked to social profiles linked to breach records — creates a comprehensive picture of digital exposure that no single source provides alone.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Privacy Risks Of Email Exposure</h2>
            <p>
              An exposed email address creates cascading privacy risks:
            </p>
            <ul>
              <li><strong>Phishing and social engineering.</strong> Attackers craft targeted phishing emails using personal details discovered through email-based OSINT. Knowledge of which platforms you use makes these attacks significantly more convincing.</li>
              <li><strong>Credential stuffing.</strong> If your email appears in breach databases, attackers will attempt the compromised password across every platform associated with that email.</li>
              <li><strong>Identity correlation.</strong> Email addresses bridge professional and personal identities. A work email linked to personal social media accounts collapses the boundary between professional and private life.</li>
              <li><strong>Data broker profiling.</strong> Data brokers use email addresses as primary keys to aggregate information from multiple sources into comprehensive, sellable profiles.</li>
              <li><strong>Spam and unsolicited contact.</strong> Exposed email addresses attract spam, scam attempts, and unwanted solicitation.</li>
            </ul>
            <p>
              To assess your email-related exposure, run FootprintIQ's <Link to="/email-breach-check" className="text-primary hover:underline">email breach check</Link>. For a broader view, use the <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint checker</Link>.
            </p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Protect Your Email Privacy</h2>
            <ul>
              <li><strong>Use email compartmentalisation.</strong> Maintain separate email addresses for professional, personal, and throwaway registrations. This prevents a single breach from exposing all your accounts.</li>
              <li><strong>Enable two-factor authentication.</strong> Even if your email password is compromised in a breach, 2FA prevents unauthorised access to your accounts.</li>
              <li><strong>Use email aliases.</strong> Services like Apple Hide My Email and SimpleLogin generate unique aliases for each registration, preventing your primary address from appearing in breach databases.</li>
              <li><strong>Opt out of data brokers.</strong> Request removal of your email from people-search sites and data aggregation platforms. FootprintIQ identifies which brokers list your information and provides removal guidance.</li>
              <li><strong>Monitor for breaches.</strong> Regular breach checks ensure you're aware when your email appears in new compromised datasets, allowing you to change passwords immediately.</li>
            </ul>
            <p>Use FootprintIQ's <Link to="/usernames" className="text-primary hover:underline">username search tool</Link> to check associated handles, run a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link>, or scan your full exposure with the <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint scanner</Link>.</p>
          </div>
        </section>

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
        <section className="py-12 bg-muted/10">
          <div className="max-w-3xl mx-auto px-6 space-y-8"><AboutFootprintIQBlock /></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
