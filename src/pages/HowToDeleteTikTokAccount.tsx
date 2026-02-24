import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  ChevronRight,
  Video,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  Clock,
  Globe,
  UserX,
} from "lucide-react";

const BASE = "https://footprintiq.app";
const PAGE_URL = `${BASE}/how-to-delete-tiktok-account`;

const faqs = [
  {
    question: "How do I permanently delete my TikTok account?",
    answer: "Open TikTok → Profile → Menu (☰) → Settings and Privacy → Manage Account → Delete Account. Confirm your identity via phone/email verification. Your account enters a 30-day deactivation period before permanent deletion.",
  },
  {
    question: "What happens to my TikTok videos after I delete my account?",
    answer: "All videos, drafts, comments, likes, and followers are permanently removed after the 30-day deactivation period. However, videos that were downloaded by other users (if downloads were enabled), duetted, stitched, or screen-recorded will remain on those users' devices and accounts.",
  },
  {
    question: "Can I recover my TikTok account after deletion?",
    answer: "You can recover your account within 30 days by logging back in. After 30 days, the deletion is permanent. TikTok does not restore deleted accounts. Your username may become available for others to claim.",
  },
  {
    question: "Does deleting TikTok remove my data from ByteDance?",
    answer: "Deleting your TikTok account removes your public content and profile. However, ByteDance may retain anonymised analytics data, legal compliance records, and data required for ongoing legal proceedings. For EU users, you can submit a GDPR Data Erasure Request for more comprehensive data removal.",
  },
  {
    question: "How do I delete TikTok for a child under 13?",
    answer: "If a child under 13 created a TikTok account, you can report it through TikTok's in-app reporting or submit a request via the TikTok Privacy Portal. TikTok is required by COPPA to delete accounts belonging to children under 13 upon verified parental request.",
  },
  {
    question: "Will deleting TikTok affect my other apps?",
    answer: "If you used 'Sign in with TikTok' for other services, those connections will break. Before deleting, check your connected apps and migrate any important accounts to email-based authentication. TikTok Login integrations are less common than Google or Facebook sign-ins, but they're growing.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Delete Your TikTok Account Permanently (2026 Guide)",
  description: "Complete step-by-step guide to permanently deleting your TikTok account, downloading your data, and cleaning up your digital footprint.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-24",
  dateModified: "2026-02-24",
  mainEntityOfPage: PAGE_URL,
  keywords: "delete tiktok account, remove tiktok, deactivate tiktok, tiktok account deletion, how to delete tiktok permanently, close tiktok account, tiktok privacy",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: BASE },
    { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
    { "@type": "ListItem", position: 3, name: "Delete TikTok Account", item: PAGE_URL },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Delete Your TikTok Account",
  description: "Step-by-step instructions for permanently deleting a TikTok account and cleaning up your digital footprint.",
  totalTime: "PT10M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Download your data", text: "Go to Settings → Manage Account → Download Your Data. Request a complete copy." },
    { "@type": "HowToStep", position: 2, name: "Review privacy settings", text: "Set your account to private and disable downloads on existing videos to limit further distribution." },
    { "@type": "HowToStep", position: 3, name: "Navigate to account deletion", text: "Open Settings and Privacy → Manage Account → Delete Account." },
    { "@type": "HowToStep", position: 4, name: "Verify your identity", text: "Complete phone or email verification to confirm the deletion." },
    { "@type": "HowToStep", position: 5, name: "Audit remaining exposure", text: "Run a FootprintIQ scan to find cached content, username traces, and linked accounts still visible online." },
  ],
};

