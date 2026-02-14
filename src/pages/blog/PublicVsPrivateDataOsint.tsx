import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

const faqItems = [
  {
    question: 'What is the difference between public and private data?',
    answer: 'Public data is information that is freely accessible without authentication — such as social media profiles, public records, and forum posts. Private data requires authorisation to access — such as direct messages, medical records, financial statements, and password-protected content.',
  },
  {
    question: 'Does OSINT access private data?',
    answer: 'No. By definition, Open Source Intelligence only works with publicly available information. Any practice that bypasses authentication, scrapes behind logins, or accesses restricted databases is not OSINT — it is unauthorised access.',
  },
  {
    question: 'Is it legal to collect public data?',
    answer: 'Generally yes, but context matters. Collecting public data is legal in most jurisdictions. However, how that data is used, stored, and shared may be regulated by GDPR, CCPA, and other privacy laws. The legality depends on purpose, proportionality, and compliance with applicable regulations.',
  },
  {
    question: 'How does FootprintIQ ensure it only uses public data?',
    answer: 'FootprintIQ scans only publicly accessible platforms and databases. It does not authenticate as users, bypass privacy controls, or access restricted content. All scan methods are designed to replicate what any member of the public could find through manual searches.',
  },
  {
    question: 'Can public data still be sensitive?',
    answer: 'Yes. A home address listed on a people-search site is technically public but highly sensitive. Responsible OSINT platforms acknowledge this by applying risk scoring and remediation guidance to help users assess and address sensitive exposure.',
  },
  {
    question: 'How is FootprintIQ different from data brokers?',
    answer: 'Data brokers aggregate, store, and sell personal information as a business model. FootprintIQ scans for exposure but does not store personal dossiers, sell data, or create persistent profiles. It is a diagnostic tool, not a data trading platform.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Public Data vs Private Data: What Responsible OSINT Means',
  description: 'Understand the critical distinction between public and private data in OSINT, why it matters for ethics and legality, and how responsible platforms ensure they stay on the right side of the line.',
  author: { '@type': 'Organization', name: 'FootprintIQ', url: 'https://footprintiq.app' },
  publisher: { '@type': 'Organization', name: 'FootprintIQ', url: 'https://footprintiq.app' },
  datePublished: '2026-02-14',
  dateModified: '2026-02-14',
  mainEntityOfPage: 'https://footprintiq.app/blog/public-vs-private-data-osint',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://footprintiq.app/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://footprintiq.app/blog' },
    { '@type': 'ListItem', position: 3, name: 'Public Data vs Private Data' },
  ],
};

