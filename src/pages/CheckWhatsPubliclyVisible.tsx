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
  Eye,
  Globe,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PAGE_URL = "https://footprintiq.app/how-to-check-whats-publicly-visible-about-you";

const webPageSchema = buildWebPageSchema({
  name: "How to Check What's Publicly Visible About You (2026) | FootprintIQ",
  description:
    "A plain-language guide to finding out what personal information is publicly visible online — from Google results to social media, data brokers, and breach databases.",
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
      name: "What information about me is publicly visible online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Publicly visible information can include your name, email addresses, phone numbers, home address, social media profiles, forum posts, photos, employment history, and data broker listings. The exact extent depends on your online activity, privacy settings, and whether your details appear in public records or breach databases.",
      },
    },
    {
      "@type": "Question",
      name: "How do I Google myself properly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Search your full name in quotes, then repeat with your email address, phone number, and common usernames. Use an incognito/private browser window to avoid personalised results. Check at least the first three pages of results. Try variations of your name and include your city or employer to find location-specific results.",
      },
    },
    {
      "@type": "Question",
      name: "Is it safe to search for myself online?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — searching for your own publicly available information is completely safe and legal. It's the digital equivalent of checking what's visible through your front window. Understanding your public exposure is the first step toward managing it. Tools like FootprintIQ automate this process ethically.",
      },
    },
    {
      "@type": "Question",
      name: "Can I remove information that appears in search results?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on the source. You can adjust privacy settings on social media, request removal from data brokers, and ask Google to de-index specific URLs. However, removing a search result doesn't delete the source data — you need to address both. Under GDPR, you may have a legal right to request erasure from the data controller.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I check what's visible about me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "At minimum, every three months. After a data breach, job change, or major life event, check immediately. For ongoing awareness, continuous monitoring tools automate this process and alert you when new information becomes publicly visible.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between Googling myself and using a footprint scanner?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Googling yourself only shows what search engines have indexed — a fraction of your public exposure. A digital footprint scanner checks hundreds of platforms, data brokers, breach databases, and public records simultaneously. It also identifies username reuse patterns and connections between your identifiers that a manual search would miss.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Check What's Publicly Visible", item: PAGE_URL },
  ],
};

