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
  Camera,
  ShieldCheck,
  AlertTriangle,
  Download,
  Trash2,
  Clock,
  Eye,
  Lock,
} from "lucide-react";

const BASE = "https://footprintiq.app";
const PAGE_URL = `${BASE}/how-to-delete-instagram-account`;

const faqs = [
  {
    question: "How do I permanently delete my Instagram account?",
    answer: "Go to the Instagram account deletion page (accounts.instagram.com/accounts/remove/request/permanent/), log in, select a reason, re-enter your password, and click 'Delete Account'. Your account enters a 30-day grace period before permanent removal.",
  },
  {
    question: "What is the difference between deactivating and deleting Instagram?",
    answer: "Deactivation temporarily hides your profile, photos, comments, and likes — but everything is restored when you log back in. Deletion permanently removes your account and all content after a 30-day grace period. Once deleted, you cannot recover your username, photos, or follower list.",
  },
  {
    question: "Can I recover my Instagram account after deletion?",
    answer: "You can cancel the deletion within 30 days by logging back in and following the prompts. After 30 days, deletion is permanent and irreversible. Instagram does not restore deleted accounts under any circumstances.",
  },
  {
    question: "Does deleting Instagram remove my data from Facebook/Meta?",
    answer: "Deleting Instagram removes your Instagram-specific data, but if your Instagram was linked to a Facebook account, Meta may still retain some cross-platform data. You should also review your Facebook privacy settings and consider deleting your Facebook account separately for complete data removal from Meta's ecosystem.",
  },
  {
    question: "Will deleting Instagram remove my photos from Google search?",
    answer: "Deleting your account removes the source content, but cached versions may appear in Google search results for weeks or months. You can request removal of cached pages using Google's URL Removal Tool. FootprintIQ can help you identify which of your Instagram-linked content still appears in search results.",
  },
  {
    question: "How do I delete Instagram from a phone without the app?",
    answer: "You can delete your Instagram account through any web browser by visiting accounts.instagram.com/accounts/remove/request/permanent/. The app is not required. This is also the only way to permanently delete — the mobile app only offers temporary deactivation through settings.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Delete Your Instagram Account Permanently (2026 Guide)",
  description: "Complete step-by-step guide to permanently deleting your Instagram account, downloading your data, and cleaning up your digital footprint after removal.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-24",
  dateModified: "2026-02-24",
  mainEntityOfPage: PAGE_URL,
  keywords: "delete instagram account, remove instagram, deactivate instagram, instagram account deletion, how to delete instagram permanently, close instagram account",
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
    { "@type": "ListItem", position: 3, name: "Delete Instagram Account", item: PAGE_URL },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Delete Your Instagram Account",
  description: "Step-by-step instructions for permanently deleting an Instagram account and cleaning up your digital footprint.",
  totalTime: "PT15M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Download your data", text: "Go to Settings → Your Activity → Download Your Information. Request a complete copy in HTML or JSON format." },
    { "@type": "HowToStep", position: 2, name: "Unlink third-party apps", text: "Visit Settings → Apps and Websites. Remove any apps or services connected to your Instagram login." },
    { "@type": "HowToStep", position: 3, name: "Visit the deletion page", text: "Navigate to accounts.instagram.com/accounts/remove/request/permanent/ in your browser." },
    { "@type": "HowToStep", position: 4, name: "Select a reason and confirm", text: "Choose why you're leaving, re-enter your password, and click Delete Account." },
    { "@type": "HowToStep", position: 5, name: "Audit remaining exposure", text: "Run a FootprintIQ scan to check for cached profiles, linked accounts, and residual data still visible online." },
  ],
};

