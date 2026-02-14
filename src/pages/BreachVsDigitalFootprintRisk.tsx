import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/breach-vs-digital-footprint-risk";

const webPageSchema = buildWebPageSchema({
  name: "Data Breach vs Digital Footprint Risk: What's the Difference? | FootprintIQ",
  description:
    "Understand the difference between data breach risk and digital footprint risk. Learn why both matter, how they overlap, and when you need breach checking and exposure mapping together.",
  url: PAGE_URL,
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
});

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between a data breach and a digital footprint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A data breach is a specific security incident where protected data is exposed without authorisation — typically through a hack, misconfiguration, or insider threat. A digital footprint is the sum of all publicly discoverable information about you across the internet, including social media profiles, forum posts, data broker listings, and search engine results. Breaches are events; your digital footprint is an ongoing state.",
      },
    },
    {
      "@type": "Question",
      name: "Can I have digital footprint risk without being in a breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Digital footprint risk exists independently of breaches. Public profiles, username reuse across platforms, data broker listings, indexed forum posts, and publicly visible personal information all create exposure — none of which requires a breach to exist. Many people have significant digital footprint risk without ever appearing in a breach database.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need both a breach checker and a footprint scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — they address different dimensions of risk. Breach checkers like Have I Been Pwned tell you what was leaked in past incidents. Footprint intelligence platforms like FootprintIQ show you what's publicly visible right now. Together, they provide a complete picture of your digital exposure.",
      },
    },
    {
      "@type": "Question",
      name: "Does FootprintIQ check for data breaches?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FootprintIQ incorporates breach signals as one data point in its analysis, but it is not a breach checker. Its primary focus is mapping your full public digital exposure — including username reuse, data broker presence, public profiles, and search engine indexing. It operates as an ethical digital footprint intelligence platform under a published Ethical OSINT Charter.",
      },
    },
    {
      "@type": "Question",
      name: "Which is more dangerous — breach exposure or footprint exposure?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both carry significant risk, but they create different threats. Breach exposure gives attackers specific credentials and personal data. Footprint exposure gives them context — the information needed for social engineering, identity correlation, and targeted attacks. The combination of both is particularly dangerous, which is why addressing only one leaves you partially exposed.",
      },
    },
    {
      "@type": "Question",
      name: "How does FootprintIQ help after a breach?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After securing compromised credentials, FootprintIQ maps your broader digital exposure — the public-facing data that exists independently of the breach. It identifies username reuse patterns, data broker listings, public profiles, and search engine indexing, then provides a prioritised remediation roadmap. This turns breach response from a reactive password change into a proactive privacy strategy.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Breach vs Digital Footprint Risk", item: PAGE_URL },
  ],
};

const comparisonRows = [
  { dimension: "Nature", breach: "Specific security incident", footprint: "Ongoing public presence" },
  { dimension: "Timing", breach: "Point-in-time event", footprint: "Continuous and evolving" },
  { dimension: "Data Type", breach: "Credentials, PII, financial data", footprint: "Public profiles, usernames, indexed content" },
  { dimension: "Source", breach: "Compromised databases", footprint: "Social platforms, brokers, search engines" },
  { dimension: "Detection", breach: "Breach notification services (HIBP)", footprint: "Footprint intelligence platforms (FootprintIQ)" },
  { dimension: "User Control", breach: "None — breach already happened", footprint: "High — can remove, deactivate, opt out" },
  { dimension: "Remediation", breach: "Change passwords, enable 2FA", footprint: "Delete accounts, opt out of brokers, reduce visibility" },
  { dimension: "Risk Type", breach: "Credential stuffing, account takeover", footprint: "Social engineering, identity correlation, doxxing" },
  { dimension: "Recurrence", breach: "New breaches add new exposure", footprint: "Grows passively as you use the internet" },
];