const HowToDeleteTikTokAccount = () => {
  const webPageSchema = buildWebPageSchema({
    name: "How to Delete Your TikTok Account Permanently (2026)",
    description: "Complete guide to permanently deleting your TikTok account, downloading your data, and managing residual digital footprint.",
    url: PAGE_URL,
    dateModified: "2026-02-24",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>How to Delete Your TikTok Account Permanently (2026 Guide)</title>
        <meta name="description" content="Complete step-by-step guide to permanently deleting your TikTok account. Covers data download, privacy considerations, child account removal, and post-deletion digital footprint cleanup." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Delete Your TikTok Account Permanently" />
        <meta property="og:description" content="Step-by-step TikTok account deletion guide covering data backup, privacy controls, and post-deletion exposure audit." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />

      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <nav className="max-w-4xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li><Link to="/guides" className="hover:text-foreground transition-colors">Guides</Link></li>
            <li><ChevronRight className="w-3 h-3" /></li>
            <li className="text-foreground font-medium">Delete TikTok Account</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="py-16 md:py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Video className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Account Deletion Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to Delete Your TikTok Account Permanently
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              A complete 2026 guide to permanently removing your TikTok account — covering data download, privacy considerations, child account safety, and post-deletion digital footprint cleanup.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Check Your TikTok Exposure <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/delete-social-media-accounts">
                <Button size="lg" variant="outline" className="gap-2">
                  All Platform Guides <Trash2 className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="px-6 pb-16">
          <div className="max-w-4xl mx-auto space-y-12">

            {/* Why Delete */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Why People Delete TikTok</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  TikTok has faced increasing scrutiny over its data collection practices. The app collects device identifiers, location data, browsing history, keystroke patterns, biometric data (faceprints and voiceprints), and behavioural analytics. For many users, this level of data collection far exceeds what they're comfortable sharing with any single platform.
                </p>
                <p>
                  Beyond privacy, common reasons for deletion include government bans and restrictions in several countries, employer policies prohibiting the app on work devices, concerns about algorithmic influence and screen time, removing embarrassing or outdated video content, and reducing exposure to data broker scraping. TikTok profiles and usernames are actively scraped by people-search aggregators.
                </p>
                <p>
                  A 2025 study found that TikTok usernames appear on an average of 3.7 data broker sites within 6 months of account creation — even for accounts that never posted publicly. Understanding this exposure landscape is essential before and after deletion.
                </p>
              </div>
            </section>

            {/* Data TikTok Collects */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">What Data Does TikTok Collect?</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Before deleting, it's important to understand the scope of data TikTok holds. According to their privacy policy and independent security analyses, TikTok collects:
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  {[
                    { icon: Globe, title: "Device & Network Data", desc: "IP address, device model, operating system, mobile carrier, time zone, keystroke patterns, Wi-Fi SSID" },
                    { icon: Video, title: "Content & Interaction", desc: "Videos created and watched, comments, likes, shares, search queries, watch time per video" },
                    { icon: UserX, title: "Biometric Data", desc: "Faceprints, voiceprints (used for filters/effects), age estimation from facial analysis" },
                    { icon: Globe, title: "Location Data", desc: "Approximate location from IP, SIM card region, precise GPS if permission granted" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-border/50 bg-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p>
                  This is why simply uninstalling the app isn't enough — your data remains on ByteDance's servers until you formally delete your account through the in-app process.
                </p>
              </div>
            </section>

            {/* Before You Delete */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Before You Delete: Essential Preparation</h2>
              <div className="text-muted-foreground leading-relaxed space-y-6 text-[16px]">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <Download className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">1. Download Your Data</h3>
                    <p>
                      Go to <strong>Settings → Manage Account → Download Your Data</strong>. Select all data categories and request the download. TikTok will prepare a file (usually ready within 3 days) containing your videos, profile info, activity history, and direct messages.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2. Set Videos to Private</h3>
                    <p>
                      Before deletion, switch your account to <strong>Private</strong> and disable <strong>Allow Downloads</strong> on all videos. This prevents further scraping or downloading of your content during the 30-day deactivation window.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3. Unlink Connected Services</h3>
                    <p>
                      Check <strong>Settings → Manage Account</strong> for linked accounts (Google, Facebook, Apple, Twitter). Ensure you have alternative login methods for any apps using TikTok authentication. Also disconnect any TikTok Business accounts from ad platforms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Deletion Steps */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Step-by-Step: Permanently Delete TikTok</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <ol className="space-y-4 list-decimal list-inside">
                  <li><strong className="text-foreground">Open TikTok</strong> and tap your <strong>Profile</strong> icon</li>
                  <li><strong className="text-foreground">Tap the menu</strong> (☰) in the top right corner</li>
                  <li><strong className="text-foreground">Go to Settings and Privacy</strong> → <strong>Manage Account</strong></li>
                  <li><strong className="text-foreground">Tap "Delete Account"</strong> at the bottom of the page</li>
                  <li><strong className="text-foreground">Review the information</strong> about what will be deleted</li>
                  <li><strong className="text-foreground">Verify your identity</strong> via SMS code or email verification</li>
                  <li><strong className="text-foreground">Confirm deletion</strong> — your account enters the 30-day deactivation period</li>
                </ol>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong className="text-foreground">30-day recovery window:</strong> TikTok deactivates your account immediately (hidden from other users) but waits 30 days before permanent deletion. Log in during this window to cancel. After 30 days, all data is permanently removed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Child Accounts */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Deleting TikTok Accounts for Children</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground mb-1">COPPA Compliance</p>
                      <p className="text-sm">
                        TikTok requires users to be at least 13 years old. If a child under 13 has created an account, parents can report it directly through TikTok's in-app reporting or via the <strong>TikTok Privacy Portal</strong>. TikTok is legally required to delete under-13 accounts upon verified parental request under COPPA (Children's Online Privacy Protection Act).
                      </p>
                    </div>
                  </div>
                </div>
                <p>
                  For teens aged 13-17, TikTok offers Family Pairing features that give parents control over privacy settings, screen time, and content filters. However, only the account holder can initiate deletion. Parents should discuss digital footprint awareness with teens and consider running a <Link to="/scan" className="text-primary hover:underline">username scan</Link> to understand their child's online exposure.
                </p>
              </div>
            </section>

            {/* After Deletion */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">After Deletion: Clean Up Residual Exposure</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Even after permanent deletion, traces of your TikTok presence may persist across the internet:
                </p>
                <ul className="space-y-2">
                  <li>• <strong className="text-foreground">Search engine caches</strong> — Google and Bing may show cached versions of your TikTok profile for weeks</li>
                  <li>• <strong className="text-foreground">Data broker listings</strong> — Aggregators scrape TikTok usernames and link them to other profiles</li>
                  <li>• <strong className="text-foreground">Downloaded/duetted content</strong> — Videos others saved or stitched will remain on their accounts</li>
                  <li>• <strong className="text-foreground">Cross-platform username correlation</strong> — If you used the same username on TikTok and other platforms, that link persists in OSINT databases</li>
                </ul>
                <p>
                  A post-deletion <Link to="/scan" className="text-primary hover:underline">FootprintIQ scan</Link> reveals exactly where your TikTok-linked data still appears, so you can prioritise cleanup effectively. This is especially important if you used the same username across multiple platforms — a pattern that <Link to="/username-reuse-risk" className="text-primary hover:underline">creates significant exposure risk</Link>.
                </p>
              </div>
            </section>

            {/* CTA */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-lg font-semibold mb-2">Deleted TikTok? Check what's still visible.</p>
              <p className="text-sm text-muted-foreground mb-4">
                FootprintIQ scans hundreds of public platforms to find cached profiles, username traces, and data broker listings tied to your TikTok presence.
              </p>
              <Button asChild size="lg">
                <Link to="/scan">
                  Run Your Free Scan <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* FAQ */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="group bg-card border border-border/50 hover:border-accent/40 rounded-2xl px-8 shadow-sm transition-all duration-200"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5">
                      <span className="font-bold text-lg group-hover:text-accent transition-colors">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <AboutFootprintIQBlock />

            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ is an independent, ethical digital footprint intelligence platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment and authorised research only.
              </p>
            </aside>

            <RelatedToolsGrid currentPath="/how-to-delete-tiktok-account" />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default HowToDeleteTikTokAccount;
