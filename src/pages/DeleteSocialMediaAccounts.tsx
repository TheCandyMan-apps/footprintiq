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
import { ArrowRight, Trash2, Shield, CheckCircle2, Clock, Eye, AlertTriangle } from "lucide-react";

const BASE = "https://footprintiq.app";

const platforms = [
  {
    name: "Facebook",
    path: "/how-to-delete-facebook-account",
    gracePeriod: "30 days",
    dataDownload: true,
    difficulty: "Medium",
    notes: "Must avoid logging in for 30 days. Data may persist in backups for 90+ days.",
  },
  {
    name: "Instagram",
    path: "/how-to-delete-facebook-account",
    gracePeriod: "30 days",
    dataDownload: true,
    difficulty: "Medium",
    notes: "Managed through Meta Accounts Center. Same 30-day grace period as Facebook.",
  },
  {
    name: "Twitter / X",
    path: null,
    gracePeriod: "30 days",
    dataDownload: true,
    difficulty: "Easy",
    notes: "Deactivation begins immediately. Data deleted after 30 days. Request archive first.",
  },
  {
    name: "TikTok",
    path: null,
    gracePeriod: "30 days",
    dataDownload: true,
    difficulty: "Easy",
    notes: "Settings → Manage Account → Delete Account. Videos may remain cached externally.",
  },
  {
    name: "LinkedIn",
    path: null,
    gracePeriod: "14 days",
    dataDownload: true,
    difficulty: "Easy",
    notes: "Settings → Account Preferences → Account Management → Close Account. Shorter grace period.",
  },
  {
    name: "Snapchat",
    path: null,
    gracePeriod: "30 days",
    dataDownload: true,
    difficulty: "Easy",
    notes: "Account deactivated for 30 days, then permanently deleted. Memories must be saved separately.",
  },
  {
    name: "Reddit",
    path: null,
    gracePeriod: "Immediate",
    dataDownload: false,
    difficulty: "Hard",
    notes: "Account deleted immediately but posts/comments remain attributed to '[deleted]'. No undo.",
  },
  {
    name: "Pinterest",
    path: null,
    gracePeriod: "14 days",
    dataDownload: true,
    difficulty: "Easy",
    notes: "Settings → Account Management → Delete Account. Pins may remain in others' boards.",
  },
];

const faqs = [
  {
    question: "How do I delete all my social media accounts at once?",
    answer: "There is no single tool that can delete all your social media accounts simultaneously. Each platform has its own deletion process and timeline. The most efficient approach is to work through them systematically: download your data from each, update connected logins, then initiate deletion on each platform. A FootprintIQ scan can help you discover accounts you may have forgotten about.",
  },
  {
    question: "What happens to my data when I delete a social media account?",
    answer: "Each platform handles data differently after account deletion. Most major platforms delete your primary data within 30-90 days but may retain certain information in backups. Your data may also persist in search engine caches, data broker databases, and third-party services that previously accessed your profile. A post-deletion digital footprint scan reveals what remains publicly accessible.",
  },
  {
    question: "How do I find old social media accounts I forgot about?",
    answer: "FootprintIQ's username and email scan can identify accounts linked to your credentials across hundreds of platforms. You can also search your email for registration confirmation messages, check your browser's saved passwords, and review 'Log in with Google/Facebook' connected apps in your Google and Meta account settings.",
  },
  {
    question: "Is deactivating the same as deleting a social media account?",
    answer: "No. Deactivation temporarily hides your profile but preserves all your data on the platform's servers. You can reactivate at any time. Deletion permanently removes your data (subject to platform-specific retention periods). For privacy, deletion is always the stronger option. Deactivation provides no meaningful protection against data breaches.",
  },
  {
    question: "Should I delete social media accounts I no longer use?",
    answer: "Yes. Dormant accounts are a significant security risk. They're vulnerable to credential stuffing attacks, data breaches, and identity correlation. Every unused account increases your attack surface. Deleting accounts you no longer use is one of the most effective steps to reduce your digital footprint.",
  },
  {
    question: "How do I remove cached social media profiles from Google?",
    answer: "After deleting your account, use Google's URL Removal Tool (search.google.com/search-console) to request cache removal for specific URLs. You can also submit a content removal request through Google's support page. Cache removal typically takes 1-4 weeks. FootprintIQ can identify which cached profiles are still indexed.",
  },
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Delete Social Media Accounts — Complete Platform-by-Platform Guide",
  description: "Step-by-step instructions for deleting accounts on Facebook, Instagram, Twitter, TikTok, LinkedIn, Snapchat, Reddit, and Pinterest.",
  author: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: BASE },
  datePublished: "2026-02-22",
  dateModified: "2026-02-22",
  mainEntityOfPage: `${BASE}/delete-social-media-accounts`,
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
    { "@type": "ListItem", position: 3, name: "Delete Social Media Accounts", item: `${BASE}/delete-social-media-accounts` },
  ],
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Social Media Account Deletion Guides",
  numberOfItems: platforms.length,
  itemListElement: platforms.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: `How to delete ${p.name}`,
    url: p.path ? `${BASE}${p.path}` : undefined,
  })),
};

