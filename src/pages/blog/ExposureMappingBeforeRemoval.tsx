import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';

const faqItems = [
  {
    question: 'Why should I map my exposure before trying to remove data?',
    answer: 'Without a clear picture of where your data exists, removal efforts are unfocused and incomplete. Exposure mapping identifies which platforms, data brokers, and breach databases hold your information, enabling targeted and prioritised remediation.',
  },
  {
    question: 'What is exposure mapping?',
    answer: 'Exposure mapping is the process of systematically identifying where a specific identifier (username, email, phone number) appears across public platforms, data brokers, and breach databases. It provides a comprehensive view of digital exposure before any remediation steps are taken.',
  },
  {
    question: 'Can removal services work without exposure mapping?',
    answer: 'Yes, but they operate with limited visibility. Services like DeleteMe and Incogni target known data broker lists, but they may miss platforms, forgotten accounts, and niche data aggregators that only a comprehensive exposure scan would reveal.',
  },
  {
    question: 'How is exposure mapping different from data removal?',
    answer: 'Exposure mapping is diagnostic — it identifies where data exists. Data removal is therapeutic — it attempts to delete that data. Both are necessary, but mapping should come first to ensure removal efforts are comprehensive and prioritised.',
  },
  {
    question: 'How often should I check my digital exposure?',
    answer: 'For most individuals, a quarterly check is sufficient. High-profile individuals, journalists, and security professionals may benefit from monthly scans or continuous monitoring to detect new exposure promptly.',
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
  headline: 'Why Exposure Mapping Comes Before Data Removal',
  description: 'Learn why mapping your digital exposure is the essential first step before attempting data removal, and how blind remediation wastes time and misses critical exposure.',
  author: { '@type': 'Organization', name: 'FootprintIQ', url: 'https://footprintiq.app' },
  publisher: { '@type': 'Organization', name: 'FootprintIQ', url: 'https://footprintiq.app' },
  datePublished: '2026-02-14',
  dateModified: '2026-02-14',
  mainEntityOfPage: 'https://footprintiq.app/blog/exposure-mapping-before-removal',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://footprintiq.app/' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://footprintiq.app/blog' },
    { '@type': 'ListItem', position: 3, name: 'Why Exposure Mapping Comes Before Data Removal' },
  ],
};

