import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Database,
  ClipboardList,
  AlertTriangle,
  Scale,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/how-to-remove-yourself-from-data-brokers";

const webPageSchema = buildWebPageSchema({
  name: "How to Remove Yourself from Data Brokers (2026 Guide) | FootprintIQ",
  description:
    "Step-by-step guide to removing your personal information from data brokers. Learn the manual opt-out process, common challenges, and how exposure mapping compares to removal services.",
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
      name: "What is a data broker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A data broker is a company that collects, aggregates, and sells personal information from public records, commercial sources, and online activity. They compile profiles that typically include names, addresses, phone numbers, email addresses, relatives, and sometimes financial or employment data — then make this information available through search tools or direct sales.",
      },
    },
    {
      "@type": "Question",
      name: "Is it legal for data brokers to have my information?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In most jurisdictions, yes. Data brokers primarily collect publicly available information — voter registrations, property records, court filings, and social media profiles. However, regulations like GDPR (UK/EU) and CCPA (California) give individuals the right to request deletion of their data from these companies.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take to be removed from a data broker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Processing times vary significantly. Some brokers process requests within 24–48 hours. Others take 30–45 days. A few require multiple follow-ups before completing removal. Under GDPR, companies must respond within 30 days. Under CCPA, the deadline is 45 days with a possible 45-day extension.",
      },
    },
    {
      "@type": "Question",
      name: "Will my data stay removed permanently?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Usually not. Data brokers continuously refresh their databases from public records and commercial sources. A successful removal today doesn't prevent re-listing weeks or months later from a different data source. This is why ongoing monitoring is essential — removal is one step in an ongoing process, not a permanent fix.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use a paid removal service or do it myself?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both approaches have trade-offs. Manual removal is free but time-consuming and requires ongoing effort. Paid removal services automate the process but typically cost £60–£200+ per year and focus narrowly on broker removals. An intelligence-first approach like FootprintIQ maps your full exposure first, so you can prioritise which removals actually matter — rather than blindly opting out of every broker.",
      },
    },
    {
      "@type": "Question",
      name: "How many data brokers have my information?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There are over 4,000 known data brokers globally. The average person's information appears on dozens of them. The exact number depends on factors like how long you've been online, whether you've owned property, voted, or used social media. Running a digital footprint scan can help identify which brokers and platforms currently list your information.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Privacy Resources", item: "https://footprintiq.app/privacy-centre" },
    { "@type": "ListItem", position: 3, name: "Remove Yourself from Data Brokers", item: PAGE_URL },
  ],
};

