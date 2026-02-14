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
  Search,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Eye,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/see-what-google-knows-about-you";

const webPageSchema = buildWebPageSchema({
  name: "See What Google Knows About You (2026 Guide) | FootprintIQ",
  description:
    "Find out what personal information Google has about you — from search history and location data to ad profiles and indexed pages. Step-by-step guide to checking and managing your Google data.",
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
      name: "What data does Google collect about me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google collects search history, browsing history (Chrome), location history (Maps/Android), YouTube watch history, voice recordings (Assistant), app usage data, device information, email content (Gmail for ad targeting), calendar data, contacts, photos, drive files, and ad interaction data. The exact extent depends on which Google services you use and your privacy settings.",
      },
    },
    {
      "@type": "Question",
      name: "How do I download all the data Google has about me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use Google Takeout (takeout.google.com) to request a complete export of your data across all Google services. You can select specific services or export everything. The export is delivered as a downloadable archive. Review it to understand the full scope of data Google holds — most people are surprised by the volume.",
      },
    },
    {
      "@type": "Question",
      name: "Can I delete my Google search history?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Go to myactivity.google.com and you can delete individual searches, delete by date range, or set up auto-delete to remove history older than 3, 18, or 36 months. Note that deleting search history removes it from your Google account but doesn't affect data that Google has already used for ad profiling or analytics.",
      },
    },
    {
      "@type": "Question",
      name: "Is Google data the same as my digital footprint?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No — Google data is one component of your digital footprint, but far from the whole picture. Your digital footprint also includes social media profiles, data broker listings, forum posts, breach-exposed credentials, and public records that have nothing to do with Google. A comprehensive footprint scan covers all these sources.",
      },
    },
    {
      "@type": "Question",
      name: "Can I remove personal information from Google search results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google offers a 'Results About You' tool that lets you request removal of search results containing your personal information (phone number, email, home address). However, this only removes the search result — the source page remains online. For complete removal, you need to contact the source website directly and then request Google de-indexing.",
      },
    },
    {
      "@type": "Question",
      name: "Does Google sell my personal data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Google states it does not sell personal data directly. However, it uses your data extensively for targeted advertising — its primary revenue source. Advertisers don't receive your personal data, but Google uses it to show you targeted ads. The practical distinction between selling data and selling access to people based on their data is a subject of ongoing debate.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "See What Google Knows About You", item: PAGE_URL },
  ],
};