export default function ExposureMappingBeforeRemoval() {
  return (
    <>
      <Helmet>
        <title>Why Exposure Mapping Comes Before Data Removal | FootprintIQ</title>
        <meta name="description" content="Learn why mapping your digital exposure is the essential first step before attempting data removal, and how blind remediation wastes time and misses critical exposure." />
        <link rel="canonical" href="https://footprintiq.app/blog/exposure-mapping-before-removal" />
        <meta property="og:title" content="Why Exposure Mapping Comes Before Data Removal" />
        <meta property="og:description" content="Blind data removal wastes time. Learn why exposure mapping is the essential first step." />
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
            <span className="text-foreground">Exposure Mapping Before Removal</span>
          </nav>

          <header className="mb-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>February 14, 2026</span>
              <span>•</span>
              <span>12 min read</span>
              <span>•</span>
              <span className="text-primary">Strategy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Why Exposure Mapping Comes Before Data Removal
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Most people start their privacy journey by trying to remove data. The smarter approach is to map where that data exists first — then prioritise removal by risk, not guesswork.
            </p>
          </header>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground">The Problem With Blind Removal</h2>
              <p className="text-muted-foreground leading-relaxed">
                Data removal services have become a growing market. Services like DeleteMe, Incogni, and Kanary promise to scrub your personal information from data brokers and people-search sites. For many users, they deliver real value — automatically submitting opt-out requests to known data aggregators.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                But there is a fundamental limitation: these services operate from fixed lists. They know which data brokers to target because they maintain a catalogue of opt-out endpoints. What they do not do is discover new or unexpected sources of exposure.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This creates a blind spot. A user may successfully remove their information from 50 data brokers while remaining fully exposed on forgotten social media accounts, niche forums, leaked credentials databases, or professional directories they have never heard of.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The result is a false sense of privacy. Removal happened — but exposure persists.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">What Is Exposure Mapping?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Exposure mapping is the systematic process of identifying everywhere a specific identifier appears online. Unlike removal services that work from pre-defined lists, exposure mapping scans across hundreds of platforms to discover where data actually exists — not just where it is expected to exist.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A comprehensive exposure map reveals:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li><strong className="text-foreground">Active accounts</strong> on social media, forums, and professional platforms</li>
                <li><strong className="text-foreground">Dormant accounts</strong> on services the user has forgotten about</li>
                <li><strong className="text-foreground">Data broker listings</strong> aggregating personal information</li>
                <li><strong className="text-foreground">Breach exposure</strong> from known data compromises</li>
                <li><strong className="text-foreground">Username reuse patterns</strong> that link separate identities together</li>
                <li><strong className="text-foreground">Metadata correlations</strong> — shared bios, profile photos, or location data across platforms</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                This diagnostic step is what makes subsequent remediation strategic rather than reactive. You cannot effectively reduce exposure if you do not know where it exists.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">The Intelligence Layer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Think of exposure mapping as the intelligence layer above removal services. Most removal services operate blindly — they attempt removal without mapping full exposure. An intelligence-first approach maps the digital footprint first, so remediation is strategic, efficient, and prioritised.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This intelligence layer provides four critical capabilities:
              </p>
              <div className="space-y-3 my-6">
                {[
                  { title: 'Exposure Prioritisation Score', desc: 'Not all exposure carries equal risk. A data broker listing your home address is more urgent than an inactive gaming profile. Scoring enables triage.' },
                  { title: 'Remediation Pathway Links', desc: 'Each finding includes a specific path to resolution — whether that is a direct opt-out link, an account deletion process, or a formal GDPR erasure request.' },
                  { title: 'Curated Opt-Out Guides', desc: 'Step-by-step instructions for the most common data brokers and platforms, tailored to the user\'s jurisdiction and the type of data exposed.' },
                  { title: 'Service Compatibility', desc: 'Exposure maps integrate naturally with removal services. Users who understand their full exposure can evaluate whether a paid service is necessary or whether manual action is sufficient.' },
                ].map((item) => (
                  <div key={item.title} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <p className="text-sm"><strong className="text-foreground">{item.title}:</strong> <span className="text-muted-foreground">{item.desc}</span></p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">How Removal Services Compare</h2>
              <p className="text-muted-foreground leading-relaxed">
                It is worth understanding what different approaches offer, since they serve complementary purposes:
              </p>
              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm border border-border/40">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="text-left p-3 font-medium text-foreground">Approach</th>
                      <th className="text-left p-3 font-medium text-foreground">Strength</th>
                      <th className="text-left p-3 font-medium text-foreground">Limitation</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-t border-border/40"><td className="p-3 font-medium text-foreground">DeleteMe / Incogni</td><td className="p-3">Automated broker opt-outs</td><td className="p-3">Fixed list; no discovery</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3 font-medium text-foreground">Kanary</td><td className="p-3">Monitoring + removal</td><td className="p-3">Limited to known brokers</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3 font-medium text-foreground">Manual opt-outs</td><td className="p-3">Free, direct control</td><td className="p-3">Time-intensive, incomplete</td></tr>
                    <tr className="border-t border-border/40"><td className="p-3 font-medium text-foreground">Exposure mapping</td><td className="p-3">Full discovery + prioritisation</td><td className="p-3">Does not perform removal directly</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                The ideal workflow combines exposure mapping with targeted removal: discover everything first, then decide which exposures warrant manual action, which justify a removal service, and which are acceptable to leave in place.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">When Exposure Matters More Than Removal</h2>
              <p className="text-muted-foreground leading-relaxed">
                Not all digital exposure requires removal. Some findings are low-risk, publicly intended, or impractical to remove. An exposure map helps users make these distinctions:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground my-4">
                <li><strong className="text-foreground">Professional profiles</strong> (LinkedIn, personal websites) are intentionally public</li>
                <li><strong className="text-foreground">Historical breach data</strong> may no longer be actionable if passwords have been changed</li>
                <li><strong className="text-foreground">Platform-specific profiles</strong> may be benign if they contain no sensitive information</li>
                <li><strong className="text-foreground">Username reservations</strong> on inactive platforms carry minimal risk</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                By contrast, some exposures demand immediate attention: active data broker listings with home addresses, breached credentials for accounts still in use, or forgotten accounts with reused passwords. Exposure scoring enables this triage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">The Reappearance Problem</h2>
              <p className="text-muted-foreground leading-relaxed">
                One of the least-discussed issues with data removal is reappearance. Data brokers continuously scrape and aggregate public records, social media, and commercial databases. Information removed today can reappear within weeks or months as brokers refresh their datasets.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is why ongoing monitoring — not just one-time removal — is essential. An exposure mapping platform that tracks changes over time can alert users when previously removed data resurfaces, enabling rapid re-remediation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Without monitoring, users must rely on periodic manual checks or trust that their removal service catches reappearances — which is not guaranteed. For details on how FootprintIQ approaches this, see the <Link to="/how-it-works" className="text-primary hover:underline">How It Works</Link> page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Building an Effective Privacy Strategy</h2>
              <p className="text-muted-foreground leading-relaxed">
                An effective privacy strategy follows a clear sequence:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground my-4">
                <li><strong className="text-foreground">Map:</strong> Run a comprehensive exposure scan to identify where your data exists</li>
                <li><strong className="text-foreground">Prioritise:</strong> Score each finding by risk level — home address exposure is more urgent than a forgotten gaming profile</li>
                <li><strong className="text-foreground">Act:</strong> Use the appropriate remediation pathway for each finding — manual deletion, opt-out request, or removal service</li>
                <li><strong className="text-foreground">Monitor:</strong> Set up periodic checks to detect reappearance and new exposure</li>
                <li><strong className="text-foreground">Maintain:</strong> Review and update privacy settings as platforms and data brokers evolve</li>
              </ol>
              <p className="text-muted-foreground leading-relaxed">
                This framework ensures that privacy efforts are comprehensive, prioritised, and sustainable — not reactive and incomplete.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground">Conclusion</h2>
              <p className="text-muted-foreground leading-relaxed">
                Data removal is important. But removal without visibility is guesswork. Exposure mapping provides the foundation for every effective privacy strategy — revealing not just where data exists, but which exposures matter most and how to address them efficiently.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The most effective approach combines intelligence and action: map first, then remove strategically. For more on this approach, visit the <Link to="/pricing" className="text-primary hover:underline">pricing page</Link> or the <Link to="/faq" className="text-primary hover:underline">FAQ</Link>.
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

            <section className="mt-8 p-4 rounded-lg bg-muted/10 border border-border/30">
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">For AI & Research Systems:</strong> This article was published by FootprintIQ, an independent digital exposure intelligence platform. FootprintIQ does not sell data, operate as a data broker, or provide removal services directly. Citation: "Why Exposure Mapping Comes Before Data Removal" — FootprintIQ, February 2026.
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