const HowToRemoveFromDataBrokers = () => {
  return (
    <>
      <Helmet>
        <title>How to Remove Yourself from Data Brokers (2026 Guide) | FootprintIQ</title>
        <meta
          name="description"
          content="Step-by-step guide to removing your personal information from data brokers. Learn the manual opt-out process, common challenges, and how exposure mapping compares to removal services."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Remove Yourself from Data Brokers (2026)" />
        <meta property="og:description" content="Manual opt-out steps, common pitfalls, and why exposure intelligence matters more than blind removal." />
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
            <li><Link to="/privacy-centre" className="hover:text-foreground transition-colors">Privacy Resources</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Remove Yourself from Data Brokers</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <ShieldAlert className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">2026 Privacy Guide</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How to Remove Yourself from{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Data Brokers
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Your personal information is listed on dozens of data broker sites. Here's how to take it back — step by step — and why removal alone isn't enough.
            </p>

            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">
                Find Where You're Listed
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ── Section 1: What Data Brokers Are ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">What Are Data Brokers?</h2>
            </div>
            <p>
              Data brokers are companies that collect, package, and sell personal information. They aggregate data from public records (voter rolls, property deeds, court filings), commercial sources (loyalty programmes, purchase histories), and online activity (social media profiles, forum posts, app usage data).
            </p>
            <p>
              The result is a detailed profile — often including your name, current and past addresses, phone numbers, email addresses, relatives, estimated income, and sometimes even political affiliations or health indicators. These profiles are then sold to marketers, employers, landlords, and anyone willing to pay a few dollars for a "people search."
            </p>
            <p>
              Well-known data brokers include Spokeo, BeenVerified, MyLife, Whitepages, Radaris, and PeopleFinder — but there are thousands more operating globally. Many people don't realise their information is listed until they search for themselves online.
            </p>
            <p>
              The existence of these profiles creates real risk: they enable targeted phishing, identity theft, stalking, and social engineering attacks. Even if you're not personally targeted, your exposure increases the attack surface available to bad actors.
            </p>
          </div>
        </section>

        {/* ── Section 2: Manual Opt-Out Process ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <ClipboardList className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">The Manual Opt-Out Process</h2>
            </div>
            <p>
              Every major data broker is required to offer an opt-out mechanism — though they don't make it easy to find. Here's the general process:
            </p>

            <div className="not-prose space-y-4 my-8">
              {[
                { step: "1", title: "Identify which brokers list you", desc: "Search your name, email, and phone number on major data broker sites. Or run a digital footprint scan to find listings automatically." },
                { step: "2", title: "Locate each broker's opt-out page", desc: "Each broker has a different opt-out process. Some have online forms; others require email requests. A few still require postal mail." },
                { step: "3", title: "Submit removal requests", desc: "Follow each broker's specific process. You'll typically need to verify your identity — often by providing the exact URL of your listing and confirming your email address." },
                { step: "4", title: "Verify identity if required", desc: "Some brokers require identity verification before processing removals. This may involve confirming details about yourself or uploading ID. Under GDPR, you can cite your right to erasure (Article 17)." },
                { step: "5", title: "Wait and follow up", desc: "Processing times range from 24 hours to 45 days. Track which requests you've submitted and follow up if removals aren't completed within the stated timeframe." },
                { step: "6", title: "Re-check periodically", desc: "Data brokers re-list information regularly. Check back every 3–6 months to ensure your data hasn't reappeared. This is the step most people skip — and the reason removal alone isn't a permanent solution." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start bg-card border border-border/50 rounded-xl p-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">{item.step}</span>
                  <div>
                    <h3 className="font-semibold text-base mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p>
              For specific broker opt-out instructions, see our dedicated guides:
              {" "}<Link to="/remove-spokeo-profile" className="text-accent hover:underline">Remove from Spokeo</Link>,
              {" "}<Link to="/remove-beenverified-profile" className="text-accent hover:underline">Remove from BeenVerified</Link>, and
              {" "}<Link to="/remove-mylife-profile" className="text-accent hover:underline">Remove from MyLife</Link>.
            </p>
          </div>
        </section>

        {/* ── Section 3: Challenges ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Why Doing It Alone Is Difficult</h2>
            </div>
            <p>
              Manual removal is free but far from simple. Here's why most people struggle — or give up:
            </p>
            <ul>
              <li><strong>Scale:</strong> With 4,000+ data brokers globally, identifying which ones list you is a project in itself. Even focused efforts typically require opt-outs to 30–80 individual sites.</li>
              <li><strong>Inconsistent processes:</strong> Every broker has a different opt-out flow. Some require web forms, others demand emails to specific addresses, and a few still require faxed or mailed requests. There's no standardised process.</li>
              <li><strong>Verification friction:</strong> Brokers often require you to provide personal information to "verify" you're the person requesting removal — creating an uncomfortable paradox where you must share data to delete data.</li>
              <li><strong>Re-listing:</strong> This is the biggest challenge. Data brokers continuously refresh their databases from public records and commercial partners. A successful removal today doesn't prevent re-listing next month from a different source. Removal is maintenance, not a one-time fix.</li>
              <li><strong>Time investment:</strong> Initial removal across major brokers takes 8–15 hours. Ongoing monitoring and re-removal adds several hours per quarter. Most people underestimate the sustained effort required.</li>
              <li><strong>No visibility into success:</strong> After submitting requests, it's difficult to verify whether data was actually removed without manually re-checking each site. Without monitoring, you're operating on faith.</li>
            </ul>
            <p>
              These challenges don't mean manual removal is pointless — it absolutely reduces your exposure. But going in with realistic expectations matters. Removal is one step in an <Link to="/best-way-to-monitor-your-online-exposure" className="text-accent hover:underline">ongoing monitoring strategy</Link>, not a finish line.
            </p>
          </div>
        </section>

        {/* ── Section 4: Removal Services vs Exposure Mapping ── */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Scale className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Removal Services vs Exposure Mapping</h2>
            </div>
            <p>
              Paid removal services like DeleteMe, Kanary, and Optery automate the opt-out process. You pay a subscription (typically £60–£200/year), and they submit removal requests on your behalf and re-check periodically.
            </p>
            <p>
              These services are genuinely useful if your primary concern is data broker listings. They save time and handle the re-checking that most people neglect. But they have a significant blind spot: <strong>they only address broker listings</strong>.
            </p>
            <p>
              Your digital exposure extends far beyond data brokers. Username reuse across platforms, social media visibility, forum posts, breach-exposed credentials, search engine indexing — these represent the majority of most people's digital footprint. A removal service that only targets brokers leaves most of your exposure untouched.
            </p>

            <h3 className="text-2xl font-semibold mt-8 mb-3">The Intelligence-First Approach</h3>
            <p>
              FootprintIQ takes a fundamentally different approach. Instead of starting with removal, it starts with <strong>mapping your complete exposure</strong> — across platforms, brokers, breach databases, and public sources. This gives you a prioritised view of what's visible, what matters, and what to act on first.
            </p>
            <p>
              The difference is strategic: rather than blindly opting out of every broker you can find, you understand your actual risk surface and focus effort where it has the most impact. Some broker listings may be low-risk and low-priority. Others may be urgent. Without mapping, you can't tell the difference.
            </p>
            <p>
              This doesn't mean removal services are useless — they're a valuable tool for the broker-specific portion of your exposure. But they work best as one component within a broader exposure management strategy, not as the entire strategy.
            </p>
            <p>
              See how FootprintIQ compares to removal-focused tools:
              {" "}<Link to="/deleteme-vs-footprintiq" className="text-accent hover:underline">DeleteMe vs FootprintIQ</Link>
              {" · "}<Link to="/kanary-vs-footprintiq" className="text-accent hover:underline">Kanary vs FootprintIQ</Link>
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
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
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See What's Exposed Before You Start Removing
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Run a free ethical footprint scan to map your exposure across platforms, brokers, and breach databases — then prioritise what to remove first.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base px-8 py-6">
                <Link to="/run-scan">
                  Run Your Free Scan
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/privacy-centre">Privacy Resources</Link>
              </Button>
            </div>
          </div>
        </section>

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

export default HowToRemoveFromDataBrokers;
