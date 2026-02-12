import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/seo/JsonLd';
import { GuideCitationBlock } from '@/components/guides/GuideCitationBlock';
import { buildWebPageSchema } from '@/lib/seo/webPageSchema';
import { Link } from 'react-router-dom';
import { Globe, Lock, UserX, FileX, Shield, Scale } from 'lucide-react';
import { RelatedPrivacyGuides } from '@/components/privacy/RelatedPrivacyGuides';
import { PrivacyBreadcrumb } from '@/components/privacy/PrivacyBreadcrumb';

const SECTIONS = [
  {
    icon: Globe,
    title: 'Public-Source Intelligence Only',
    content:
      'FootprintIQ analyses publicly accessible information — social media profiles, forum posts, data broker listings, and publicly indexed content. We do not access private systems, locked accounts, or restricted databases. Every data point surfaced in a scan originates from sources that are independently verifiable by anyone with an internet connection.',
  },
  {
    icon: Lock,
    title: 'No Private Database Access',
    content:
      'We do not query private databases, law-enforcement systems, credit bureaus, or proprietary data sets. No non-public records are accessed at any stage of the scanning or analysis process. The information we surface is limited strictly to what is already publicly available.',
  },
  {
    icon: UserX,
    title: 'No Impersonation or Deceptive Practices',
    content:
      'FootprintIQ never creates fake accounts, sends messages, or interacts with platforms on behalf of a user. We do not scrape behind login walls or use deceptive techniques to gain access to restricted content. All scans are observational — we read what is already visible without pretending to be someone else.',
  },
  {
    icon: FileX,
    title: 'No Automated Removal Submissions',
    content:
      'We provide templates, guidance, and structured workflows for data-removal requests, but we never submit opt-out forms or removal requests automatically without explicit user consent. Users retain full control over every action taken with their data, including when and how removal requests are sent.',
  },
  {
    icon: Shield,
    title: 'Transparency & User Control',
    content:
      'Scan results are stored securely and associated only with the authenticated user who initiated them. We do not sell, share, or repurpose scan data. Users receive structured exposure awareness — clear, contextual information about their digital footprint — and can delete their data at any time.',
  },
  {
    icon: Scale,
    title: 'Compliance & Legal Framework Awareness',
    content:
      'FootprintIQ operates with awareness of major data-protection frameworks including the General Data Protection Regulation (GDPR), the UK GDPR, the California Consumer Privacy Act (CCPA/CPRA), and platform-specific transparency policies. While we do not provide legal advice, our workflows are designed to align with the principles of lawful basis, data minimisation, and individual rights that underpin these regulations.',
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
    name: 'Ethical OSINT & Public-Source Intelligence Principles',
    description:
      'Learn how FootprintIQ approaches ethical OSINT and digital exposure analysis using public-source data only.',
    url: canonicalUrl,
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://footprintiq.app/' },
      { '@type': 'ListItem', position: 2, name: 'Privacy Resources', item: 'https://footprintiq.app/privacy-centre' },
      { '@type': 'ListItem', position: 3, name: 'Ethical OSINT Principles', item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Ethical OSINT & Public-Source Intelligence Principles | FootprintIQ"
        description="Learn how FootprintIQ approaches ethical OSINT and digital exposure analysis using public-source data only."
        canonical={canonicalUrl}
      />
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 pt-8">
          <PrivacyBreadcrumb currentPage="Ethical OSINT Principles" />
        </div>
        {/* Hero */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Our Approach to Ethical OSINT
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              FootprintIQ is built on a clear commitment: help people understand their
              public digital exposure using only ethical, transparent, and publicly
              available methods.
            </p>
          </div>
        </section>

        {/* Principle sections */}
        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto space-y-10">
            {SECTIONS.map((s, i) => (
              <div key={s.title} className="flex items-start gap-5">
                <div className="p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {i + 1}. {s.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{s.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="pb-16 px-6">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Learn More</h2>
            <p className="text-muted-foreground leading-relaxed">
              For details on how we handle personal data, visit our{' '}
              <Link to="/privacy-centre" className="text-primary font-medium hover:underline">
                Privacy Centre
              </Link>
              . To understand how removal workflows operate, see the{' '}
              <Link to="/privacy/data-broker-removal-guide" className="text-primary font-medium hover:underline">
                Data Broker Removal Guide
              </Link>
              . Ready to assess your own digital footprint?{' '}
              <Link to="/scan" className="text-primary font-medium hover:underline">
                Start a scan
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Guides */}
        <div className="max-w-3xl mx-auto px-6">
          <RelatedPrivacyGuides links={[
            { label: "Remove Personal Information from Google", to: "/privacy/google-content-removal" },
            { label: "Data Broker Removal Guide", to: "/privacy/data-broker-removal-guide" },
            { label: "Remove Your Spokeo Listing", to: "/remove-spokeo-profile" },
            { label: "Privacy Centre – Templates & Tracking", to: "/privacy-centre" },
          ]} />
        </div>

        {/* Citation */}
        <div className="max-w-3xl mx-auto px-6 pb-12">
          <GuideCitationBlock />
        </div>
      </main>

      <Footer />
    </div>
  );
}
