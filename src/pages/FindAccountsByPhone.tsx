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
import { Phone, Shield, Search, AlertTriangle, Globe, Database, ArrowRight } from "lucide-react";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";
import { buildArticleSchema, buildFAQSchema, buildBreadcrumbListSchema } from "@/lib/seo/schema";

const SLUG = "/find-accounts-by-phone";
const CANONICAL = `${CANONICAL_BASE}${SLUG}`;
const TITLE = "Find Accounts By Phone Number – Discover Linked Profiles | FootprintIQ";
const DESC = "Find accounts linked to any phone number. Discover social media profiles, messaging apps, data broker listings, and breach exposure tied to a phone number using ethical OSINT scanning.";

const FAQS = [
  {
    q: "How do I find accounts linked to my phone number?",
    a: "Use an OSINT phone scanner like FootprintIQ. Enter your phone number with the country code, and the tool queries social media contact import APIs, messaging app registrations, data brokers, and breach databases to identify accounts associated with that number.",
  },
  {
    q: "What types of accounts can be found by phone number?",
    a: "Phone-based scans can reveal WhatsApp, Telegram, Signal, and Viber accounts, social media profiles on Facebook, Instagram, and Twitter, two-factor authentication registrations, delivery and ride-sharing accounts, and any service that uses phone number verification.",
  },
  {
    q: "Is it legal to search for accounts by phone number?",
    a: "Yes, when searching your own phone number or conducting authorised investigations. FootprintIQ only queries publicly accessible data and known breach databases. It does not perform call interception, SIM swapping, or any illegal surveillance techniques.",
  },
  {
    q: "Can someone find my accounts using my phone number?",
    a: "Yes. Your phone number is often used as a recovery option, two-factor authentication method, or registration identifier. Anyone with OSINT tools can check which platforms recognise your number. This is why auditing your phone number exposure is critical for personal security.",
  },
  {
    q: "How do data breaches expose phone numbers?",
    a: "Many services store phone numbers alongside email addresses and passwords. When these services are breached, phone numbers enter the public domain through breach aggregators. The 2021 Facebook breach alone exposed over 500 million phone numbers worldwide.",
  },
  {
    q: "What should I do if my phone number is exposed?",
    a: "Review which accounts use your phone for two-factor authentication and consider switching to app-based authenticators. Request removal from data broker listings, enable SIM lock with your carrier to prevent SIM swapping, and consider using a separate number for sensitive accounts.",
  },
  {
    q: "How is a phone search different from an email search?",
    a: "Phone searches are particularly effective for discovering messaging app accounts (WhatsApp, Telegram, Signal) and services that use phone-first registration. Email searches are better for traditional web services and forums. Combining both produces the most complete picture.",
  },
  {
    q: "Can I find accounts linked to a phone number that's been recycled?",
    a: "Yes, and this is a significant privacy risk. When carriers reassign phone numbers, the new owner may gain access to accounts still linked to the old number. Running a phone scan after receiving a new number helps identify and secure any legacy accounts.",
  },
];

