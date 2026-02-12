import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/seo/JsonLd';
import { GuideCitationBlock } from '@/components/guides/GuideCitationBlock';
import { buildWebPageSchema } from '@/lib/seo/webPageSchema';
import { Link } from 'react-router-dom';
import { Shield, Eye, UserX, FileX, Lock, Heart } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: Eye,
    title: 'Public-Source Only',
    description:
      'FootprintIQ analyses publicly accessible information — social media profiles, forum posts, data broker listings, and publicly indexed content. We never access private systems, locked accounts, or restricted databases.',
  },
  {
    icon: Lock,
    title: 'No Private Database Access',
    description:
      'We do not query private databases, law-enforcement systems, or proprietary data sets. Every source used in a scan is publicly available and independently verifiable by the user.',
  },
  {
    icon: UserX,
    title: 'No Impersonation',
    description:
      'FootprintIQ never creates accounts, sends messages, or interacts with third parties on behalf of a user. Scans are observational — we read what is already visible, without pretending to be someone else.',
  },
  {
    icon: FileX,
    title: 'No Automated Removal Submissions',
    description:
      'We provide templates and guidance for data-removal requests, but never submit opt-out forms automatically without explicit user consent. Users retain full control over every action taken with their data.',
  },
  {
    icon: Shield,
    title: 'Transparency in Data Handling',
    description:
      'Scan results are stored securely and associated only with the authenticated user who initiated them. We do not sell, share, or repurpose scan data. Users can delete their data at any time.',
  },
  {
    icon: Heart,
    title: 'Respect for Privacy Rights',
    description:
      'FootprintIQ is designed for self-audits, authorised investigations, and compliance-aligned research. We actively discourage misuse and provide educational resources on responsible OSINT practices.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Does FootprintIQ access private accounts or messages?',
    a: 'No. FootprintIQ only analyses publicly accessible information. We never log into accounts, bypass authentication, or access private messages.',
  },
  {
    q: 'Can FootprintIQ be used for background checks?',
    a: 'FootprintIQ is not a consumer reporting agency and should not be used as a substitute for regulated background checks. It is designed for self-assessment and authorised research only.',
  },
  {
    q: 'How does FootprintIQ handle my scan data?',
    a: 'Scan results are encrypted, stored securely, and associated only with your account. We do not share or sell your data. You can delete your scan history at any time.',
  },
  {
    q: 'Is OSINT legal?',
    a: 'Collecting and analysing publicly available information is legal in most jurisdictions. FootprintIQ follows responsible disclosure principles and encourages users to respect applicable laws and individual privacy.',
  },
];

export default function EthicalOsintPrinciples() {
  const canonicalUrl = 'https://footprintiq.app/ethical-osint-principles';

  const webPageSchema = buildWebPageSchema({
    name: 'Our Approach to Ethical OSINT',
    description:
      'How FootprintIQ applies ethical, public-source-only intelligence principles to digital exposure analysis.',
    url: canonicalUrl,
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://footprintiq.app/' },
      { '@type': 'ListItem', position: 2, name: 'Ethical OSINT Principles', item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Our Approach to Ethical OSINT — FootprintIQ"
        description="How FootprintIQ applies ethical, public-source-only intelligence principles to digital exposure analysis. No private databases, no impersonation, full transparency."
        canonical={canonicalUrl}
      />
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Our Approach to Ethical OSINT
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              FootprintIQ is built on a simple commitment: help people understand their
              public digital exposure using only ethical, transparent, and publicly
              available methods.
            </p>
          </div>
        </section>

        {/* Principles */}
        <section className="pb-16 px-6">
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-xl border border-border/60 bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground mb-1.5">{p.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Context */}
        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Why These Principles Matter
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Open-source intelligence is a powerful capability. When applied
              responsibly, it helps individuals and organisations understand their
              exposure surface, identify risks, and take informed action. When misused,
              it can cause real harm.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FootprintIQ exists to make ethical OSINT accessible — not to enable
              surveillance, harassment, or unauthorised investigation. Every design
              decision, from scan methodology to result presentation, reflects this
              commitment.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For more on how we handle personal data, see our{' '}
              <Link
                to="/privacy-centre"
                className="text-primary font-medium hover:underline"
              >
                Privacy Centre
              </Link>
              . To understand how removal workflows operate, visit the{' '}
              <Link
                to="/privacy/data-broker-removal-guide"
                className="text-primary font-medium hover:underline"
              >
                Data Broker Removal Guide
              </Link>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {FAQ_ITEMS.map((item) => (
                <div key={item.q} className="border-b border-border/40 pb-5">
                  <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Citation */}
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <GuideCitationBlock />
        </div>
      </main>

      <Footer />
    </div>
  );
}