const DeleteSocialMediaAccounts = () => {
  const webPageSchema = buildWebPageSchema({
    name: "How to Delete Social Media Accounts — Complete Guide",
    description: "Platform-by-platform guide to deleting social media accounts including Facebook, Instagram, Twitter, TikTok, and more.",
    url: `${BASE}/delete-social-media-accounts`,
  });

  return (
    <>
      <Helmet>
        <title>How to Delete Social Media Accounts — Complete Guide 2026</title>
        <meta name="description" content="Step-by-step guide to delete your social media accounts on Facebook, Instagram, Twitter, TikTok, LinkedIn, Snapchat, Reddit, and Pinterest. Reduce your digital footprint." />
        <link rel="canonical" href={`${BASE}/delete-social-media-accounts`} />
        <meta property="og:title" content="How to Delete Social Media Accounts — Complete Platform Guide" />
        <meta property="og:description" content="Delete your social media accounts step by step. Covers Facebook, Instagram, X, TikTok, LinkedIn, Snapchat, Reddit, and Pinterest." />
        <meta property="og:url" content={`${BASE}/delete-social-media-accounts`} />
        <meta property="og:type" content="article" />
      </Helmet>
      <JsonLd data={webPageSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />

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
              <span className="text-foreground">Delete Social Media Accounts</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              How to Delete Social Media Accounts{" "}
              <span className="text-primary">Complete Guide</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
              Platform-by-platform instructions for permanently deleting your social media accounts. Covers Facebook, Instagram, Twitter/X, TikTok, LinkedIn, Snapchat, Reddit, and Pinterest — plus what to do after deletion.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Find Forgotten Accounts <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/blog/delete-old-accounts">
                <Button size="lg" variant="outline" className="gap-2">
                  Why Delete Old Accounts? <AlertTriangle className="w-4 h-4" />
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
              Why Delete Social Media Accounts?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every social media account you own — active or dormant — contributes to your <Link to="/what-is-a-digital-footprint" className="text-primary hover:underline">digital footprint</Link>. Dormant accounts are especially dangerous: they're vulnerable to credential stuffing attacks, data breaches, and identity harvesting by <Link to="/how-to-remove-yourself-from-data-brokers" className="text-primary hover:underline">data brokers</Link>.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Research shows that the average person has over 100 online accounts, yet actively uses fewer than 10. The remaining 90+ accounts represent unmonitored attack vectors. Each account that uses a reused password or email creates a pathway for <Link to="/credential-reuse-risk" className="text-primary hover:underline">credential reuse attacks</Link> and identity correlation across platforms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Deleting unused social media accounts is one of the highest-impact privacy actions you can take. Combined with a <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scan</Link>, it dramatically reduces your online exposure and makes you a harder target for social engineering and identity theft.
            </p>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Trash2 className="w-7 h-7 text-destructive" />
              Platform-by-Platform Deletion Guide
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Below is a comparison of the deletion process for each major social media platform. Click platform names for detailed step-by-step guides where available.
            </p>

            {/* Comparison Table */}
            <div className="not-prose overflow-x-auto my-8">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-semibold text-foreground">Platform</th>
                    <th className="text-left p-3 font-semibold text-foreground">Grace Period</th>
                    <th className="text-left p-3 font-semibold text-foreground">Data Export</th>
                    <th className="text-left p-3 font-semibold text-foreground">Difficulty</th>
                    <th className="text-left p-3 font-semibold text-foreground">Key Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((p, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium text-foreground">
                        {p.path ? (
                          <Link to={p.path} className="text-primary hover:underline">{p.name}</Link>
                        ) : p.name}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.gracePeriod}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {p.dataDownload ? (
                          <span className="text-primary flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Yes</span>
                        ) : (
                          <span className="text-destructive">No</span>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">{p.difficulty}</td>
                      <td className="p-3 text-muted-foreground text-xs">{p.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Eye className="w-7 h-7 text-primary" />
              What Persists After Deletion
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Deleting your social media accounts does not remove all traces of your online presence. Several categories of data commonly persist after account deletion:
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li><strong>Search engine caches:</strong> Google and Bing may display cached versions of your profile for weeks after deletion. Use <Link to="/remove-yourself-from-google-search" className="text-primary hover:underline">Google's removal tool</Link> to request cache removal.</li>
              <li><strong>Data broker records:</strong> Sites like Spokeo, BeenVerified, and Whitepages harvest social media data. You'll need to <Link to="/data-broker-opt-out-guide" className="text-primary hover:underline">opt out individually</Link>.</li>
              <li><strong>Breach databases:</strong> If your credentials were compromised in a data breach, that record persists indefinitely. Check exposure with an <Link to="/email-breach-check" className="text-primary hover:underline">email breach check</Link>.</li>
              <li><strong>Third-party apps:</strong> Apps that had access to your profile may retain copies of your data under their own data retention policies.</li>
              <li><strong>Screenshots and archives:</strong> Content shared publicly may have been saved by other users or archived by services like the Wayback Machine.</li>
            </ul>

            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3 mt-12">
              <Shield className="w-7 h-7 text-primary" />
              The Complete Post-Deletion Privacy Workflow
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Deleting accounts is step one. For comprehensive digital privacy, follow this workflow after deleting your social media accounts:
            </p>
            <ol className="text-muted-foreground space-y-2">
              <li>1. <strong>Run a digital footprint scan</strong> — Use <Link to="/scan" className="text-primary hover:underline">FootprintIQ</Link> to identify remaining public traces linked to your username and email.</li>
              <li>2. <strong>Request search engine cache removal</strong> — Submit old profile URLs to Google and Bing for deindexing.</li>
              <li>3. <strong>Opt out of data brokers</strong> — Work through your <Link to="/data-broker-opt-out-guide" className="text-primary hover:underline">data broker opt-out list</Link> to remove harvested social data.</li>
              <li>4. <strong>Update reused passwords</strong> — Change passwords on any accounts that shared credentials with deleted social profiles.</li>
              <li>5. <strong>Set up ongoing monitoring</strong> — Enable <Link to="/continuous-exposure-monitoring-explained" className="text-primary hover:underline">continuous exposure monitoring</Link> to catch re-emerging data.</li>
            </ol>

            <div className="my-12 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center not-prose">
              <h3 className="text-2xl font-bold text-foreground mb-3">Find Accounts You've Forgotten</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                FootprintIQ scans hundreds of platforms to find accounts linked to your username or email — including ones you've forgotten about. Start with a free scan.
              </p>
              <Link to="/scan">
                <Button size="lg" className="gap-2">
                  Scan for Hidden Accounts <ArrowRight className="w-4 h-4" />
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

          <RelatedToolsGrid currentPath="/delete-social-media-accounts" />
        </section>

        <AboutFootprintIQBlock />
      </main>
      <Footer />
    </>
  );
};

export default DeleteSocialMediaAccounts;
