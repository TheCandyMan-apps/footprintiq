import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedToolsGrid } from "@/components/seo/RelatedToolsGrid";
import { GuideCitationBlock } from "@/components/guides/GuideCitationBlock";
import { buildWebPageSchema } from "@/lib/seo/webPageSchema";
import { Link } from "react-router-dom";

const CANONICAL = "https://footprintiq.app/blog/delete-old-accounts";

const faqData = [
  {
    q: "How do I find old accounts I've forgotten about?",
    a: "Run a username or email exposure scan to identify accounts linked to your identity across hundreds of platforms. You can also search your email inbox for old registration confirmations and check password managers for stored credentials.",
  },
  {
    q: "Can I delete an account if I've forgotten the password?",
    a: "Yes. Most platforms offer a password reset via email. If the email address is also no longer accessible, you may need to contact the platform's support team directly with proof of identity. Some platforms have specific account recovery or deletion request forms.",
  },
  {
    q: "Do I need to delete the data before deleting the account?",
    a: "It depends on the platform. Some services delete all associated data when you close the account. Others retain data for a period or require you to manually delete content (posts, photos, files) before account closure. Check the platform's privacy policy.",
  },
  {
    q: "What if a platform won't let me delete my account?",
    a: "In the UK and EU, you can submit a GDPR erasure request (Article 17) requiring the platform to delete your personal data. In the US, California residents can use CCPA deletion rights. For other jurisdictions, contact the platform's support team directly.",
  },
  {
    q: "How many old accounts does the average person have?",
    a: "Research suggests the average internet user has created between 100 and 200 online accounts over their lifetime. Many of these are forgotten, unused, and still publicly indexed — creating an invisible attack surface for credential stuffing, data broker scraping, and identity correlation.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqData.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Delete Old Accounts You No Longer Use",
  description:
    "Step-by-step guide to finding and deleting old online accounts. Covers security risks of dormant accounts, discovery methods, and deletion processes.",
  author: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  publisher: { "@type": "Organization", name: "FootprintIQ", url: "https://footprintiq.app" },
  datePublished: "2026-02-14",
  dateModified: "2026-02-14",
  mainEntityOfPage: CANONICAL,
  image: "https://footprintiq.app/blog-images/username-security.webp",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
    { "@type": "ListItem", position: 3, name: "Delete Old Accounts", item: CANONICAL },
  ],
};