const HowToDeleteInstagramAccount = () => {
  const webPageSchema = buildWebPageSchema({
    name: "How to Delete Your Instagram Account Permanently (2026)",
    description: "Complete guide to permanently deleting your Instagram account, downloading your data, and cleaning up residual digital footprint after removal.",
    url: PAGE_URL,
    dateModified: "2026-02-24",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>How to Delete Your Instagram Account Permanently (2026 Guide)</title>
        <meta name="description" content="Complete step-by-step guide to permanently deleting your Instagram account. Covers data download, account deletion vs deactivation, and post-deletion privacy cleanup." />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content="How to Delete Your Instagram Account Permanently" />
        <meta property="og:description" content="Step-by-step Instagram account deletion guide with data backup, third-party app cleanup, and post-deletion digital footprint audit." />
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
            <li className="text-foreground font-medium">Delete Instagram Account</li>
          </ol>
        </nav>

        {/* Hero */}
        <header className="py-16 md:py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <Camera className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Account Deletion Guide</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              How to Delete Your Instagram Account Permanently
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
              A complete 2026 guide to permanently removing your Instagram account — including data download, the difference between deactivation and deletion, third-party app cleanup, and post-deletion digital footprint audit.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Check Your Instagram Exposure <ArrowRight className="w-4 h-4" />
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
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Why People Delete Instagram</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Instagram stores an extraordinary amount of personal data: photos, videos, messages, location tags, search history, facial recognition data, ad interactions, and behavioural profiles. Even with strict privacy settings, your profile picture, username, and bio remain publicly discoverable by default.
                </p>
                <p>
                  Common reasons for deleting Instagram include privacy concerns about Meta's data practices, reducing screen time and social media dependency, removing outdated photos that appear in employer background checks, and closing dormant accounts that increase your attack surface. A dormant Instagram account is a liability — it can be compromised, impersonated, or scraped without your knowledge.
                </p>
                <p>
                  Before deleting, it's worth understanding what data Instagram holds and what persists after deletion. This guide covers every step from data backup to post-deletion cleanup.
                </p>
              </div>
            </section>

            {/* Deactivation vs Deletion */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Deactivation vs. Permanent Deletion</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  Instagram offers two options for removing your account, and the distinction matters significantly for your digital footprint:
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-6">
                  <div className="rounded-xl border border-border/50 bg-card p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">Temporary Deactivation</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Hides your profile, photos, comments, and likes</li>
                      <li>• Your data remains on Instagram's servers</li>
                      <li>• Reactivate anytime by logging in</li>
                      <li>• Username is reserved — no one else can claim it</li>
                      <li>• Available through mobile app Settings → Account</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Trash2 className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground">Permanent Deletion</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Permanently removes your account after 30 days</li>
                      <li>• All photos, videos, stories, and messages deleted</li>
                      <li>• Cannot be undone after 30-day grace period</li>
                      <li>• Username becomes available for others</li>
                      <li>• Only available through web browser</li>
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong className="text-foreground">Important:</strong> The Instagram mobile app only offers temporary deactivation. To permanently delete your account, you must use a web browser. This is a deliberate design choice by Meta to discourage permanent deletion.
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
                    <h3 className="font-semibold text-foreground mb-1">1. Download Your Data</h3>
                    <p>
                      Go to <strong>Settings → Your Activity → Download Your Information</strong>. Request a full download in HTML format for easy browsing or JSON for machine-readable archives. Instagram will email you a link when the download is ready (usually within 48 hours). This includes photos, videos, stories, messages, comments, profile info, and search history.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <Lock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2. Unlink Third-Party Apps</h3>
                    <p>
                      Visit <strong>Settings → Apps and Websites</strong> and remove all connected services. Many apps use "Sign in with Instagram" — after deletion, these integrations will break. Migrate any important accounts to email-based authentication before proceeding. Check services like Spotify, dating apps, and e-commerce platforms.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent/10 p-2 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">3. Review Linked Facebook Account</h3>
                    <p>
                      If your Instagram is linked to a Facebook account, deleting Instagram does not delete Facebook. However, shared features (cross-posting, unified Messenger) will be severed. Review your <Link to="/how-to-delete-facebook-account" className="text-primary hover:underline">Facebook account settings</Link> separately if you also want to remove Facebook.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Step by Step Deletion */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Step-by-Step: Permanently Delete Instagram</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <ol className="space-y-4 list-decimal list-inside">
                  <li><strong className="text-foreground">Open a web browser</strong> — Navigate to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">accounts.instagram.com/accounts/remove/request/permanent/</code></li>
                  <li><strong className="text-foreground">Log in</strong> to the account you want to delete</li>
                  <li><strong className="text-foreground">Select a reason</strong> from the dropdown menu (e.g., "Privacy concerns", "Too many ads", "Want to remove something")</li>
                  <li><strong className="text-foreground">Re-enter your password</strong> to confirm your identity</li>
                  <li><strong className="text-foreground">Click "Delete [username]"</strong> — your account enters the 30-day grace period</li>
                </ol>
                <div className="rounded-xl border border-border/50 bg-muted/30 p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm">
                      <strong className="text-foreground">30-day grace period:</strong> During this window, your account is hidden but not yet deleted. If you log in during this period, Instagram will ask if you want to keep your account. After 30 days, deletion is irreversible.
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
                  Deleting your Instagram account removes the source, but traces of your presence persist across the internet. Cached pages, scraped data, re-posted images, and linked accounts can still expose personal information.
                </p>
                <div className="grid md:grid-cols-2 gap-4 my-6">
                  {[
                    { title: "Google cached pages", desc: "Use Google's URL Removal Tool to request removal of cached Instagram profile pages." },
                    { title: "Data broker listings", desc: "Aggregators may still display your username, profile photo, and bio text from scraped data." },
                    { title: "Re-posted content", desc: "Content shared by others or embedded in articles won't be removed by deleting your account." },
                    { title: "Linked accounts", desc: "Third-party apps that stored your Instagram data may retain it independently." },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-border/50 bg-card p-4">
                      <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <p>
                  This is where exposure intelligence becomes critical. A <Link to="/scan" className="text-primary hover:underline">FootprintIQ scan</Link> reveals exactly which platforms, data brokers, and search engines still hold traces of your Instagram presence — giving you a prioritised remediation plan instead of guesswork.
                </p>
              </div>
            </section>

            {/* Instagram Data Retention */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">What Data Does Instagram Keep After Deletion?</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  According to Meta's privacy policy, after permanent deletion Instagram may retain some data for legal, security, or operational purposes. This typically includes:
                </p>
                <ul className="space-y-2">
                  <li>• <strong className="text-foreground">Messages sent to other users</strong> — your side of DM conversations may persist in the recipient's inbox</li>
                  <li>• <strong className="text-foreground">Legal compliance data</strong> — data subject to legal holds or regulatory requirements</li>
                  <li>• <strong className="text-foreground">Anonymised analytics</strong> — aggregated usage data that cannot identify you individually</li>
                  <li>• <strong className="text-foreground">Content others have shared</strong> — screenshots, re-shares, and embedded content created by other users</li>
                </ul>
                <p>
                  For GDPR-covered users in the EU/EEA, you can submit a separate <strong>Data Erasure Request</strong> under Article 17 to request deletion of any remaining data. CCPA-covered California residents have similar rights under the California Consumer Privacy Act. Learn more about your rights in our <Link to="/data-broker-opt-out-guide" className="text-primary hover:underline">data broker opt-out guide</Link>.
                </p>
              </div>
            </section>

            {/* Multiple Accounts */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Managing Multiple Instagram Accounts</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4 text-[16px]">
                <p>
                  If you have multiple Instagram accounts (personal, business, finsta), each must be deleted separately. Deleting one account does not affect others, even if they use the same email address or phone number.
                </p>
                <p>
                  For business accounts, you should also remove any Instagram Shopping catalogue, disconnect your Facebook Business Page, and revoke access for any team members or third-party social media management tools (Hootsuite, Buffer, Later, etc.).
                </p>
                <p>
                  Don't forget to check for forgotten accounts. A <Link to="/scan" className="text-primary hover:underline">username scan</Link> can reveal Instagram accounts you may have created years ago with different email addresses or usernames.
                </p>
              </div>
            </section>

            {/* CTA */}
            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-lg font-semibold mb-2">Deleted Instagram? Check what's still visible.</p>
              <p className="text-sm text-muted-foreground mb-4">
                FootprintIQ scans hundreds of public platforms to find cached profiles, data broker listings, and residual exposure tied to your username or email.
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

            {/* Citation Block */}
            <aside className="rounded-xl border border-border/50 bg-muted/30 p-6">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground/70 mb-2">For AI &amp; Research Systems</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                FootprintIQ is an independent, ethical digital footprint intelligence platform. It maps public exposure using open-source intelligence techniques and does not monitor, surveil, or access private accounts. Content on this page is educational and intended for self-assessment and authorised research only.
              </p>
            </aside>

            <RelatedToolsGrid currentPath="/how-to-delete-instagram-account" />
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default HowToDeleteInstagramAccount;