const CheckWhatsPubliclyVisible = () => {
  return (
    <>
      <Helmet>
        <title>How to Check What's Publicly Visible About You (2026) | FootprintIQ</title>
        <meta name="description" content="Find out what personal information is publicly visible about you online. Step-by-step guide covering Google, social media, data brokers, and breach databases." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Check What's Publicly Visible About You" />
        <meta property="og:description" content="Step-by-step guide to discovering your public digital exposure." />
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
            <li className="text-foreground font-medium">Check What's Publicly Visible</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <Eye className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Privacy Guide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              How to Check What's Publicly{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">Visible About You</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              You'd be surprised how much personal information is available to anyone with a search engine. Here's how to find out exactly what's out there — and what to do about it.
            </p>
            <Button asChild size="lg" className="text-base px-8 py-6">
              <Link to="/run-scan">Run a Free Exposure Scan <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
        </section>

        {/* Plain-language intro */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h2 className="text-3xl font-bold mb-4">Why This Matters</h2>
            <p>
              Every time you create an account, post on social media, or fill out a form online, you leave traces. Over time, these traces add up into a detailed picture of who you are — your name, email, phone number, where you live, where you work, and what you're interested in.
            </p>
            <p>
              Most of this information is publicly accessible. Data brokers collect it. Search engines index it. Old accounts you forgot about still display it. And anyone — employers, scammers, curious strangers — can find it with a few clicks.
            </p>
            <p>
              Checking what's publicly visible about you isn't paranoia — it's basic digital hygiene. Think of it as looking through the window of your house to see what passers-by can see inside.
            </p>
          </div>
        </section>

        {/* Step-by-step */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Search className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Step-by-Step: Check Your Public Visibility</h2>
            </div>

            <div className="space-y-4">
              {[
                { step: "1", title: "Google yourself in incognito mode", desc: "Open a private browsing window (so results aren't personalised) and search your full name in quotes. Then search your email address, phone number, and common usernames. Check at least three pages of results for each." },
                { step: "2", title: "Check your social media privacy settings", desc: "Visit each social platform you use and review what's visible to non-connections. Pay attention to profile photos, bios, friend lists, tagged photos, and old posts. Many platforms change default settings over time." },
                { step: "3", title: "Search major data broker sites", desc: "Visit Spokeo, BeenVerified, Whitepages, and similar people-search sites. Search your name and see if a profile exists. These sites aggregate public records and often display your address, phone, and relatives." },
                { step: "4", title: "Check breach databases", desc: "Visit Have I Been Pwned (haveibeenpwned.com) and enter your email address to see if it's appeared in known data breaches. Note which services were breached and what data was exposed." },
                { step: "5", title: "Search for your usernames", desc: "If you reuse usernames across platforms, search each one. Username reuse creates connections between accounts that can be used to build a more complete profile of you." },
                { step: "6", title: "Run an automated scan", desc: "Manual searching covers the basics but misses a lot. A digital footprint scanner checks hundreds of platforms, brokers, and databases simultaneously — and identifies patterns you wouldn't spot manually." },
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
              <h2 className="text-3xl font-bold">Risks of Unmanaged Exposure</h2>
            </div>
            <p>Leaving your personal information publicly accessible creates real, practical risks:</p>
            <ul>
              <li><strong>Targeted phishing:</strong> Scammers use your publicly visible details — employer, interests, recent activity — to craft convincing phishing emails that appear personal.</li>
              <li><strong>Identity theft:</strong> Enough publicly available information (name, address, date of birth, email) can be combined to open accounts or file fraudulent documents in your name.</li>
              <li><strong>Social engineering:</strong> Attackers call your bank, phone provider, or employer and use your public information to pass security questions and gain access to your accounts.</li>
              <li><strong>Reputation damage:</strong> Old posts, forum comments, or tagged photos from years ago can surface in employer searches or background checks, creating impressions that don't reflect who you are today.</li>
              <li><strong>Stalking and harassment:</strong> Publicly listed addresses, workplaces, and daily patterns can be exploited by bad actors for physical-world harm.</li>
            </ul>
            <p>
              The goal isn't to disappear from the internet — it's to <strong>control what's visible</strong> and reduce unnecessary exposure.
            </p>
          </div>
        </section>

        {/* How FootprintIQ fits in */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">How FootprintIQ Helps</h2>
            </div>
            <p>
              FootprintIQ automates the entire process described above — and goes significantly deeper. Instead of manually searching Google, social media, and broker sites one by one, a single scan checks hundreds of platforms, data brokers, and breach databases simultaneously.
            </p>
            <p>
              Results are scored by confidence level and prioritised by risk, so you can focus on what actually matters rather than sifting through noise. The free tier provides a comprehensive snapshot. <Link to="/pricing" className="text-accent hover:underline">Pro</Link> adds continuous monitoring, trend tracking, and remediation guidance.
            </p>
            <p>
              FootprintIQ uses only publicly accessible data and operates under a published <Link to="/ethical-osint-charter" className="text-accent hover:underline">Ethical OSINT Charter</Link> — no private database access, no impersonation, no invasive techniques.
            </p>
          </div>
        </section>

        {/* Alternatives */}
        <section className="py-16 px-6 bg-gradient-to-b from-muted/30 to-background">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <div className="not-prose flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-accent" />
              <h2 className="text-3xl font-bold">Other Ways to Check Your Visibility</h2>
            </div>
            <p>FootprintIQ isn't the only option. Here are other approaches worth considering:</p>
            <ul>
              <li><strong>Have I Been Pwned</strong> — free, focused specifically on breach data for email addresses. Excellent for checking credential exposure but doesn't cover social media, brokers, or username reuse.</li>
              <li><strong>Google Alerts</strong> — set up alerts for your name and email to receive notifications when new content is indexed. Limited to what Google indexes and doesn't cover brokers or breaches.</li>
              <li><strong>Manual browser search</strong> — free and immediate, but time-consuming and limited to what you think to search for. Misses platforms and databases you don't know about.</li>
              <li><strong>Removal services</strong> (DeleteMe, Kanary, Optery) — focus on data broker removal rather than comprehensive exposure mapping. Useful as a complement to footprint scanning.</li>
            </ul>
            <p>
              The most effective approach combines multiple methods. Use FootprintIQ for broad exposure mapping, HIBP for breach-specific checks, and a removal service if data broker listings are a priority.
              See our <Link to="/best-digital-footprint-scanner" className="text-accent hover:underline">scanner comparison guide</Link> for a detailed breakdown.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See What's Visible About You</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">Run a free ethical footprint scan and find out exactly what's publicly accessible — in under a minute.</p>
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

export default CheckWhatsPubliclyVisible;
