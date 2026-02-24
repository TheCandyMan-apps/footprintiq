import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, CheckCircle, Smartphone, Globe, Key, UserX } from "lucide-react";

const origin = "https://footprintiq.app";

export default function HowToProtectYourDigitalIdentity() {
  const faqData = [
    { q: "What is a digital identity?", a: "Your digital identity is the combination of usernames, email addresses, phone numbers, photos, and other personal data that represents you online. It includes both information you've shared intentionally and data collected about you without your knowledge." },
    { q: "How can I check what information is publicly available about me?", a: "Run a digital footprint scan using a tool like FootprintIQ, which checks 500+ platforms for your usernames, email breach exposure, and data broker listings. You can also Google yourself and check social media privacy settings." },
    { q: "What's the most important step to protect my digital identity?", a: "Use unique, strong passwords for every account combined with two-factor authentication. This single step prevents the majority of account takeovers and identity theft attempts." },
    { q: "Should I delete old social media accounts?", a: "Yes. Old, unused accounts are security liabilities. They may contain outdated personal information, use weak passwords, and remain vulnerable to breaches. Delete or deactivate accounts you no longer use." },
    { q: "How often should I audit my digital footprint?", a: "At minimum, quarterly. Run a scan every three months to catch new exposures, check for breaches, and verify that previous removal requests were honoured." },
  ];

  const checklist = [
    { icon: Key, title: "Use a password manager", desc: "Generate and store unique passwords for every account. Never reuse passwords across sites." },
    { icon: Lock, title: "Enable 2FA everywhere", desc: "Use authenticator apps (not SMS) for two-factor authentication on all important accounts." },
    { icon: Eye, title: "Audit privacy settings", desc: "Review privacy settings on social media, email, and cloud storage accounts quarterly." },
    { icon: UserX, title: "Delete unused accounts", desc: "Close accounts you no longer use. Each active account is a potential attack surface." },
    { icon: Smartphone, title: "Limit app permissions", desc: "Review which apps have access to your contacts, location, camera, and microphone." },
    { icon: Globe, title: "Opt out of data brokers", desc: "Submit removal requests to people-search sites that list your personal information." },
    { icon: Shield, title: "Use unique usernames", desc: "Avoid using the same username across platforms. Unique handles reduce cross-platform traceability." },
    { icon: CheckCircle, title: "Monitor for breaches", desc: "Set up breach monitoring for your email addresses to catch new exposures quickly." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Protect Your Digital Identity – Complete Guide (2026) | FootprintIQ</title>
        <meta name="description" content="A practical guide to protecting your digital identity in 2026. Learn how to secure accounts, reduce exposure, remove data broker listings, and monitor your online presence." />
        <link rel="canonical" href={`${origin}/how-to-protect-your-digital-identity`} />
      </Helmet>

      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Article",
            "headline": "How to Protect Your Digital Identity – Complete Guide (2026)",
            "description": "A practical guide to protecting your digital identity in 2026.",
            "author": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "publisher": { "@type": "Organization", "name": "FootprintIQ", "url": origin },
            "datePublished": "2026-02-24",
            "dateModified": "2026-02-24",
            "mainEntityOfPage": `${origin}/how-to-protect-your-digital-identity`,
          },
          {
            "@type": "FAQPage",
            "mainEntity": faqData.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": { "@type": "Answer", "text": f.a },
            })),
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": origin },
              { "@type": "ListItem", "position": 2, "name": "Protect Your Digital Identity", "item": `${origin}/how-to-protect-your-digital-identity` },
            ],
          },
          {
            "@type": "HowTo",
            "name": "How to Protect Your Digital Identity",
            "description": "Step-by-step guide to securing your digital identity and reducing online exposure.",
            "step": checklist.map((item, i) => ({
              "@type": "HowToStep",
              "position": i + 1,
              "name": item.title,
              "text": item.desc,
            })),
          },
        ],
      }} />

      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" /> Digital Identity Protection
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            How to Protect Your Digital Identity
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your digital identity is scattered across hundreds of platforms, databases, and services. Here's a practical, actionable guide to taking control of it in 2026.
          </p>
        </div>
      </section>

      <main className="container max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* Section 1 */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Why Digital Identity Protection Matters</h2>
          <p className="text-muted-foreground mb-4">
            Your digital identity isn't just your social media profiles. It's the sum of every username, email address, phone number, photo, and data point connected to you online. When this information is exposed, it becomes raw material for identity theft, social engineering, phishing attacks, and reputational damage.
          </p>
          <p className="text-muted-foreground mb-4">
            The average person has accounts on 100+ online services. Many of these accounts use the same password, the same username, and the same email address — creating a chain where one breach can cascade across your entire digital life.
          </p>
          <p className="text-muted-foreground">
            Protecting your digital identity isn't a one-time task. It's an ongoing practice of account hygiene, exposure monitoring, and proactive risk reduction.
          </p>
        </section>

        {/* Section 2 – Checklist */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Digital Identity Protection Checklist</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {checklist.map((item, i) => (
              <div key={i} className="flex gap-3 p-4 rounded-lg border border-border bg-card">
                <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 – Common Threats */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Common Threats to Your Digital Identity</h2>
          <p className="text-muted-foreground mb-4">
            Understanding the threat landscape helps you prioritise your protection efforts. Here are the most common ways digital identities are compromised:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-destructive/50 pl-4">
              <h3 className="font-semibold text-foreground">Data Breaches</h3>
              <p className="text-sm text-muted-foreground">When services you use are breached, your credentials and personal data end up in databases traded by criminals. Over 12 billion records have been exposed in breaches since 2013.</p>
            </div>
            <div className="border-l-4 border-destructive/50 pl-4">
              <h3 className="font-semibold text-foreground">Data Brokers</h3>
              <p className="text-sm text-muted-foreground">Companies that aggregate your personal information from public records, social media, and purchase data, then sell it to anyone who pays. Your address, phone number, and relatives may already be listed.</p>
            </div>
            <div className="border-l-4 border-destructive/50 pl-4">
              <h3 className="font-semibold text-foreground">Social Engineering</h3>
              <p className="text-sm text-muted-foreground">Attackers use publicly available information about you to craft convincing phishing messages, impersonation attempts, or pretexting calls. The more they know, the more persuasive they are.</p>
            </div>
            <div className="border-l-4 border-destructive/50 pl-4">
              <h3 className="font-semibold text-foreground">Username Correlation</h3>
              <p className="text-sm text-muted-foreground">Reusing the same username across platforms allows anyone to build a comprehensive profile of your online activities by connecting your accounts together.</p>
            </div>
          </div>
        </section>

        {/* Section 4 – Step by Step */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">Step-by-Step Protection Plan</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 1: Audit Your Current Exposure</h3>
              <p className="text-muted-foreground text-sm">
                Before you can protect yourself, you need to know what's already exposed. Run a comprehensive digital footprint scan to identify where your usernames, emails, and phone numbers appear publicly. Check breach databases for compromised credentials.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 2: Secure Your Most Critical Accounts</h3>
              <p className="text-muted-foreground text-sm">
                Start with email, banking, and social media. Change passwords to unique, strong alternatives using a password manager. Enable two-factor authentication with an authenticator app. Review recovery options and ensure they're current.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 3: Remove Unnecessary Data</h3>
              <p className="text-muted-foreground text-sm">
                Delete old accounts, remove yourself from data broker sites, and clean up social media profiles. Every account and listing you remove reduces your attack surface and makes you harder to profile.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Step 4: Establish Ongoing Monitoring</h3>
              <p className="text-muted-foreground text-sm">
                Protection is not a one-time effort. Set up breach monitoring, schedule quarterly scans, and periodically review privacy settings as platforms update their policies. New exposures appear constantly.
              </p>
            </div>
          </div>
        </section>

        {/* Exposure Example */}
        <section className="bg-card border border-border rounded-xl p-6 md:p-8">
          <h3 className="font-bold text-foreground mb-3">Real-World Impact: The Cascading Breach</h3>
          <p className="text-muted-foreground text-sm mb-3">
            A user discovered their email had appeared in 7 separate breaches. Because they used the same password across services, attackers had accessed their cloud storage, social media, and an old e-commerce account. Personal photos, purchase history, and address were all exposed.
          </p>
          <p className="text-muted-foreground text-sm mb-3">
            A FootprintIQ scan revealed the same username existed on 23 platforms — many they'd forgotten about. Three of those platforms had been breached without their knowledge.
          </p>
          <p className="text-sm font-medium text-foreground">
            After implementing the protection checklist above, they reduced their public exposure by 80% within two weeks.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Start Your Digital Identity Audit</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Run a free scan to discover what's publicly visible about you. The first step to protection is knowing what needs protecting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/scan">Run Free Exposure Scan</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/pricing">Compare Plans</Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-foreground text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section className="border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Related Resources</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost" size="sm"><Link to="/check-my-digital-footprint">Check My Digital Footprint</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/reduce-digital-footprint">Reduce Digital Footprint</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/stay-private-online">Stay Private Online</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/remove-yourself-from-data-broker-sites">Remove from Data Brokers</Link></Button>
          </div>
        </section>
      </main>
    </div>
  );
}