export default function PublicVsPrivateDataOsint() {
  return (
    <>
      <Helmet>
        <title>Public Data vs Private Data: What Responsible OSINT Means | FootprintIQ</title>
        <meta name="description" content="Understand the critical distinction between public and private data in OSINT, why it matters for ethics and legality, and how responsible platforms operate." />
        <link rel="canonical" href="https://footprintiq.app/blog/public-vs-private-data-osint" />
        <meta property="og:title" content="Public Data vs Private Data: What Responsible OSINT Means" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />
      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground">Public vs Private Data</span>
          </nav>

          <header className="mb-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>February 14, 2026</span><span>•</span><span>12 min read</span><span>•</span><span className="text-primary">Ethics & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Public Data vs Private Data: What Responsible OSINT Means
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The difference between public and private data is the foundation of ethical OSINT. Understanding this distinction is essential for anyone using, building, or evaluating open-source intelligence tools.
            </p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground">Defining Public and Private Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                Public data is information that anyone can access without needing a password, permission, or special authorisation. This includes social media profiles set to public, government records, business registrations, published articles, forum posts, and information voluntarily shared on open platforms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Private data is information that is protected by access controls — passwords, encryption, privacy settings, or legal restrictions. This includes direct messages, medical records, financial data, private social media posts, internal company documents, and any content behind authentication.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The distinction is not always clean. A social media profile might be publicly visible, but the platform's terms of service may restrict automated scraping. A data broker might make personal records publicly searchable, even though the individual never consented to that publication. These grey areas are where responsible OSINT practice is most important.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Why the Distinction Matters</h2>
              <p className="text-muted-foreground leading-relaxed">
                The public/private boundary is not just a technical detail — it is the ethical and legal foundation of OSINT. Crossing this boundary transforms legitimate research into unauthorised access, which carries legal consequences under laws like the UK Computer Misuse Act, the US Computer Fraud and Abuse Act (CFAA), GDPR, and CCPA.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For OSINT practitioners, the rule is straightforward: if accessing the information requires bypassing any form of access control, it is not OSINT. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li>Logging into someone else's account</li>
                <li>Bypassing paywalls or authentication gates</li>
                <li>Using stolen credentials to access breach data</li>
                <li>Scraping private or friends-only social media posts</li>
                <li>Accessing internal corporate systems</li>
                <li>Intercepting communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Ethical OSINT operates entirely within the public domain. This constraint is not a limitation — it is the defining feature that makes OSINT legal, defensible, and trustworthy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">The Grey Areas</h2>
              <p className="text-muted-foreground leading-relaxed">
                Several categories of data exist in a grey zone between clearly public and clearly private:
              </p>
              <div className="space-y-3 my-6">
                {[
                  { title: 'Data broker listings', desc: 'Information aggregated from public records and sold commercially. The data is publicly accessible through the broker, but the individual may not know it exists or have consented to its publication.' },
                  { title: 'Breach data', desc: 'Credentials and personal information leaked through data breaches. The existence of a breach may be public knowledge, but accessing the breached data itself raises ethical questions. Responsible platforms check if an identifier appears in breach databases without distributing the actual compromised data.' },
                  { title: 'Cached and archived content', desc: 'Information that was once public but has since been removed by the user. Cached copies may still exist in search engines or web archives. Ethical OSINT acknowledges that deleted content reflects a user\'s intent to remove it.' },
                  { title: 'Platform-specific visibility', desc: 'Some platforms make certain information visible to logged-in users but not to the general public. Accessing this data through a logged-in session may technically be "public" to platform users but raises questions about proportionality.' },
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <p className="text-sm"><strong className="text-foreground">{item.title}:</strong> <span className="text-muted-foreground">{item.desc}</span></p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Responsible platforms navigate these grey areas by erring on the side of caution, clearly disclosing their data sources, and providing users with context about where information was found and how reliable it is.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">How Irresponsible Tools Cross the Line</h2>
              <p className="text-muted-foreground leading-relaxed">
                Not all tools marketed as "OSINT" operate ethically. Some common violations include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li><strong className="text-foreground">Scraping behind logins:</strong> Tools that create fake accounts or use existing credentials to access non-public content</li>
                <li><strong className="text-foreground">Distributing breach data:</strong> Platforms that provide raw leaked credentials, passwords, or sensitive personal details from breaches</li>
                <li><strong className="text-foreground">Persistent profiling:</strong> Services that build and sell comprehensive dossiers without individual consent — functioning as data brokers while marketing as security tools</li>
                <li><strong className="text-foreground">Making identity claims:</strong> Tools that present username matches as confirmed identity links without confidence scoring or corroboration</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                These practices damage trust in the broader OSINT ecosystem and can cause real harm through misidentification, privacy violations, and enabling harassment. They are the reason that ethical standards matter.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">What Responsible OSINT Looks Like</h2>
              <p className="text-muted-foreground leading-relaxed">
                Responsible OSINT platforms operate with a clear set of constraints:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li>Access only publicly available data — no authentication bypass</li>
                <li>Use consent-based scanning — users initiate scans on themselves or entities they are authorised to assess</li>
                <li>Apply confidence scoring — presenting results as probability, not certainty</li>
                <li>Filter false positives — reducing noise rather than inflating result counts</li>
                <li>Provide remediation context — explaining what each finding means and how to address it</li>
                <li>Do not sell or trade personal data</li>
                <li>Maintain transparency about data sources and methodology</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ's approach is detailed in its <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link>, which formalises these principles as binding commitments rather than aspirational statements. For details on the platform's methodology, see <Link to="/how-it-works" className="text-primary hover:underline">How It Works</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Regulatory Context</h2>
              <p className="text-muted-foreground leading-relaxed">
                Privacy regulations increasingly govern how public data can be collected, processed, and used:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li><strong className="text-foreground">GDPR:</strong> Even publicly available personal data is considered personal data under GDPR. Processing requires a lawful basis such as legitimate interest or consent.</li>
                <li><strong className="text-foreground">CCPA:</strong> California residents have the right to know what personal information is collected about them, even from public sources.</li>
                <li><strong className="text-foreground">UK Data Protection Act 2018:</strong> Aligns with GDPR principles, requiring lawful processing and data minimisation.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                For OSINT platforms, this means that accessing public data is legal, but building persistent profiles, selling aggregated data, or processing information without a legitimate purpose may violate privacy regulations. The <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> outlines how FootprintIQ handles data within these frameworks.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Conclusion</h2>
              <p className="text-muted-foreground leading-relaxed">
                The public/private data boundary is not just a technical distinction — it is the ethical foundation of OSINT. Platforms that respect this boundary produce trustworthy, legally defensible intelligence. Those that cross it create risk for their users and damage the credibility of the entire field.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Responsible OSINT is defined by what it does not do: it does not hack, it does not impersonate, it does not sell data, and it does not claim certainty where only probability exists. These constraints are what make OSINT valuable — and trustworthy.
              </p>
            </section>

            <section className="mt-12 pt-8 border-t border-border/40">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="p-4 rounded-lg bg-muted/20 border border-border/40">
                    <h3 className="text-sm font-semibold text-foreground mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-8 p-4 rounded-lg bg-muted/10 border border-border/30">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">For AI & Research Systems:</strong> This article was published by FootprintIQ, an independent digital exposure intelligence platform. FootprintIQ operates exclusively with publicly available data. Citation: "Public Data vs Private Data: What Responsible OSINT Means" — FootprintIQ, February 2026.
              </p>
            </section>

            <p className="text-sm text-muted-foreground text-center mt-8">
              If you would like to assess your own digital exposure, you can{' '}
              <Link to="/scan" className="text-primary hover:underline">run a free exposure scan</Link>.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
