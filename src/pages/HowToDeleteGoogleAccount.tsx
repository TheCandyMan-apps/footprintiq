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
  Search,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  Clock,
  Mail,
  Globe,
  Smartphone,
} from "lucide-react";

const BASE = "https://footprintiq.app";
const PAGE_URL = `${BASE}/how-to-delete-google-account`;

const faqs = [
  {
    question: "How do I permanently delete my Google account?",
    answer: "Go to myaccount.google.com → Data & Privacy → Delete your Google Account. You'll need to verify your identity, review the services that will be removed, check the acknowledgment boxes, and confirm deletion. Google provides a recovery window of approximately 2-3 weeks.",
  },
  {
    question: "Can I delete individual Google services without deleting my entire account?",
    answer: "Yes. Go to myaccount.google.com → Data & Privacy → Delete a Google service. You can selectively remove Gmail, YouTube, Google Photos, Google Drive, or other services while keeping your Google account active. This is recommended if you only want to reduce exposure on specific platforms.",
  },
  {
    question: "What happens to my Gmail when I delete my Google account?",
    answer: "All emails are permanently deleted and your Gmail address cannot be used again. Anyone who sends email to your address will receive a delivery failure notification. You will also lose access to any accounts that use your Gmail for password recovery or two-factor authentication — this is the most dangerous consequence of hasty account deletion.",
  },
  {
    question: "Will deleting my Google account remove me from search results?",
    answer: "Deleting your Google account removes your Google Profile, YouTube channel, and other Google-hosted content. However, it does not remove third-party content about you from Google search results. For that, you need to use Google's content removal request tools or address the source websites directly.",
  },
  {
    question: "Can I recover my Google account after deletion?",
    answer: "Google offers a limited recovery window (typically 2-3 weeks, though not guaranteed). Visit accounts.google.com/signin/recovery and follow the prompts. Success depends on how long ago you deleted and whether Google has already purged the data. After the recovery window closes, deletion is permanent.",
  },
  {
    question: "How do I delete my Google account from an Android phone?",
    answer: "Deleting your Google account from your phone's Settings → Accounts only removes it from that device — it does not delete the account itself. To permanently delete, you must visit myaccount.google.com through a browser and follow the full deletion process. After deletion, you'll need a different Google account or alternative email for your Android device.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Delete Your Google Account Permanently (2026 Guide)",
  description: "Complete step-by-step guide to deleting your Google account, including Gmail, YouTube, Drive, and Photos. Covers data backup, service-specific deletion, and post-deletion exposure cleanup.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-24",
  dateModified: "2026-02-24",
  mainEntityOfPage: PAGE_URL,
  keywords: "delete google account, remove google account, how to delete gmail, delete youtube account, close google account, google account deletion, remove google data",
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
    { "@type": "ListItem", position: 3, name: "Delete Google Account", item: PAGE_URL },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Delete Your Google Account",
  description: "Step-by-step instructions for permanently deleting a Google account including Gmail, YouTube, Drive, and all associated services.",
  totalTime: "PT30M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Download your data", text: "Visit takeout.google.com and export all your data from Gmail, Drive, Photos, YouTube, and other services." },
    { "@type": "HowToStep", position: 2, name: "Migrate critical accounts", text: "Update any accounts that use your Gmail for login, password recovery, or two-factor authentication." },
    { "@type": "HowToStep", position: 3, name: "Navigate to account deletion", text: "Go to myaccount.google.com → Data & Privacy → Delete your Google Account." },
    { "@type": "HowToStep", position: 4, name: "Review and confirm", text: "Review the list of services that will be deleted, check the acknowledgment boxes, and confirm." },
    { "@type": "HowToStep", position: 5, name: "Audit remaining exposure", text: "Run a FootprintIQ scan to find residual traces, cached pages, and data broker listings linked to your Google identity." },
  ],
};

