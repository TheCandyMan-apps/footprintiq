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
import { Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Can you find someone by phone number?", a: "Yes. Phone numbers are used as registration identifiers on many platforms and appear in data broker listings, breach databases, and public records. OSINT tools can correlate a phone number with associated accounts and personal information." },
  { q: "Is it legal to search for someone by phone number?", a: "Yes, when querying publicly available sources. FootprintIQ checks data broker listings, public records, and breach databases — all publicly accessible. It never accesses private carrier data or intercepts communications." },
  { q: "What can a phone number reveal?", a: "A phone number can reveal the carrier, registered name and address (via data broker listings), social media accounts registered with the number, breach history, and in some cases, geographic location based on area code." },
  { q: "Can you find social media accounts from a phone number?", a: "Some platforms allow account discovery via phone number if the user hasn't disabled this feature. Additionally, breach databases may correlate phone numbers with usernames and email addresses used on social platforms." },
  { q: "Does FootprintIQ support phone number searches?", a: "Yes. FootprintIQ supports phone number scans alongside username and email searches. Phone scans query data broker listings, breach databases, and public records to provide comprehensive exposure intelligence." },
];

export default function FindSomeoneByPhoneNumber() {
  const canonical = "https://footprintiq.app/find-someone-by-phone-number";
  const faqSchema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" }, { "@type": "ListItem", position: 2, name: "Find Someone By Phone Number", item: canonical }] };

  return (
    <>
      <Helmet>
        <title>Find Someone By Phone Number – Trace Identity | FootprintIQ</title>
        <meta name="description" content="Find someone by phone number using ethical OSINT techniques. Discover linked accounts, data broker listings, and breach history from a phone number." />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content="Find Someone By Phone Number – Trace Identity | FootprintIQ" />
        <meta property="og:description" content="Find someone by phone number. Discover linked accounts, data broker listings, and breach history." />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30"><Phone className="h-3 w-3 mr-1.5" />Phone Number OSINT</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">How To Find Someone Online Using Their Phone Number</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Phone numbers are tied to accounts, data broker profiles, and breach records. Learn how OSINT investigators use phone numbers to trace digital identities — and how to check your own exposure.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Phone Numbers Are Valuable For OSINT</h2>
            <p>Phone numbers serve as a critical identifier in the digital ecosystem. Unlike usernames — which are chosen and can vary — phone numbers are assigned, persistent, and frequently required for account verification. This makes them powerful pivots for digital identity investigation.</p>
            <p>A phone number can reveal:</p>
            <ul>
              <li><strong>Registered accounts.</strong> Many platforms — WhatsApp, Telegram, Signal, Facebook, Instagram — use phone numbers as primary or secondary identifiers for account registration and recovery.</li>
              <li><strong>Data broker listings.</strong> People-search sites aggregate phone numbers alongside names, addresses, relatives, and property records into comprehensive profiles available for public lookup.</li>
              <li><strong>Breach history.</strong> Phone numbers appear in breach databases when platforms that stored them are compromised, revealing associated accounts and personal details.</li>
              <li><strong>Carrier and geographic data.</strong> Area codes and number ranges indicate geographic region and mobile carrier, providing location intelligence.</li>
              <li><strong>Caller ID databases.</strong> Services like TrueCaller crowdsource name-to-number associations, making it possible to identify the owner of an unknown number.</li>
            </ul>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How Phone Number Investigations Work</h2>
            <p>Professional investigators follow a structured approach when using phone numbers as an OSINT starting point:</p>
            <ol>
              <li><strong>Number validation.</strong> The phone number is validated for format, carrier, and type (mobile, landline, VoIP). VoIP numbers may indicate disposable or privacy-focused usage.</li>
              <li><strong>Data broker query.</strong> People-search sites and data aggregation platforms are checked for listings associated with the number.</li>
              <li><strong>Platform registration check.</strong> Tools like PhoneInfoga check whether the number is registered on messaging platforms, social media, and other services.</li>
              <li><strong>Breach database search.</strong> The number is checked against known breach datasets to identify compromised accounts.</li>
              <li><strong>Reverse lookup.</strong> Caller ID databases and public records are queried to identify the registered owner of the number.</li>
              <li><strong>Correlation.</strong> Findings are cross-referenced with email and username searches to build a comprehensive identity picture.</li>
            </ol>
            <p>FootprintIQ automates this multi-source investigation into a single phone number scan, returning categorised, confidence-scored results.</p>
          </div>
        </section>

        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Privacy Risks Of Phone Number Exposure</h2>
            <p>An exposed phone number creates several cascading risks:</p>
            <ul>
              <li><strong>SIM swapping.</strong> Attackers who know your phone number and associated personal details can attempt SIM swap attacks, redirecting your calls and texts to their device — bypassing SMS-based two-factor authentication.</li>
              <li><strong>Targeted phishing.</strong> Phone-based phishing (vishing) and SMS phishing (smishing) become more convincing when attackers know personal details discoverable from your number.</li>
              <li><strong>Data broker profiling.</strong> Phone numbers are primary keys in data broker databases. Exposure enables comprehensive profiling and resale of personal information.</li>
              <li><strong>Account takeover.</strong> Platforms that use phone numbers for account recovery become vulnerable when the number is compromised.</li>
              <li><strong>Unwanted contact.</strong> Exposed phone numbers attract spam calls, scam attempts, and harassment.</li>
            </ul>
            <p>Run a <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint check</Link> to assess your phone number exposure alongside email and username results.</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Protect Your Phone Number Privacy</h2>
            <ul>
              <li><strong>Use a secondary number.</strong> Services like Google Voice or MySudo provide additional numbers for registrations, keeping your primary number private.</li>
              <li><strong>Opt out of data brokers.</strong> Request removal from people-search sites that list your phone number. FootprintIQ identifies which brokers have your information.</li>
              <li><strong>Disable phone-based discovery.</strong> On platforms like Facebook and Instagram, disable the "find me by phone number" feature in privacy settings.</li>
              <li><strong>Use authenticator apps instead of SMS.</strong> Replace SMS-based 2FA with app-based authenticators (Google Authenticator, Authy) to reduce SIM swap risk.</li>
              <li><strong>Monitor for breaches.</strong> Regular scans ensure you're aware when your phone number appears in new breach datasets.</li>
            </ul>
          </div>
        </section>

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
