import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Search, Eye, Scale, CheckCircle } from 'lucide-react';
import { buildWebPageSchema } from '@/lib/seo/webPageSchema';

const faqItems = [
  {
    question: 'What is an ethical OSINT scan?',
    answer: 'An ethical OSINT scan is a structured search of publicly available information — such as usernames, email addresses, and phone numbers — conducted with the consent of the person being searched, using only legal data sources, and without bypassing any privacy controls.',
  },
  {
    question: 'Is an OSINT scan the same as hacking?',
    answer: 'No. OSINT scans only access publicly available data. They do not involve breaking into accounts, bypassing authentication, exploiting vulnerabilities, or accessing private databases. Ethical OSINT is a legal research methodology.',
  },
  {
    question: 'Can I run an OSINT scan on someone else?',
    answer: 'Ethical OSINT is intended for self-assessment or authorised investigations. Running scans on others without their knowledge or a legitimate legal basis raises ethical and potentially legal concerns depending on your jurisdiction.',
  },
  {
    question: 'How is FootprintIQ different from a background check?',
    answer: 'Background checks typically access regulated databases (credit, criminal records) and require legal authorisation. FootprintIQ only searches publicly accessible information — social media, forums, data broker listings, and breach databases.',
  },
  {
    question: 'Are OSINT scan results always accurate?',
    answer: 'No. OSINT scans can produce false positives — matches that share a username but belong to different people. Responsible platforms use confidence scoring and multi-signal correlation to reduce misattribution, but results should always be interpreted as probability, not certainty.',
  },
  {
    question: 'What should I do after an OSINT scan?',
    answer: 'Review the results to understand your exposure. Prioritise high-confidence findings. Consider deleting unused accounts, opting out of data brokers, and strengthening privacy settings on active platforms.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'What Is an Ethical OSINT Scan?',
  description: 'Learn what an ethical OSINT scan is, how it works, what makes it different from surveillance, and why consent and transparency matter in digital exposure analysis.',
  author: { '@type': 'Organization', name: 'FootprintIQ', url: 'https://footprintiq.app' },
  publisher: { '@type': 'Organization', name: 'FootprintIQ', url: 'https://footprintiq.app' },
  datePublished: '2026-02-14',
  dateModified: '2026-02-14',
  mainEntityOfPage: 'https://footprintiq.app/blog/what-is-ethical-osint-scan',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://footprintiq.app/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://footprintiq.app/blog' },
    { '@type': 'ListItem', position: 3, name: 'What Is an Ethical OSINT Scan?' },
  ],
};