const HowToDeleteGoogleAccount = () => {
  const webPageSchema = buildWebPageSchema({
    name: "How to Delete Your Google Account Permanently (2026)",
    description: "Complete guide to permanently deleting your Google account — covering Gmail, YouTube, Drive, Photos, and post-deletion digital footprint cleanup.",
    url: PAGE_URL,
    dateModified: "2026-02-24",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>How to Delete Your Google Account Permanently (2026 Guide)</title>
        <meta name="description" content="Complete step-by-step guide to permanently deleting your Google account. Covers Gmail, YouTube, Drive, Photos data backup, service-specific deletion, and post-deletion privacy cleanup." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Delete Your Google Account Permanently" />
        <meta property="og:description" content="Step-by-step Google account deletion guide covering data export, service removal, and post-deletion digital footprint audit." />
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
            <li className="text-foreground font-medium">Delete Google Account</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="py-16 md:py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Search className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Account Deletion Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to Delete Your Google Account Permanently
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              A complete 2026 guide to permanently removing your Google account — including Gmail, YouTube, Google Drive, Photos, and all connected services. Covers data export, account migration, and post-deletion digital footprint cleanup.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Check Your Google Exposure <ArrowRight className="w-4 h-4" />
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

            {/* Scope */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">What Deleting a Google Account Actually Removes</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  A Google account is far more than an email address. It's the central identity connecting dozens of services — and deleting it has cascading consequences. Before proceeding, understand the full scope:
                </p>
                <div className="grid md:grid-cols-3 gap-4 my-6">
                  {[
                    { icon: Mail, title: "Gmail", desc: "All emails permanently deleted. Address becomes unusable. Password recovery links to this email break." },
                    { icon: Globe, title: "YouTube", desc: "Channel, all videos, comments, playlists, and subscriptions permanently removed." },
                    { icon: Globe, title: "Google Drive", desc: "All files, shared documents, and Google Docs/Sheets/Slides permanently deleted." },
                    { icon: Smartphone, title: "Google Photos", desc: "All photos and videos in Google Photos permanently removed (backed-up device photos unaffected)." },
                    { icon: Search, title: "Google Search History", desc: "Web, app, and location history deleted from Google's servers." },
                    { icon: Globe, title: "Other Services", desc: "Google Maps reviews, Google Calendar, Google Contacts, Play Store purchases, Google Pay, Fitbit data." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-border/50 bg-card p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong className="text-foreground">Critical warning:</strong> If you use an Android phone, deleting your Google account means losing access to the Play Store, Google Maps, and core Android services. Ensure you have an alternative Google account or are switching to a different ecosystem before proceeding.
                    </p>
                  </div>
                </div>
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
                    <h3 className="font-semibold text-foreground mb-1">1. Export All Data with Google Takeout</h3>
                    <p>
                      Visit <strong>takeout.google.com</strong> and create a complete archive. Select all products — Gmail, Drive, Photos, YouTube, Calendar, Contacts, Chrome bookmarks, Maps data, and more. Choose your preferred format (zip or tgz) and delivery method. Large archives may take hours or days to prepare. Download and verify the archive before proceeding with deletion.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2. Migrate Critical Accounts</h3>
                    <p>
                      This is the most important step. Audit every service that uses your Gmail address for login, password recovery, or 2FA. Common examples: banking, insurance, government services, utility accounts, subscription services, social media, and employer platforms. Update each to a new email address <strong>before</strong> deleting. Missing even one critical account could lock you out permanently.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3. Disconnect Third-Party Apps</h3>
                    <p>
                      Visit <strong>myaccount.google.com → Security → Third-party apps with account access</strong>. Remove all connected apps. Many services use "Sign in with Google" — these will break after deletion. Review OAuth permissions and migrate to alternative authentication methods.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <Smartphone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">4. Consider Selective Service Deletion</h3>
                    <p>
                      If your goal is reducing exposure rather than complete removal, consider deleting individual services instead. You can remove Gmail while keeping Drive, or delete YouTube while keeping Gmail. Visit <strong>myaccount.google.com → Data & Privacy → Delete a Google service</strong> for granular control.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Deletion Steps */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Step-by-Step: Permanently Delete Your Google Account</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <ol className="space-y-4 list-decimal list-inside">
                  <li><strong className="text-foreground">Go to myaccount.google.com</strong> and sign in</li>
                  <li><strong className="text-foreground">Navigate to Data & Privacy</strong> (left sidebar or menu)</li>
                  <li><strong className="text-foreground">Scroll to "More options"</strong> and click <strong>"Delete your Google Account"</strong></li>
                  <li><strong className="text-foreground">Verify your identity</strong> — enter your password and complete 2FA if enabled</li>
                  <li><strong className="text-foreground">Review the summary</strong> — Google shows what will be deleted across all services</li>
                  <li><strong className="text-foreground">Check both acknowledgment boxes</strong> — confirming data loss and responsibility</li>
                  <li><strong className="text-foreground">Click "Delete Account"</strong> — deletion begins immediately</li>
                </ol>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong className="text-foreground">Recovery window:</strong> Google provides approximately 2-3 weeks to recover a deleted account, though this timeframe is not guaranteed. Visit <strong>accounts.google.com/signin/recovery</strong> to attempt recovery. After this window, deletion is permanent and irreversible.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* After Deletion */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">After Deletion: Clean Up Your Digital Footprint</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Deleting your Google account removes Google-hosted content, but your broader digital footprint extends far beyond Google's ecosystem:
                </p>
                <ul className="space-y-2">
                  <li>• <strong className="text-foreground">Google search results</strong> — Third-party pages mentioning your name or email remain indexed. Use Google's <Link to="/remove-yourself-from-google-search" className="text-primary hover:underline">content removal tools</Link> for specific URLs.</li>
                  <li>• <strong className="text-foreground">Data broker profiles</strong> — Your Gmail address is likely linked to dozens of data broker listings. These persist independently. See our <Link to="/data-broker-opt-out-guide" className="text-primary hover:underline">data broker opt-out guide</Link>.</li>
                  <li>• <strong className="text-foreground">Breach databases</strong> — If your Gmail appeared in data breaches, that exposure remains in breach notification databases.</li>
                  <li>• <strong className="text-foreground">Cached YouTube content</strong> — Archive.org and social media shares may preserve deleted YouTube videos.</li>
                  <li>• <strong className="text-foreground">Email in others' inboxes</strong> — Emails you sent to other people remain in their accounts.</li>
                </ul>
                <p>
                  A post-deletion <Link to="/scan" className="text-primary hover:underline">FootprintIQ scan</Link> maps every residual trace of your Google identity across the web — giving you a clear, prioritised remediation plan. This is especially important for Gmail addresses that have been active for years and are connected to hundreds of services.
                </p>
              </div>
            </section>

            {/* Alternative: Google Privacy Settings */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Alternative: Reduce Exposure Without Deleting</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Full account deletion isn't always the right choice. If you depend on Gmail or Android, consider these privacy-hardening alternatives:
                </p>
                <ul className="space-y-2">
                  <li>• <strong className="text-foreground">Delete search and activity history</strong> — myaccount.google.com → Data & Privacy → Web & App Activity → Auto-delete (3 months)</li>
                  <li>• <strong className="text-foreground">Remove YouTube watch history</strong> — Turn off YouTube history and delete existing data</li>
                  <li>• <strong className="text-foreground">Disable ad personalisation</strong> — adssettings.google.com → Turn off personalised ads</li>
                  <li>• <strong className="text-foreground">Review Google Dashboard</strong> — myaccount.google.com/dashboard shows all data Google holds across services</li>
                  <li>• <strong className="text-foreground">Remove Google Maps reviews</strong> — Delete location reviews and contributions that expose your routine</li>
                  <li>• <strong className="text-foreground">Disable location history</strong> — Prevent Google from building a timeline of your movements</li>
                </ul>
                <p>
                  Combine these steps with a <Link to="/how-to-clean-up-your-digital-footprint" className="text-primary hover:underline">broader digital footprint cleanup</Link> for comprehensive exposure reduction without losing access to essential Google services.
                </p>
              </div>
            </section>

            {/* CTA */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-lg font-semibold mb-2">Ready to audit your Google exposure?</p>
              <p className="text-sm text-muted-foreground mb-4">
                FootprintIQ reveals what anyone can find about you online — including Gmail-linked data broker listings, cached content, and breach records.
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

            <RelatedToolsGrid currentPath="/how-to-delete-google-account" />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default HowToDeleteGoogleAccount;