const SeeWhatGoogleKnows = () => {
  return (
    <>
      <Helmet>
        <title>See What Google Knows About You (2026 Guide) | FootprintIQ</title>
        <meta name="description" content="Find out what personal information Google has collected about you and how to manage it. Step-by-step guide to reviewing your Google data, privacy settings, and search results." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="See What Google Knows About You (2026)" />
        <meta property="og:description" content="Step-by-step guide to checking what data Google has collected about you and how to manage it." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        <nav className="max-w-5xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">See What Google Knows About You</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Search className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              See What Google{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Knows About You</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Google likely knows more about you than any other company on the internet. Here's how to see exactly what data it has — and what you can do about it.
            </p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">See Your Full Digital Footprint <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Google's Data Collection — The Big Picture</h2>
            <p>
              If you use Google Search, Gmail, Chrome, Android, YouTube, Google Maps, or Google Assistant, the company has been collecting data about you for years. This includes what you search for, where you go, what you watch, what you buy, who you email, and what you say to your phone.
            </p>
            <p>
              Google uses this data primarily for targeted advertising — its core business model. But the sheer volume and detail of what's collected means your Google account contains one of the most comprehensive digital profiles of your life that exists anywhere.
            </p>
            <p>
              The good news: Google provides tools to see and manage this data. The bad news: most people don't know these tools exist, and the default settings favour data collection over privacy. This guide walks you through everything.
            </p>
          </div>
        </section>

        {/* Step-by-step */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Eye className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Step-by-Step: Check Your Google Data</h2>
            </div>

            <div className="space-y-4">
              {[
                { step: "1", title: "Review your Google Dashboard", desc: "Visit myaccount.google.com/dashboard to see a summary of data across all Google services — how many emails, contacts, photos, files, and more are stored in your account." },
                { step: "2", title: "Check your Activity Controls", desc: "Visit myaccount.google.com/activitycontrols to see what Google is actively tracking: Web & App Activity, Location History, YouTube History, and more. You can pause each category individually." },
                { step: "3", title: "Review your full activity history", desc: "Visit myactivity.google.com to see every search, website visit, YouTube video, and voice command Google has recorded. Use filters to browse by date and service. You can delete individual items or entire time ranges." },
                { step: "4", title: "Check your ad profile", desc: "Visit myadcenter.google.com to see what Google thinks it knows about you — your estimated age, interests, income bracket, and the topics used to target ads at you. You can remove individual topics." },
                { step: "5", title: "Review location history", desc: "Visit timeline.google.com to see everywhere Google has tracked your location (if enabled on your phone). This includes specific addresses, routes, and timestamps. You can delete location data and disable future tracking." },
                { step: "6", title: "Download your complete data archive", desc: "Visit takeout.google.com to export everything Google has. Select all services or choose specific ones. The archive can be surprisingly large — sometimes tens of gigabytes." },
                { step: "7", title: "Set up auto-delete", desc: "In Activity Controls, enable auto-delete for web activity, location, and YouTube history. Options are 3, 18, or 36 months. This prevents indefinite accumulation of historical data." },
                { step: "8", title: "Check 'Results About You'", desc: "Visit the Results About You tool (available in Google Search settings) to see and request removal of search results that contain your personal contact information." },
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
          </div>
        </section>

        {/* Risks */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <ShieldAlert className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Why Google Data Matters for Your Privacy</h2>
            </div>
            <p>Google's data collection creates specific risks:</p>
            <ul>
              <li><strong>Account compromise = everything exposed:</strong> If someone gains access to your Google account, they potentially access years of email, search history, location data, photos, and documents. Your Google account is the single highest-value target in your digital life.</li>
              <li><strong>Search results shape perception:</strong> What appears when someone Googles your name influences how employers, dates, landlords, and colleagues perceive you. Old or unflattering content can persist indefinitely in search results.</li>
              <li><strong>Location tracking reveals patterns:</strong> Years of location history reveal where you live, work, shop, worship, and socialise — detailed enough to infer relationships, health conditions, and political activities.</li>
              <li><strong>Ad profiles enable targeting:</strong> The detailed profile Google builds about your interests and demographics isn't just used for ads — it reveals what Google has inferred about your life, and this data has been subpoenaed in legal proceedings.</li>
            </ul>
            <p>Managing your Google data is an important step, but it's only one part of your broader digital exposure. Google data is what Google knows — your digital footprint is what <em>everyone</em> can find.</p>
          </div>
        </section>

        {/* FootprintIQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Beyond Google: Your Full Digital Footprint</h2>
            </div>
            <p>
              Managing your Google data is essential, but it only covers one company's view of you. Your digital footprint extends across hundreds of platforms, data brokers, breach databases, and public records that have nothing to do with Google.
            </p>
            <p>
              FootprintIQ scans your visibility across all these sources in a single pass — mapping social media profiles, data broker listings, username reuse patterns, and breach-exposed credentials alongside your Google-indexed presence.
            </p>
            <p>
              The result is a prioritised, confidence-scored picture of your complete public exposure — not just what Google knows, but what anyone with a search engine can find. Free scans provide a comprehensive snapshot. <Link to="/pricing" className="text-accent hover:underline">Pro</Link> adds continuous monitoring and remediation tracking.
            </p>
          </div>
        </section>

        {/* Alternatives */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Other Privacy Tools Worth Using</h2>
            </div>
            <ul>
              <li><strong>Google's own privacy tools</strong> — Dashboard, Activity Controls, Ad Center, and Takeout cover Google-specific data comprehensively. Use them all.</li>
              <li><strong>Have I Been Pwned</strong> — checks if your email appears in known breaches. Pair with Google's Security Checkup for complete credential hygiene.</li>
              <li><strong>Privacy-focused browsers</strong> — Firefox, Brave, and DuckDuckGo reduce ongoing data collection by limiting tracking. Consider switching from Chrome.</li>
              <li><strong>VPN services</strong> — prevent your ISP and network operators from tracking your browsing. Don't prevent Google from tracking activity within its own services.</li>
              <li><strong>Data broker removal services</strong> — DeleteMe, Optery, and Kanary automate opt-outs from people-search sites that may index your name and address.</li>
            </ul>
            <p>
              For a comprehensive approach, manage your Google data directly, scan your full digital footprint with FootprintIQ, and use specialised tools for specific cleanup tasks. See <Link to="/how-to-clean-up-your-digital-footprint" className="text-accent hover:underline">how to clean up your digital footprint</Link> for the complete process.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqSchema.mainEntity.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200">
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-bold text-lg group-hover:text-accent transition-colors">{faq.name}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{faq.acceptedAnswer.text}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See Beyond What Google Shows</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Google data is just one piece. Run a free scan to discover your complete digital footprint across hundreds of sources.</p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">Run Your Free Scan <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        <section className="py-12 px-6"><div className="max-w-3xl mx-auto"><AboutFootprintIQBlock /></div></section>
      </main>
      <Footer />
    </>
  );
};

export default SeeWhatGoogleKnows;
