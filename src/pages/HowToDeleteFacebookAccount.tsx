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
import { ArrowRight, Trash2, Shield, AlertTriangle, CheckCircle2, Clock, Eye, Lock, Users, Unlink, Building2 } from "lucide-react";

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
  {
    question: "How do I remove a cloned Facebook account?",
    answer: "Visit the cloned profile and click the three dots next to the cover photo. Select 'Find Support or Report Profile' and choose 'Pretending to Be Someone.' Follow the prompts to report it. Notify your friends and family so they can also report the fake profile, which helps expedite Facebook's review process.",
  },
  {
    question: "How do I remove Facebook from Instagram?",
    answer: "Open Instagram Settings → Account Center → Accounts & Profiles. Find your linked Facebook account and tap 'Remove from Account Center.' This unlinks the two platforms without deleting either account, giving you independent control over each.",
  },
  {
    question: "How do I delete a Facebook Business Page?",
    answer: "Log into your Facebook account with admin access to the page. Navigate to your business page → Settings → scroll down to 'Remove Page' and select 'Permanently Delete Your Page Name.' This action is irreversible, so ensure you've backed up any important content first.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Remove Your Facebook Account: Complete Guide to Deletion",
  description: "Learn how to remove your Facebook account with this step-by-step guide. Covers account deletion, cloned account removal, Instagram unlinking, and business page removal.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-24",
  mainEntityOfPage: `${BASE}/how-to-delete-facebook-account`,
  keywords: "remove facebook account, delete facebook account, facebook account deletion, deactivate facebook account, how to remove your facebook account, cancel facebook account, terminate facebook account, erase facebook profile, facebook account closure, facebook account removal",
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
  name: "How to Remove Your Facebook Account",
  description: "Complete steps to permanently remove your Facebook account, handle cloned profiles, unlink Instagram, and delete business pages.",
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
    name: "Remove Facebook Account: Complete Guide to Deletion",
    description: "Complete guide to removing your Facebook account permanently. Step-by-step instructions for account deletion, cloned account removal, Instagram unlinking, and business page deletion.",
    url: `${BASE}/how-to-delete-facebook-account`,
    dateModified: "2026-02-24",
  });

  return (
    <>
      <Helmet>
        <title>Remove Facebook Account: Complete Guide to Deletion</title>
        <meta name="description" content="Learn how to remove your Facebook account with this step-by-step guide. Whether it's for privacy, security, or time management, this article covers all aspects of Facebook account removal." />
        <link rel="canonical" href={`${BASE}/how-to-delete-facebook-account`} />
        <meta property="og:title" content="Remove Facebook Account: Complete Guide to Deletion" />
        <meta property="og:description" content="Complete guide to Facebook account deletion, cloned account removal, Instagram unlinking, and post-deletion digital footprint cleanup." />
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
              <span className="text-foreground">Remove Facebook Account</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Remove Your Facebook Account:{" "}
              <span className="text-primary">Complete Guide to Deletion</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Whether you want to delete your personal account permanently, remove a cloned profile, unlink Facebook from Instagram, or close a business page — this comprehensive guide walks you through every scenario. Updated for 2026.
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
            {/* Section: Why Remove Your Account */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
              Why You Should Remove Your Facebook Account
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Facebook has woven itself into the fabric of our daily lives, serving as a platform for communication, social interaction, and even business networking. However, there may come a point when you decide it's time to sever ties with this digital entity. Whether you're aiming to delete an obsolete account, eradicate a fraudulent profile, or simply desire a digital detox, understanding your motivations will guide the right approach.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-8">Privacy Concerns</h3>
            <p className="text-muted-foreground leading-relaxed">
              In an age where data privacy is paramount, concerns over personal information being shared or misused have become prevalent. Facebook (now Meta) holds one of the largest repositories of personal data in the world — years of posts, photos, messages, location history, ad interactions, and behavioural data. By removing your account, you can significantly reduce your online footprint, thereby enhancing your privacy and security. Even dormant accounts remain targets for data breaches, credential stuffing attacks, and <Link to="/how-to-remove-yourself-from-data-brokers" className="text-primary hover:underline">data broker harvesting</Link>.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-8">Time Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Social media platforms are designed to be engaging, often leading to excessive screen time that detracts from more productive activities. If you find yourself spending countless hours scrolling through your Facebook feed, removing your account could free up hours better spent pursuing hobbies, engaging in face-to-face interactions, or simply unwinding without digital distractions.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-8">Cloned Accounts and Identity Protection</h3>
            <p className="text-muted-foreground leading-relaxed">
              The rise of cloned profiles is a growing concern. If someone has created a profile that mimics yours, it can lead to confusion, misinformation, and potential damage to your reputation. By removing unauthorised accounts and securing your personal information, you can protect yourself from identity theft. A <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scan</Link> can help identify whether cloned or impersonation profiles exist across platforms.
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-8">Managing Old or Inactive Accounts</h3>
            <p className="text-muted-foreground leading-relaxed">
              Over time, many users accumulate multiple accounts, some of which become inactive or redundant. Closing these accounts simplifies your digital presence and reduces the risk of security breaches. By cleaning up your online persona, you ensure that only relevant and active profiles remain, streamlining your interactions and enhancing your digital security.
            </p>

            {/* Section: Before You Delete */}
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

            {/* Section: Step-by-Step Deletion */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Trash2 className="w-7 h-7 text-destructive" />
              Step-by-Step: How to Remove Your Facebook Account Permanently
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Follow these steps to permanently delete your personal Facebook account and complete the Facebook account removal process.
            </p>
            <div className="space-y-4 my-6 not-prose">
              {[
                { step: 1, title: "Log into the Account", desc: "Log into the Facebook account you wish to delete. If you've forgotten your password, use Facebook's 'Forgot Password?' feature to reset it and regain access." },
                { step: 2, title: "Navigate to Settings", desc: "Click your profile picture → Settings & Privacy → Settings. This takes you to the main settings page where you can manage various aspects of your account." },
                { step: 3, title: "Access Your Facebook Information", desc: "On the left-hand menu, click 'Your Facebook Information.' Here you can download your data, view your activity log, and manage your account details." },
                { step: 4, title: "Deactivation and Deletion", desc: "Click 'Deactivation and Deletion.' Choose 'Delete Account' (not 'Deactivate'). Deactivation merely hides your profile temporarily; deletion permanently removes your account and all associated data." },
                { step: 5, title: "Confirm Your Identity", desc: "Enter your password for verification. Facebook may offer you the opportunity to download your data before proceeding. Take advantage of this backup option." },
                { step: 6, title: "Wait the 30-Day Grace Period", desc: "Your account is now scheduled for deletion. Do NOT log into Facebook or use Facebook Login on any app for 30 days. Any login cancels the deletion process entirely." },
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

            {/* Section: Cloned Accounts */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Users className="w-7 h-7 text-amber-500" />
              How to Remove a Cloned Facebook Account
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The discovery of a cloned Facebook account can be alarming, as it poses a direct threat to your online identity and reputation. Cloned profiles impersonate you to scam your friends and family, spread misinformation, or harvest personal data. Taking swift action is crucial to mitigate potential damage.
            </p>
            <div className="space-y-4 my-6 not-prose">
              {[
                { step: 1, title: "Report the Cloned Account", desc: "Visit the cloned profile. Click the three dots next to the cover photo and select 'Find Support or Report Profile.' Choose 'Pretending to Be Someone' and follow the prompts. Provide detailed information to aid Facebook's review." },
                { step: 2, title: "Inform Friends and Family", desc: "Notify your contacts about the cloned account so they avoid interacting with the fraudulent profile. Encourage them to report it as well — multiple reports expedite Facebook's response." },
                { step: 3, title: "Monitor for Resolution", desc: "After reporting, Facebook will review and take action. Remain vigilant and be prepared to report further issues. Strengthen your privacy settings to prevent future profile cloning." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 p-4 rounded-lg border border-border bg-card">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500 text-primary-foreground flex items-center justify-center font-bold">{item.step}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To proactively detect cloned profiles, run a <Link to="/usernames" className="text-primary hover:underline">username search</Link> across platforms to see where your identity may be impersonated.
            </p>

            {/* Section: Remove Facebook from Instagram */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Unlink className="w-7 h-7 text-primary" />
              How to Remove Facebook Account from Instagram
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you've linked your Facebook and Instagram accounts, unlinking them is an important step in managing your digital presence independently. Here's how to remove Facebook from Instagram:
            </p>
            <div className="space-y-4 my-6 not-prose">
              {[
                { step: 1, title: "Open Instagram Settings", desc: "Launch Instagram and navigate to your profile. Tap the three horizontal lines in the top right corner, then select 'Settings and privacy.'" },
                { step: 2, title: "Access Account Center", desc: "Within settings, locate and tap 'Account Center.' This section manages linked accounts and profiles across Facebook and Instagram." },
                { step: 3, title: "Remove the Facebook Account", desc: "Select 'Accounts & Profiles.' Find your linked Facebook account, tap it, and choose 'Remove from Account Center.' Confirm your choice to unlink the platforms." },
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

            {/* Section: Delete Business Page */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Building2 className="w-7 h-7 text-primary" />
              Deleting a Facebook Business Page
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For business owners and page administrators, deleting a Facebook business page is a significant and irreversible decision. Follow these steps to remove a business page from your personal account:
            </p>
            <div className="space-y-4 my-6 not-prose">
              {[
                { step: 1, title: "Access Your Page", desc: "Log into your Facebook account and navigate to the business page you wish to delete. Ensure you have the necessary administrative privileges." },
                { step: 2, title: "Navigate to Page Settings", desc: "On your business page, locate the 'Settings' option at the top right corner. This opens the page settings menu." },
                { step: 3, title: "Remove the Page", desc: "Scroll down to the 'Remove Page' section. Select 'Permanently Delete Your Page Name.' Carefully review the implications — this action is irreversible — then confirm the deletion." },
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

            {/* Section: What Happens After */}
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
              This is why Facebook account removal must be paired with a broader <Link to="/check-my-digital-footprint" className="text-primary hover:underline">digital footprint check</Link>. FootprintIQ's scan reveals what remains publicly accessible after deletion, helping you identify and address residual exposure across the web.
            </p>

            {/* Section: Deactivation vs Deletion */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Shield className="w-7 h-7 text-primary" />
              Deactivation vs. Deletion: Which Should You Choose?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Deactivation is a temporary measure — your profile becomes invisible to other users, but all your data remains on Facebook's servers. You can reactivate at any time by logging in. Deactivating your Facebook account does not reduce your exposure to data breaches or third-party data harvesting.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Permanent deletion removes your account, timeline, photos, and posts. It's the stronger privacy choice, but it's irreversible. If you're uncertain about permanently removing your account, consider deactivation first and download your data. Once you've confirmed you don't need the account, proceed with full Facebook account closure.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For maximum privacy impact, combine Facebook deletion with an audit of your other social accounts. Our <Link to="/delete-social-media-accounts" className="text-primary hover:underline">complete guide to deleting social media accounts</Link> covers all major platforms and the steps required for each.
            </p>

            {/* Section: Things to Consider */}
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
              Things to Consider Before You Remove Facebook Permanently
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Before you proceed with permanent Facebook account deletion, consider these important factors to make an informed decision:
            </p>
            <div className="grid md:grid-cols-3 gap-6 my-8 not-prose">
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-2">Data Backup</h3>
                <p className="text-sm text-muted-foreground">Download a complete copy of your photos, posts, messages, and interactions. This backup ensures you have a record of your memories even after your account is erased.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-2">Account Recovery</h3>
                <p className="text-sm text-muted-foreground">If you're uncertain, try deactivation first. It hides your profile without losing data, giving you a safety net to test life without Facebook before making a final decision.</p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-card">
                <h3 className="font-semibold text-foreground mb-2">Linked Services Impact</h3>
                <p className="text-sm text-muted-foreground">Many apps and websites use "Log in with Facebook." Deleting your account disrupts access to these services. Update your login credentials on all linked platforms beforehand.</p>
              </div>
            </div>

            {/* Section: Post-Deletion Checklist */}
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
              <li>✓ Consider deleting other dormant social media accounts to further <Link to="/reduce-digital-footprint" className="text-primary hover:underline">reduce your digital footprint</Link></li>
            </ul>

            {/* CTA */}
            <div className="my-12 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center not-prose">
              <h3 className="text-2xl font-bold text-foreground mb-3">Removed Facebook? Check What's Still Visible</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Account deletion is only step one. Run a free FootprintIQ scan to discover cached profiles, breach records, and data broker listings that persist after you uninstall or terminate your Facebook account.
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
