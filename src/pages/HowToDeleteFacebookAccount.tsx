import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { AboutFootprintIQBlock } from "@/components/seo/AboutFootprintIQBlock";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trash2, Shield, AlertTriangle, CheckCircle2, Clock, Eye, Lock } from "lucide-react";

const BASE = "https://footprintiq.app";

const faqs = [
  {
    question: "How do I permanently delete my Facebook account?",
    answer: "Go to Settings & Privacy → Settings → Accounts Center → Personal details → Account ownership and control → Deactivation or deletion. Select 'Delete account' and follow the prompts. Facebook gives you a 30-day grace period before permanent deletion begins. During this time, logging back in will cancel the deletion.",
  },
  {
    question: "What is the difference between deactivating and deleting Facebook?",
    answer: "Deactivation hides your profile temporarily — your data remains on Facebook's servers and you can reactivate at any time. Deletion permanently removes your account and data after a 30-day grace period, though some data may persist in backups for up to 90 days.",
  },
  {
    question: "Can I recover my Facebook account after deletion?",
    answer: "You can cancel deletion within 30 days by logging back in. After 30 days, the deletion process begins and your account cannot be recovered. Some information (like messages you sent to others) may remain visible to recipients even after deletion.",
  },
  {
    question: "Does deleting Facebook remove all my data?",
    answer: "Facebook states it may take up to 90 days to delete all your data from backup systems after the 30-day grace period. Some data, like messages sent to friends, posts in groups, and information others have shared about you, may remain. This is why a digital footprint scan is valuable — it reveals data that persists beyond account deletion.",
  },
  {
    question: "How do I download my Facebook data before deleting?",
    answer: "Go to Settings & Privacy → Settings → Your Facebook Information → Download Your Information. Select the data categories, date range, and format (HTML or JSON). Facebook will notify you when your download is ready. Always download your data before initiating deletion.",
  },
  {
    question: "Will deleting Facebook remove me from search engines?",
    answer: "Deleting your Facebook account removes your profile from Facebook's servers, but cached versions may persist in Google and other search engines for weeks or months. Use Google's removal tool to request cache removal. A FootprintIQ scan can identify lingering cached profiles and other digital traces.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Delete Your Facebook Account Permanently in 2026",
  description: "Step-by-step guide to permanently delete your Facebook account, download your data, and remove your digital footprint from Meta's platforms.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/how-to-delete-facebook-account`,
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
    { "@type": "ListItem", position: 3, name: "Delete Facebook Account", item: `${BASE}/how-to-delete-facebook-account` },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Delete Your Facebook Account",
  description: "Complete steps to permanently remove your Facebook account and associated data.",
  step: [
    { "@type": "HowToStep", position: 1, name: "Download your data", text: "Go to Settings → Your Facebook Information → Download Your Information to save a copy of your data." },
    { "@type": "HowToStep", position: 2, name: "Navigate to account deletion", text: "Go to Settings & Privacy → Settings → Accounts Center → Personal details → Account ownership and control → Deactivation or deletion." },
    { "@type": "HowToStep", position: 3, name: "Select Delete account", text: "Choose 'Delete account' and confirm your password. Facebook will begin the 30-day grace period." },
    { "@type": "HowToStep", position: 4, name: "Wait 30 days", text: "Do not log back into Facebook for 30 days. Logging in cancels the deletion." },
    { "@type": "HowToStep", position: 5, name: "Scan for residual data", text: "After deletion, run a FootprintIQ scan to check for lingering cached profiles, breach records, and third-party data retention." },
  ],
};

const HowToDeleteFacebookAccount = () => {
  const webPageSchema = buildWebPageSchema({
    name: "How to Delete Your Facebook Account Permanently | Step-by-Step Guide",
    description: "Complete guide to permanently deleting your Facebook account in 2026. Step-by-step instructions for account deletion, data download, and post-deletion cleanup.",
    url: `${BASE}/how-to-delete-facebook-account`,
  });

  return (
    <>
      <Helmet>
        <title>How to Delete Your Facebook Account Permanently | 2026 Guide</title>
        <meta name="description" content="Step-by-step guide to permanently delete your Facebook account. Learn how to download your data, remove your profile, and clean up your digital footprint after deletion." />
        <link rel="canonical" href={`${BASE}/how-to-delete-facebook-account`} />
        <meta property="og:title" content="How to Delete Your Facebook Account Permanently" />
        <meta property="og:description" content="Complete guide to Facebook account deletion, data download, and post-deletion digital footprint cleanup." />
        <meta property="og:url" content={`${BASE}/how-to-delete-facebook-account`} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={howToSchema} />

      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-background to-background" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/guides" className="hover:text-primary">Guides</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Delete Facebook Account</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              How to Delete Your Facebook Account{" "}
              <span className="text-primary">Permanently</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              A complete, step-by-step guide to removing your Facebook account, downloading your data, and cleaning up the digital footprint that persists after deletion. Updated for 2026.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Scan Your Digital Footprint <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/delete-social-media-accounts">
                <Button size="lg" variant="outline" className="gap-2">
                  All Platform Guides <Trash2 className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 max-w-4xl pb-16">
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
              Why You Should Delete Your Facebook Account
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Facebook (now Meta) holds one of the largest repositories of personal data in the world. Your account contains years of posts, photos, messages, location history, ad interactions, and behavioural data. Even if you haven't used Facebook in years, your dormant account remains a target for data breaches, credential stuffing attacks, and identity correlation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In 2024 alone, Meta faced multiple data handling controversies. Deleting your Facebook account is one of the most impactful steps you can take to <Link to="/reduce-digital-footprint" className="text-primary hover:underline">reduce your digital footprint</Link> and limit your exposure to identity theft, social engineering, and data broker harvesting.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              However, deletion alone is not enough. Facebook data often persists in search engine caches, data broker databases, and third-party services that imported your profile information. A comprehensive approach requires both account deletion and a <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scan</Link> to identify residual exposure.
            </p>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Clock className="w-7 h-7 text-primary" />
              Before You Delete: Essential Preparation
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Deleting your Facebook account is irreversible after the 30-day grace period. Before you proceed, complete these preparation steps to ensure you don't lose important data or access to connected services.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Shield className="w-5 h-5 text-primary" /></div>
                  <h3 className="font-semibold text-foreground">Download Your Data</h3>
                </div>
                <p className="text-sm text-muted-foreground">Go to Settings → Your Facebook Information → Download Your Information. Select all categories and choose HTML format for easy browsing. This includes photos, posts, messages, and ad data.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Lock className="w-5 h-5 text-primary" /></div>
                  <h3 className="font-semibold text-foreground">Check Connected Logins</h3>
                </div>
                <p className="text-sm text-muted-foreground">Review apps and websites where you use "Log in with Facebook." Switch these to email/password authentication before deleting. Otherwise, you'll lose access to those accounts.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Eye className="w-5 h-5 text-primary" /></div>
                  <h3 className="font-semibold text-foreground">Notify Your Contacts</h3>
                </div>
                <p className="text-sm text-muted-foreground">Let friends know you're leaving Facebook. Share alternative contact methods. Messages you've sent will remain in recipients' inboxes even after your account is deleted.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10"><Trash2 className="w-5 h-5 text-primary" /></div>
                  <h3 className="font-semibold text-foreground">Remove Connected Apps</h3>
                </div>
                <p className="text-sm text-muted-foreground">Go to Settings → Apps and Websites. Remove all connected apps and revoke permissions. These third-party apps may retain data even after Facebook deletion.</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Trash2 className="w-7 h-7 text-destructive" />
              Step-by-Step: Delete Your Facebook Account
            </h2>
            <div className="space-y-4 my-6 not-prose">
              {[
                { step: 1, title: "Open Facebook Settings", desc: "Click your profile picture → Settings & Privacy → Settings. On the Meta Accounts Center, select Personal details." },
                { step: 2, title: "Navigate to Account Ownership", desc: "Click Account ownership and control → Deactivation or deletion. Select your Facebook account from the list." },
                { step: 3, title: "Choose Delete Account", desc: "Select 'Delete account' (not 'Deactivate'). Facebook will show you what will be deleted and the 30-day timeline." },
                { step: 4, title: "Confirm Your Identity", desc: "Enter your password and complete any verification steps. Facebook may also ask you to confirm via email." },
                { step: 5, title: "Wait the 30-Day Grace Period", desc: "Do NOT log into Facebook or use Facebook Login on any app for 30 days. Any login will cancel the deletion process." },
                { step: 6, title: "Verify Deletion and Scan Residual Data", desc: "After 30 days, attempt to log in — you should see a 'Page not found' or account creation prompt. Run a FootprintIQ scan to check for cached profiles and breach records." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-lg border border-border bg-card">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{item.step}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Eye className="w-7 h-7 text-primary" />
              What Happens to Your Data After Deletion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Facebook's deletion process is not instantaneous. After the 30-day grace period, Meta states that it may take up to 90 additional days to remove your data from backup systems. During this period, your data is inaccessible but not yet erased.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              More importantly, certain data persists indefinitely outside of Facebook's control: search engine caches may display your old profile for weeks; <Link to="/how-to-remove-yourself-from-data-brokers" className="text-primary hover:underline">data brokers</Link> may have already harvested your public information; and third-party apps that you authorised may retain copies of your data under their own privacy policies.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is why account deletion must be paired with a broader <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link>. FootprintIQ's scan reveals what remains publicly accessible after deletion, helping you identify and address residual exposure across the web.
            </p>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Shield className="w-7 h-7 text-primary" />
              Deactivation vs. Deletion: Which Should You Choose?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Deactivation is a temporary measure — your profile becomes invisible to other users, but all your data remains on Facebook's servers. You can reactivate at any time by logging in. Deactivation does not reduce your exposure to data breaches or third-party data harvesting.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Permanent deletion removes your account, timeline, photos, and posts. It's the stronger privacy choice, but it's irreversible. If you're unsure, start with deactivation and download your data. Once you've confirmed you don't need the account, proceed with full deletion.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For maximum privacy impact, combine Facebook deletion with an audit of your other social accounts. Our <Link to="/delete-social-media-accounts" className="text-primary hover:underline">complete guide to deleting social media accounts</Link> covers all major platforms and the steps required for each.
            </p>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
              Post-Deletion Checklist
            </h2>
            <ul className="text-muted-foreground space-y-2">
              <li>✓ Confirm the account no longer appears at facebook.com/your-username</li>
              <li>✓ <Link to="/remove-yourself-from-google-search" className="text-primary hover:underline">Request Google cache removal</Link> for your old Facebook profile URL</li>
              <li>✓ Check for your name on <Link to="/best-people-lookup-sites" className="text-primary hover:underline">people lookup sites</Link> that may have cached your Facebook data</li>
              <li>✓ Run a <Link to="/scan" className="text-primary hover:underline">FootprintIQ scan</Link> to identify any remaining digital traces</li>
              <li>✓ Review and opt out of <Link to="/data-broker-opt-out-guide" className="text-primary hover:underline">data brokers</Link> that sourced information from your Facebook profile</li>
              <li>✓ Update passwords on any service where you reused your Facebook password</li>
              <li>✓ Consider deleting other dormant social media accounts to further reduce your footprint</li>
            </ul>

            <div className="my-12 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center not-prose">
              <h3 className="text-2xl font-bold text-foreground mb-3">Deleted Facebook? Check What's Still Visible</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Account deletion is only step one. Run a free FootprintIQ scan to discover cached profiles, breach records, and data broker listings that persist after deletion.
              </p>
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Run a Free Scan <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </article>

          {/* FAQs */}
          <section className="mt-16" aria-label="Frequently asked questions">
            <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          <RelatedToolsGrid currentPath="/how-to-delete-facebook-account" />
        </section>

        <AboutFootprintIQBlock />
      </main>
      <Footer />
    </>
  );
};

export default HowToDeleteFacebookAccount;