const BreachVsDigitalFootprintRisk = () => {
  return (
    <>
      <Helmet>
        <title>Data Breach vs Digital Footprint Risk: What's the Difference? | FootprintIQ</title>
        <meta
          name="description"
          content="Understand the difference between data breach risk and digital footprint risk. Learn why both matter, how they overlap, and when you need breach checking and exposure mapping together."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="Data Breach vs Digital Footprint Risk: What's the Difference? | FootprintIQ" />
        <meta property="og:description" content="Breach risk and footprint risk are related but not the same. Here's what separates them — and why you need to address both." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Breach vs Digital Footprint Risk</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Understanding Digital Risk</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Data Breach vs Digital Footprint Risk:{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                What's the Difference?
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              They're related. They overlap. But they're not the same — and addressing only one leaves you exposed to the other.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Map Your Exposure Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── What Is Breach Risk ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is Data Breach Risk?</h2>
            <p>
              A data breach occurs when protected information is accessed, stolen, or exposed without authorisation. This can happen through hacking, misconfigured databases, insider threats, phishing attacks, or ransomware. When a service you've used suffers a breach, your data — which may include email addresses, passwords, phone numbers, physical addresses, or financial details — becomes available to unauthorised parties.
            </p>
            <p>
              Breach risk is <strong>retrospective and event-driven</strong>. It represents what has already been exposed through specific security incidents. Services like Have I Been Pwned catalogue these incidents, allowing you to check whether your email address appears in known breach datasets. Mozilla Monitor offers similar functionality.
            </p>
            <p>
              The consequences of breach exposure are well-documented: credential stuffing attacks (where leaked passwords are tested against other services), account takeover, identity theft, and targeted phishing. If the breached data includes passwords and you've reused them elsewhere, the blast radius extends far beyond the original compromised service.
            </p>
            <p>
              Breach risk is serious, but it has a critical limitation: it only tells you about <em>past events</em>. It doesn't tell you what's publicly discoverable about you <em>right now</em>.
            </p>
          </div>
        </section>

        {/* ── What Is Digital Footprint Risk ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">What Is Digital Footprint Risk?</h2>
            <p>
              Your digital footprint is the sum of all publicly discoverable information about you across the internet. This includes social media profiles (both active and forgotten), forum posts, blog comments, data broker listings, public records, search engine results, and any other content that can be found through publicly accessible sources.
            </p>
            <p>
              Unlike breach risk, digital footprint risk is <strong>continuous and cumulative</strong>. It doesn't require a security incident to exist. Every account you create, every post you publish, every platform that indexes your information adds to your footprint. Over time, this creates a detailed, aggregated picture of your identity that anyone with basic research skills can access.
            </p>
            <p>
              The threats from digital footprint exposure are different from breach threats. They include:
            </p>
            <ul>
              <li><strong>Social engineering:</strong> Publicly visible personal details give attackers the context they need for convincing phishing attacks, pretexting calls, or impersonation.</li>
              <li><strong>Identity correlation:</strong> Username reuse across platforms allows anyone to link accounts together, building a comprehensive profile from fragments. <Link to="/how-it-works" className="text-accent hover:underline">FootprintIQ detects these patterns automatically</Link>.</li>
              <li><strong>Doxxing and harassment:</strong> Aggregated public data — real name, location, workplace, social accounts — can be weaponised by malicious actors.</li>
              <li><strong>Reputational risk:</strong> Old posts, forgotten profiles, and cached content can surface in employer background checks, tenant screening, or professional vetting.</li>
              <li><strong>Data broker exploitation:</strong> People-search sites aggregate your public information into searchable profiles, often including phone numbers, addresses, and family connections.</li>
            </ul>
            <p>
              Digital footprint risk exists whether or not you've ever been in a data breach. Many people with no breach history have extensive public exposure through social media, forum activity, and data broker aggregation.
            </p>
          </div>
        </section>

        {/* ── Overlap But Not Equivalence ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Related but Not Equivalent</h2>
            <p>
              Breach risk and digital footprint risk are related — they both involve personal data exposure — but they operate on fundamentally different axes. Understanding this distinction is essential for building a complete privacy strategy.
            </p>
            <p>
              <strong>A breach is an event.</strong> It happens at a specific point in time, involves a specific dataset, and exposes specific information. Once the breach occurs, the data is out. You can change passwords and enable 2FA, but you can't un-leak the data.
            </p>
            <p>
              <strong>A digital footprint is a state.</strong> It exists continuously, evolves over time, and reflects the current reality of your public presence. Unlike breach data, much of your footprint is within your control — you can delete accounts, opt out of data brokers, adjust privacy settings, and reduce your visibility.
            </p>
            <p>
              The overlap occurs when breach data feeds into your digital footprint. Leaked information may appear on paste sites, get indexed by search engines, or be incorporated into data broker profiles. In these cases, breach exposure becomes part of your ongoing footprint risk. This is one reason why a <Link to="/data-breach-cleanup-checklist" className="text-accent hover:underline">structured breach cleanup</Link> should include footprint mapping as a final step.
            </p>
            <p>
              Conversely, your digital footprint can increase breach risk. If your username, email, and personal details are widely visible, social engineers can use that information to bypass security questions, craft targeted phishing, or gain access to accounts through customer support manipulation.
            </p>
            <p>
              This bidirectional relationship means that addressing only one type of risk leaves you partially exposed. A complete digital risk assessment must cover both — which is why <strong>FootprintIQ – Ethical Digital Footprint Intelligence Platform</strong> incorporates breach signals alongside public exposure mapping, providing a unified view of your digital risk.
            </p>
          </div>
        </section>

        {/* ── Comparison Table ── */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Breach Risk{" "}
                <span className="text-muted-foreground font-normal">vs</span>{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">Footprint Risk</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                A side-by-side comparison across nine key dimensions.
              </p>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
              <div className="grid grid-cols-3 bg-muted/40 border-b border-border/50">
                <div className="p-4 text-sm font-semibold text-muted-foreground">Dimension</div>
                <div className="p-4 text-sm font-semibold text-center">Data Breach Risk</div>
                <div className="p-4 text-sm font-semibold text-center text-accent">Digital Footprint Risk</div>
              </div>
              {comparisonRows.map((row, i) => (
                <div
                  key={row.dimension}
                  className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="p-4 text-sm font-medium">{row.dimension}</div>
                  <div className="p-4 text-sm text-muted-foreground text-center">{row.breach}</div>
                  <div className="p-4 text-sm text-center font-medium">{row.footprint}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── When You Need Both ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">When You Need Both</h2>
            <p>
              The short answer: always. But certain situations make the combination especially critical:
            </p>
            <ul>
              <li><strong>After a breach notification:</strong> You've just learned your data was exposed. Changing passwords is step one. But understanding what else is publicly findable — and how breach data could be combined with your existing footprint — requires exposure mapping. Start with a <Link to="/after-have-i-been-pwned-what-next" className="text-accent hover:underline">post-breach action plan</Link>.</li>
              <li><strong>Before a career change:</strong> Employers routinely check candidates' online presence. Understanding what's publicly visible — old social media posts, forgotten forum accounts, data broker listings with your home address — is essential before entering the job market.</li>
              <li><strong>After a public-facing incident:</strong> If you've been involved in a news story, viral social media post, or public controversy, both your breach history and your existing footprint become potential attack surfaces for harassment or doxxing.</li>
              <li><strong>For ongoing privacy management:</strong> Digital risk isn't a one-time assessment. Both breach exposure and footprint visibility change over time. Regular monitoring ensures new risks are caught early. FootprintIQ's <Link to="/pricing" className="text-accent hover:underline">Pro plans</Link> include trend tracking and ongoing monitoring.</li>
              <li><strong>For professional OSINT work:</strong> If you conduct investigations, threat analysis, or risk assessments, understanding the distinction between breach data and footprint data is fundamental to accurate intelligence. FootprintIQ operates under a strict <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link>.</li>
            </ul>
            <p>
              The most effective approach combines breach awareness (Have I Been Pwned, Mozilla Monitor) with footprint intelligence (FootprintIQ). Breach checkers tell you what was leaked. FootprintIQ tells you what's findable — and gives you a prioritised plan to reduce that exposure.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">
                      {faq.name}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                    {faq.acceptedAnswer.text}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Understand Both Sides of Your Digital Risk
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Breach checking is essential. Footprint intelligence completes the picture. See what's publicly visible — and get a plan to reduce it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Ethical Footprint Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/pricing">View Pro Intelligence</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Footer Reinforcement Block ── */}
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto">
            <AboutFootprintIQBlock />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default BreachVsDigitalFootprintRisk;