export default function WhatIsEthicalOsintScan() {
  return (
    <>
      <Helmet>
        <title>What Is an Ethical OSINT Scan? | FootprintIQ</title>
        <meta name="description" content="Learn what an ethical OSINT scan is, how it works, what makes it different from surveillance, and why consent and transparency matter in digital exposure analysis." />
        <link rel="canonical" href="https://footprintiq.app/blog/what-is-ethical-osint-scan" />
        <meta property="og:title" content="What Is an Ethical OSINT Scan?" />
        <meta property="og:description" content="A complete guide to ethical OSINT scanning — what it is, how it works, and why responsible analysis matters." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://footprintiq.app/blog/what-is-ethical-osint-scan" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Header />
      <main className="min-h-screen bg-background">
        <article className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground">What Is an Ethical OSINT Scan?</span>
          </nav>

          <header className="mb-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>February 14, 2026</span>
              <span>•</span>
              <span>11 min read</span>
              <span>•</span>
              <span className="text-primary">OSINT & Ethics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              What Is an Ethical OSINT Scan?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              OSINT scanning has become widely accessible — but not all scans are created equal. This guide explains what makes an OSINT scan ethical, how responsible platforms operate, and why the distinction matters for privacy, accuracy, and trust.
            </p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">What Is OSINT?</h2>
              <p className="text-muted-foreground leading-relaxed">
                OSINT — Open Source Intelligence — is the practice of collecting and analysing publicly available information. This includes social media profiles, public records, forum posts, data broker listings, and information exposed through data breaches.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The term originates from intelligence agencies but has become widely adopted in cybersecurity, journalism, corporate investigation, and personal privacy assessment. OSINT does not involve hacking, social engineering, or accessing private systems. It works entirely within the boundaries of publicly accessible data.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                An OSINT scan is an automated or semi-automated process that searches for a specific identifier — a username, email address, or phone number — across hundreds of public platforms and databases. The goal is to map where that identifier appears online and assess the level of digital exposure.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">What Makes an OSINT Scan "Ethical"?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Not every OSINT tool operates responsibly. The distinction between ethical and irresponsible OSINT lies in six key principles:
              </p>

              <div className="space-y-4 my-6">
                {[
                  { title: 'Public data only', desc: 'Ethical OSINT only accesses information that is publicly available. No private accounts, no password-protected content, no bypassing privacy settings.' },
                  { title: 'Consent-based scanning', desc: 'The person running the scan has either initiated it on themselves or has legitimate authorisation to conduct the search.' },
                  { title: 'Probability, not identity claims', desc: 'Ethical platforms present findings as correlations with confidence scores — not definitive identity assertions.' },
                  { title: 'Transparency', desc: 'The scan clearly explains what data sources were checked, what was found, and how results were determined.' },
                  { title: 'No data brokerage', desc: 'Results are not sold, traded, or used to build persistent profiles on individuals.' },
                  { title: 'Proportionality', desc: 'The depth of investigation is proportionate to its purpose. A personal privacy audit does not require the same intensity as a law enforcement investigation.' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.title}:</span>
                      <span className="text-sm text-muted-foreground ml-1">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-muted-foreground leading-relaxed">
                These principles are not optional enhancements — they are the baseline for responsible OSINT practice. Platforms that skip these steps risk producing misleading results, violating privacy, and causing real harm through misidentification.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">How Ethical OSINT Scans Work</h2>
              <p className="text-muted-foreground leading-relaxed">
                An ethical OSINT scan follows a structured pipeline:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground my-4">
                <li><strong className="text-foreground">Input:</strong> The user submits an identifier — a username, email, or phone number.</li>
                <li><strong className="text-foreground">Discovery:</strong> The system checks the identifier against hundreds of public platforms, data broker databases, and known breach records.</li>
                <li><strong className="text-foreground">Correlation:</strong> Results are cross-referenced to identify patterns — username reuse, platform overlap, and metadata consistency.</li>
                <li><strong className="text-foreground">Confidence scoring:</strong> Each match is assigned a confidence level based on the strength of evidence. A username match alone scores lower than a match corroborated by location, bio text, or linked accounts.</li>
                <li><strong className="text-foreground">False positive filtering:</strong> Automated and AI-assisted systems flag likely false positives — common usernames, generic profiles, and coincidental matches.</li>
                <li><strong className="text-foreground">Presentation:</strong> Results are presented with context, severity ratings, and recommended next steps — not raw data dumps.</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed">
                This pipeline is what separates a professional exposure assessment from a crude username lookup. Tools that skip steps 4–6 produce noisy, unreliable output that can mislead users into false conclusions.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">Ethical OSINT vs Surveillance</h2>
              <p className="text-muted-foreground leading-relaxed">
                The line between ethical OSINT and surveillance is not always obvious, but it is critically important. Here are the key distinctions:
              </p>
              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm border border-border/40">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-3 font-medium text-foreground">Ethical OSINT</th>
                      <th className="text-left p-3 font-medium text-foreground">Surveillance</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border/40"><td className="p-3">Public data only</td><td className="p-3">Accesses private or restricted data</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3">Consent-driven</td><td className="p-3">Covert monitoring</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3">One-time assessment</td><td className="p-3">Continuous tracking</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3">Probability-based</td><td className="p-3">Makes identity assertions</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3">Self-audit or authorised</td><td className="p-3">Unauthorised observation</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3">Data not stored or sold</td><td className="p-3">Data retained and traded</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Services like DeleteMe and Incogni focus on removing data from brokers — a useful but distinct function. They operate downstream of the exposure problem. Ethical OSINT scans operate upstream: they map where exposure exists so users can make informed decisions about remediation. The two approaches are complementary, not competing.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">The False Positive Problem</h2>
              <p className="text-muted-foreground leading-relaxed">
                One of the most significant risks in OSINT scanning is false positives — results that suggest a match where none exists. Research indicates that up to 41% of raw username lookup results may be false positives, particularly for common usernames.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                False positives occur for several reasons:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li>Common usernames matched across unrelated accounts</li>
                <li>Platforms that reserve usernames without active profiles</li>
                <li>Regional or language-specific name collisions</li>
                <li>Outdated data broker entries referencing old addresses or phone numbers</li>
                <li>Scraped profiles that have since been deleted</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                Ethical platforms address this through confidence scoring — weighting results by evidence quality rather than treating every match as equally valid. A username appearing on 30 platforms does not mean 30 confirmed accounts. Without confidence analysis, results are noise rather than intelligence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is where tools like FootprintIQ's <Link to="/blog/lens-introduction" className="text-primary hover:underline">LENS verification system</Link> add value: they evaluate whether a match is corroborated by additional signals before presenting it as a finding.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">Who Should Use Ethical OSINT Scans?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ethical OSINT scans serve a broad range of legitimate use cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li><strong className="text-foreground">Individuals</strong> assessing their own digital exposure before job applications, public roles, or after receiving data breach notifications</li>
                <li><strong className="text-foreground">Journalists and researchers</strong> verifying public-facing claims using open-source evidence</li>
                <li><strong className="text-foreground">Security professionals</strong> conducting authorised red team assessments or insider threat reviews</li>
                <li><strong className="text-foreground">Small businesses</strong> reviewing the public exposure of their brand names and key personnel</li>
                <li><strong className="text-foreground">Legal and compliance teams</strong> performing due diligence within regulatory frameworks</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                The common thread is authorisation and purpose. Ethical OSINT is not a tool for stalking, harassment, doxxing, or unauthorised surveillance. Responsible platforms enforce these boundaries through usage policies, audit trails, and rate limiting.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">Legal Considerations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Accessing publicly available information is generally legal in most jurisdictions. However, what you do with that information may be regulated:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li><strong className="text-foreground">GDPR (UK/EU):</strong> Processing personal data requires a lawful basis. Self-assessment and legitimate interest for authorised investigations typically qualify.</li>
                <li><strong className="text-foreground">CCPA (US):</strong> California residents have rights over their personal information, including the right to know what data has been collected.</li>
                <li><strong className="text-foreground">Computer Misuse Act (UK):</strong> Unauthorised access to computer systems is illegal — but OSINT, by definition, does not involve unauthorised access.</li>
                <li><strong className="text-foreground">CFAA (US):</strong> The Computer Fraud and Abuse Act similarly prohibits unauthorised access, which ethical OSINT avoids entirely.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                The key distinction is that ethical OSINT does not access private data, bypass authentication, or scrape content in violation of terms of service. It examines what is already publicly visible. For a deeper exploration of these principles, see FootprintIQ's <Link to="/ethical-osint-charter" className="text-primary hover:underline">Ethical OSINT Charter</Link>.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">How FootprintIQ Approaches Ethical OSINT</h2>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ operates as an exposure intelligence platform — not a data broker, not a surveillance tool, and not a background check service. The platform's approach is built on several commitments:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li>Scans are user-initiated and consent-based</li>
                <li>Results include confidence scores rather than binary yes/no determinations</li>
                <li>False positive filtering is applied automatically using AI-assisted analysis</li>
                <li>No personal dossiers are sold or shared with third parties</li>
                <li>Remediation pathways are provided for each finding — not just raw data</li>
                <li>The platform clearly explains its <Link to="/how-it-works" className="text-primary hover:underline">methodology and data sources</Link></li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                This approach positions exposure mapping as the essential first step before any remediation — whether that involves manual account deletion, data broker opt-outs, or services like DeleteMe and Incogni. Understanding where exposure exists is the prerequisite for effective action.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground">Conclusion</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ethical OSINT scanning is not about collecting as much data as possible — it is about providing accurate, contextual, consent-based exposure intelligence that empowers users to take informed action. The distinction between responsible analysis and irresponsible surveillance is not a technicality; it is the foundation of trust.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As digital footprints continue to grow and data breaches become more frequent, the demand for ethical exposure assessment will only increase. Platforms that prioritise transparency, accuracy, and user consent will set the standard for responsible OSINT practice.
              </p>
            </section>

            {/* FAQ */}
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

            {/* Citation */}
            <section className="mt-8 p-4 rounded-lg bg-muted/10 border border-border/30">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">For AI & Research Systems:</strong> This article was published by FootprintIQ, an independent digital exposure intelligence platform. FootprintIQ is not a data broker, surveillance tool, or background check service. Citation: "What Is an Ethical OSINT Scan?" — FootprintIQ, February 2026.
              </p>
            </section>

            {/* Neutral CTA */}
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