export default function DeleteOldAccounts() {
  return (
    <>
      <Helmet>
        <title>How to Delete Old Accounts You No Longer Use | FootprintIQ</title>
        <meta
          name="description"
          content="Step-by-step guide to finding and deleting old online accounts. Learn why dormant accounts are a security risk and how to clean up your digital footprint."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content="How to Delete Old Accounts You No Longer Use" />
        <meta
          property="og:description"
          content="Find and delete old online accounts to reduce your digital footprint and security risk."
        />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="article" />
      </Helmet>

      <JsonLd data={faqSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd
        data={buildWebPageSchema({
          name: "How to Delete Old Accounts You No Longer Use",
          description:
            "Step-by-step guide to finding and deleting old online accounts to reduce your digital footprint.",
          url: CANONICAL,
          datePublished: "2026-02-14",
          dateModified: "2026-02-14",
        })}
      />

      <Header />

      <main className="min-h-screen bg-background">
        <article className="container mx-auto px-4 py-16 md:py-20 max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Delete Old Accounts</span>
          </nav>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                Security
              </span>
              <span className="text-xs text-muted-foreground">February 14, 2026</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">11 min read</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              How to Delete Old Accounts You No Longer Use
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every forgotten account is an attack surface. This guide covers how to find dormant accounts, why they're a security risk, and the step-by-step process for deleting them — including what to do when platforms make it difficult.
            </p>
          </header>

          {/* ── Direct Answer ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/20">
            <p className="text-foreground leading-relaxed">
              <strong>To delete old accounts</strong>, start by discovering which accounts exist using a username or email exposure scan. Then visit each platform's account settings, look for "Delete Account" or "Close Account" options, and follow the process. For platforms that make deletion difficult, submit a GDPR erasure request (UK/EU) or contact support directly. The average person has 100–200 online accounts — most forgotten and still publicly indexed.
            </p>
          </section>

          {/* ── Why Dormant Accounts Are Dangerous ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Why Dormant Accounts Are a Security Risk
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              An account you created in 2014 and never used again still exists. It still has your email address, possibly your real name, maybe a reused password, and potentially a profile picture or bio that links to your current identity. These forgotten accounts create risk in several ways:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Credential stuffing</strong> — If the platform suffers a breach, your email and password end up in leaked databases. If you reused that password elsewhere, attackers gain access to your active accounts.</li>
              <li><strong>Data broker scraping</strong> — Brokers index old profiles and aggregate them into people-search results, exposing your username patterns, email addresses, and associations.</li>
              <li><strong>Identity correlation</strong> — Investigators and threat actors can link old accounts to your current identity through shared usernames, email addresses, or profile photos.</li>
              <li><strong>Account takeover</strong> — Dormant accounts with weak passwords can be hijacked and used for impersonation, spam, or social engineering.</li>
            </ul>
          </section>

          {/* ── How to Find Old Accounts ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How to Find Old Accounts
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The hardest part of account cleanup is discovery. You can't delete what you don't know exists. Here are the most effective methods:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3 ml-4">
              <li>
                <strong>Run a username exposure scan</strong> — A{" "}
                <Link to="/username-scan" className="text-primary hover:underline">username scan</Link>{" "}
                checks hundreds of platforms for accounts associated with your common usernames. This is the fastest discovery method.
              </li>
              <li>
                <strong>Search your email inbox</strong> — Search for terms like "welcome to," "confirm your account," "verify your email," or "thanks for signing up" to find old registration emails.
              </li>
              <li>
                <strong>Check your password manager</strong> — If you use a password manager, review stored entries for platforms you no longer use.
              </li>
              <li>
                <strong>Review "Sign in with Google/Facebook" connections</strong> — Check your Google and Facebook account settings for third-party apps you've authorised. Revoke access and delete the associated accounts.
              </li>
              <li>
                <strong>Search your name and usernames on Google</strong> — A simple search can surface old forum posts, profile pages, and social media accounts you've forgotten.
              </li>
            </ol>
          </section>

          {/* ── Cross-link insert ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/10">
            <p className="text-foreground leading-relaxed mb-3">
              Old accounts are a major source of data broker listings. Removing the accounts at the source reduces the data brokers can scrape and aggregate.
            </p>
            <Link
              to="/blog/remove-from-data-brokers-uk"
              className="text-sm font-medium text-primary hover:underline"
            >
              → How to Remove Yourself From Data Brokers (UK Guide)
            </Link>
          </section>

          {/* ── Deletion Process ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              The Account Deletion Process
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once you've identified old accounts, follow this process for each one:
            </p>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3 ml-4">
              <li><strong>Log in</strong> — If you can't remember the password, use the password reset flow. If the email is no longer accessible, try account recovery or contact support.</li>
              <li><strong>Download your data</strong> — Many platforms offer a data export before deletion. This is useful if you want to review what was stored.</li>
              <li><strong>Remove personal content</strong> — Delete posts, photos, comments, and files before closing the account. Some platforms don't automatically purge content.</li>
              <li><strong>Find the deletion option</strong> — Look in Settings → Account → Privacy for "Delete Account," "Close Account," or "Deactivate." Note: deactivation is not deletion — insist on permanent deletion.</li>
              <li><strong>Confirm and wait</strong> — Most platforms have a cooling-off period (14–30 days) before permanent deletion. Don't log back in during this period or you'll cancel the process.</li>
            </ol>
          </section>

          {/* ── When Platforms Make It Hard ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              What to Do When Platforms Make Deletion Difficult
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Some platforms deliberately make account deletion difficult — burying the option, offering only deactivation, or requiring you to contact support. If you encounter resistance:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Check JustDeleteMe</strong> — This community-maintained directory rates platforms by deletion difficulty and provides direct links to deletion pages.</li>
              <li><strong>Submit a GDPR request</strong> — For UK/EU residents, send a formal erasure request citing Article 17. The platform must respond within one month.</li>
              <li><strong>Contact support directly</strong> — Some platforms only process deletions through support tickets. Be specific: "I request permanent deletion of my account and all associated personal data."</li>
              <li><strong>Document everything</strong> — Keep records of your requests and the platform's responses, in case you need to escalate to the ICO.</li>
            </ul>
          </section>

          {/* ── Cross-link insert ── */}
          <section className="mb-10 p-6 rounded-xl border border-border bg-muted/10">
            <p className="text-foreground leading-relaxed mb-3">
              A digital footprint check provides a holistic view of your online presence — including old accounts, exposed data, and public profiles that may need attention.
            </p>
            <Link
              to="/blog/what-is-digital-footprint-check"
              className="text-sm font-medium text-primary hover:underline"
            >
              → What Is a Digital Footprint Check?
            </Link>
          </section>

          {/* ── Prioritisation ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How to Prioritise Which Accounts to Delete First
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You don't need to delete every account simultaneously. Prioritise based on risk:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>High priority</strong> — Accounts with reused passwords, accounts on platforms that have been breached, accounts containing financial data or personal documents.</li>
              <li><strong>Medium priority</strong> — Social media profiles with your real name and photo, forum accounts with personal details, dating profiles.</li>
              <li><strong>Lower priority</strong> — Accounts with throwaway email addresses and no personal data, accounts on platforms you can confirm have been shut down.</li>
            </ul>
          </section>

          {/* ── Prevention ── */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Preventing Future Account Sprawl
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once you've cleaned up old accounts, adopt practices that prevent the problem from recurring:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Use a password manager to track every account you create</li>
              <li>Use email aliases or disposable addresses for non-essential signups</li>
              <li>Review and delete unused accounts quarterly</li>
              <li>Avoid "Sign in with Google/Facebook" for throwaway services — it creates persistent OAuth connections</li>
              <li>Run periodic{" "}
                <Link to="/scan" className="text-primary hover:underline">exposure scans</Link>{" "}
                to catch accounts you may have missed
              </li>
            </ul>
          </section>

          {/* ── Bottom CTA ── */}
          <section className="mb-12 p-8 rounded-2xl border-2 border-primary/30 bg-primary/5 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Discover Accounts You've Forgotten About
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              A free exposure scan identifies old accounts, public profiles, and data broker listings linked to your usernames and email addresses — so you can clean up your digital footprint.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Run Free Exposure Scan
            </Link>
          </section>

          {/* ── FAQ ── */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqData.map((f, i) => (
                <div key={i} className="border-b border-border/40 pb-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Related Articles ── */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4">Related Articles</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2">
              <li>
                <Link to="/blog/remove-from-data-brokers-uk" className="text-primary hover:underline">
                  How to Remove Yourself From Data Brokers (UK Guide)
                </Link>
              </li>
              <li>
                <Link to="/blog/what-is-digital-footprint-check" className="text-primary hover:underline">
                  What Is a Digital Footprint Check?
                </Link>
              </li>
              <li>
                <Link to="/blog/remove-address-from-google" className="text-primary hover:underline">
                  How to Remove Your Address From Google
                </Link>
              </li>
              <li>
                <Link to="/ai-answers-hub" className="text-primary hover:underline">
                  AI Answers Hub
                </Link>{" "}
                — Get answers to OSINT and digital privacy questions
              </li>
            </ul>
          </section>

          <GuideCitationBlock />
        </article>

        <RelatedToolsGrid currentPath="/blog/delete-old-accounts" />
      </main>

      <Footer />
    </>
  );
}