export default function FindAccountsByPhone() {
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
      <JsonLd data={buildArticleSchema({ headline: "Find Accounts By Phone Number", description: DESC, url: CANONICAL, datePublished: "2026-03-07", dateModified: "2026-03-07" })} />
      <JsonLd data={buildFAQSchema(FAQS)} />
      <JsonLd data={buildBreadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Find Accounts By Phone", path: SLUG }])} />

      <Header />
      <main className="min-h-screen bg-background">
        <IntentAlignmentBanner />

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ContentBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Find Accounts By Phone" }]} />
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Phone className="h-3 w-3 mr-1.5" />Phone Number Lookup
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Find Accounts By Phone Number</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover every account, messaging app, and data breach linked to a phone number. FootprintIQ scans public sources and breach databases to map your phone number exposure.
            </p>
            <HeroInputField />
            <div className="mt-6"><EthicalOsintTrustBlock /></div>
          </div>
        </section>

        {/* Why Phone Numbers Are High-Risk Identifiers */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Why Phone Numbers Are High-Risk Identifiers</h2>
            <p>
              Your phone number has become one of the most sensitive identifiers in your digital life. Unlike email addresses, which are relatively easy to create and discard, most people keep the same phone number for years — sometimes decades. This persistence makes phone numbers an exceptionally reliable link between your offline identity and your online accounts.
            </p>
            <p>
              The problem begins with how widely phone numbers are used. Social media platforms use them for account verification. Banks use them for two-factor authentication. Messaging apps like WhatsApp, Telegram, and Signal use them as primary identifiers. Delivery services, ride-sharing apps, and online marketplaces all require phone verification. Over time, a single phone number can become connected to dozens — or hundreds — of services.
            </p>
            <p>
              Unlike email, phone numbers carry additional metadata. A phone number reveals your country, your carrier, and in some cases your approximate location. Reverse lookup services can connect a phone number to a name and physical address. This makes phone number exposure particularly dangerous for individuals concerned about stalking, harassment, or targeted attacks.
            </p>
            <p>
              The rise of SIM swapping attacks has made phone number security even more critical. Attackers who convince a carrier to transfer your number to their SIM card can intercept two-factor authentication codes, reset passwords, and gain access to your most sensitive accounts — all without ever touching your physical device.
            </p>
          </div>
        </section>

        {/* What A Phone Number Search Reveals */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>What A Phone Number Search Reveals</h2>
            <p>
              A comprehensive phone number OSINT scan uncovers connections across several categories of services and data sources. Understanding these categories helps you assess your risk and prioritise remediation.
            </p>

            <div className="grid md:grid-cols-2 gap-6 not-prose my-8">
              {[
                { icon: Globe, title: "Messaging App Accounts", desc: "WhatsApp, Telegram, Signal, Viber, and other messaging platforms that use phone numbers as primary identifiers. Profile pictures and status messages may also be revealed." },
                { icon: Database, title: "Data Breach Exposure", desc: "Breached databases containing phone numbers, often alongside names, email addresses, passwords, and physical addresses. Major breaches like Facebook (2021) exposed hundreds of millions of numbers." },
                { icon: Search, title: "Social Media Profiles", desc: "Facebook, Instagram, Twitter, TikTok, and LinkedIn accounts linked to the phone number through contact import, account recovery, or registration verification." },
                { icon: Shield, title: "Data Broker Listings", desc: "People-search sites and data brokers that aggregate public records, property data, and consumer information indexed by phone number." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-6">
                  <Icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>

            <p>
              Phone scans are particularly effective at revealing accounts on platforms where phone numbers are the primary identifier. While an email search might miss a WhatsApp account that was registered with just a phone number, a phone-based scan will catch it. This complementary coverage is why FootprintIQ recommends running both email and phone scans for a complete digital footprint analysis.
            </p>
          </div>
        </section>

        {/* Risks Of Phone Number Exposure */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>Risks Of Exposed Phone Number Accounts</h2>
            <p>
              Phone number exposure creates unique risks that differ from — and often exceed — those associated with email exposure. The direct connection between a phone number and a physical device makes these risks particularly acute.
            </p>
            <ul>
              <li><strong>SIM swapping attacks.</strong> Attackers social-engineer your mobile carrier into transferring your number to their SIM card. They then intercept SMS-based two-factor authentication codes and reset passwords on your bank accounts, email, and cryptocurrency wallets.</li>
              <li><strong>Targeted phishing via SMS (smishing).</strong> Knowing which services you use allows attackers to send convincing SMS messages that mimic legitimate notifications. "Your Amazon order has been delayed — click here to reschedule" is far more effective when the attacker knows you actually have an Amazon account.</li>
              <li><strong>Physical safety risks.</strong> Reverse phone lookup services can connect a number to a name and physical address. For individuals escaping domestic violence, stalking, or harassment, phone number exposure can directly endanger physical safety.</li>
              <li><strong>Account takeover via recovery flows.</strong> Many services allow password resets via SMS. If an attacker controls your phone number (through SIM swapping or SS7 exploitation), they can take over any account that uses SMS-based recovery.</li>
              <li><strong>Caller ID spoofing.</strong> Attackers can spoof your phone number to conduct scams, making it appear that calls originate from your number. Victims of these scams may then contact you directly, creating confusion and potential legal exposure.</li>
            </ul>
            <p>
              According to the FBI's Internet Crime Complaint Centre, SIM swapping losses exceeded $68 million in 2023 alone, and the trend has accelerated since. The most effective defence is understanding which accounts are linked to your phone number and reducing that exposure proactively.
            </p>
          </div>
        </section>

        {/* How To Find Accounts Linked To Your Phone */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Find Accounts Linked To Your Phone Number</h2>
            <p>
              Discovering which accounts are connected to your phone number requires a combination of automated scanning and manual verification. Here's a systematic approach:
            </p>

            <h3>1. Run A FootprintIQ Phone Scan</h3>
            <p>
              Enter your phone number with the international country code (e.g., +44 for the UK, +1 for the US), and FootprintIQ will query messaging app registrations, social media contact import APIs, breach databases, and data broker listings. Results are deduplicated and presented with confidence scores.
            </p>

            <h3>2. Check Messaging Apps Manually</h3>
            <p>
              Add your own number as a contact on a secondary device, then check WhatsApp, Telegram, Signal, and Viber to see what profile information is visible. This reveals what anyone who has your number can see about you.
            </p>

            <h3>3. Review Account Security Settings</h3>
            <p>
              Log in to your most important accounts (email, banking, social media) and check which ones use your phone number for recovery or two-factor authentication. Consider switching to app-based authenticators where possible.
            </p>

            <h3>4. Search Data Broker Sites</h3>
            <p>
              Check people-search engines like Spokeo, BeenVerified, and WhitePages to see what information is publicly available when your phone number is searched. Most of these services allow you to request removal of your data.
            </p>

            <h3>5. Combine With Email And Username Scans</h3>
            <p>
              For the most comprehensive results, combine your phone scan with an <Link to="/find-accounts-by-email" className="text-primary hover:underline">email account search</Link> and a <Link to="/usernames" className="text-primary hover:underline">username search</Link>. This three-pronged approach captures accounts regardless of which identifier was used during registration.
            </p>
          </div>
        </section>

        {/* How To Protect Your Phone Number */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-4xl mx-auto px-6 prose prose-lg dark:prose-invert">
            <h2>How To Reduce Your Phone Number Exposure</h2>
            <p>
              Protecting your phone number requires both reducing the number of services that have it and hardening the accounts that do. Follow this remediation framework:
            </p>
            <ol>
              <li><strong>Scan.</strong> Run a comprehensive phone number scan using FootprintIQ to identify all linked accounts, breach exposure, and data broker listings.</li>
              <li><strong>Act.</strong> Remove your phone number from accounts that don't need it. Switch from SMS-based two-factor authentication to app-based authenticators (Google Authenticator, Authy) or hardware keys (YubiKey). Request removal from data broker sites.</li>
              <li><strong>Verify.</strong> Re-scan after making changes to confirm that your number has been removed from the accounts you targeted. Monitor for new breach exposure.</li>
              <li><strong>Measure.</strong> Track your exposure score over time. Each account that no longer uses your phone number reduces your SIM swapping risk.</li>
            </ol>

            <h3>Additional Phone Security Tips</h3>
            <ul>
              <li><strong>Enable SIM lock.</strong> Contact your carrier to set a PIN or password that must be provided before any SIM changes are made to your account.</li>
              <li><strong>Use a secondary number.</strong> Services like Google Voice or Hushed provide secondary numbers that can be used for registrations, keeping your primary number private.</li>
              <li><strong>Limit contact sharing.</strong> Be cautious about granting "access to contacts" permissions to apps. This allows services to match your phone number against their user database.</li>
              <li><strong>Review privacy settings on messaging apps.</strong> WhatsApp, Telegram, and Signal all have settings that control who can see your profile picture, status, and last-seen timestamp.</li>
            </ul>
            <p>
              Use FootprintIQ's <Link to="/digital-footprint-checker" className="text-primary hover:underline">digital footprint checker</Link> for ongoing monitoring, or run a <Link to="/reverse-username-search" className="text-primary hover:underline">reverse username lookup</Link> to discover accounts that might use a username derived from your phone number.
            </p>
          </div>
        </section>

        {/* FAQs */}
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
