import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentBreadcrumb } from "@/components/seo/ContentBreadcrumb";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import { CANONICAL_BASE } from "@/lib/seo/sitemapRoutes";

const PAGE_PATH = "/research/websites-where-usernames-reveal-profiles";
const TITLE = "500+ Websites Where Usernames Reveal Online Profiles | FootprintIQ";
const SHORT_TITLE = "Websites Where Usernames Are Used";
const DESCRIPTION =
  "Explore 500+ websites and platforms where usernames reveal online profiles. Learn how social media, gaming, developer, and dating platforms expose digital identities through username reuse.";

const faqItems = [
  {
    question: "How can I search a username online?",
    answer:
      "Enter the username into a cross-platform search tool like FootprintIQ. It checks over 500 public platforms simultaneously and returns a list of matching profiles with confidence scores — no login or technical knowledge required.",
  },
  {
    question: "Can you find someone's social media by username?",
    answer:
      "Yes. If a person uses the same handle across platforms, a username search can discover matching profiles on Instagram, TikTok, Reddit, Twitter, YouTube, and hundreds of other public sites.",
  },
  {
    question: "How do investigators track usernames?",
    answer:
      "OSINT investigators use automated tools to check a known username against hundreds of platform URL patterns. Matching profiles are then cross-referenced for shared names, photos, bios, and metadata to build a composite identity picture — using only publicly available data.",
  },
  {
    question: "Are usernames unique across platforms?",
    answer:
      "No. Each platform manages usernames independently, so the same handle can be registered by different people on different sites. This is why quality search tools use confidence scoring to distinguish genuine cross-platform matches from coincidental collisions.",
  },
  {
    question: "How can I protect my online identity?",
    answer:
      "Use a unique username on every platform, delete accounts you no longer use, tighten privacy settings, and run regular digital footprint scans to monitor where your information appears publicly.",
  },
  {
    question: "What is a digital footprint?",
    answer:
      "A digital footprint is the trail of publicly discoverable data you leave online — social media profiles, forum posts, account registrations, and any other information tied to your usernames, email addresses, or phone numbers.",
  },
  {
    question: "How many websites does FootprintIQ scan?",
    answer:
      "FootprintIQ scans over 500 public platforms in a single search — including social media, gaming networks, developer communities, forums, and dating sites.",
  },
  {
    question: "Is searching a username across websites legal?",
    answer:
      "Yes. Querying publicly accessible profile URLs is legal. FootprintIQ accesses only public data and never bypasses authentication, accesses private content, or interacts with platform APIs in unauthorised ways.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: SHORT_TITLE,
  description: DESCRIPTION,
  author: {
    "@type": "Organization",
    name: "FootprintIQ",
    url: "https://footprintiq.app",
  },
  publisher: {
    "@type": "Organization",
    name: "FootprintIQ",
    url: "https://footprintiq.app",
  },
  datePublished: "2026-03-07",
  dateModified: "2026-03-07",
  mainEntityOfPage: `${CANONICAL_BASE}${PAGE_PATH}`,
};

export default function WebsitesWhereUsernamesRevealProfiles() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${CANONICAL_BASE}${PAGE_PATH}`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={`${CANONICAL_BASE}${PAGE_PATH}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <Header />

      <main className="min-h-screen bg-background pt-24 pb-20 px-4">
        <article className="max-w-3xl mx-auto">
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Research", href: "/research" },
              { label: SHORT_TITLE },
            ]}
          />

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-medium text-foreground">FootprintIQ Research Team</span>
            <span>·</span>
            <time dateTime="2026-03-07">Published March 2026</time>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
            {SHORT_TITLE}
          </h1>

          <p className="text-lg text-muted-foreground mb-10">{DESCRIPTION}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {/* ──────────────────────────────────────────── */}
            <p>
              Every time you create an account on a website, you choose a username. That username becomes a
              publicly visible identifier — one that can be searched, indexed, and cross-referenced across the
              open web. What most people don't realise is that the same handle, reused across dozens of platforms,
              creates a traceable chain that connects social media profiles, gaming accounts, developer
              portfolios, forum posts, and even dating profiles into a single discoverable identity.
            </p>

            <p>
              FootprintIQ scans over 500 public platforms in a single search. This article explores the major
              categories of websites where usernames reveal online profiles — and explains why this matters for
              your privacy, security, and digital exposure.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>Why Usernames Reveal Online Identities</h2>

            <p>
              Usernames are the most widely reused identifier on the internet. Unlike email addresses — which
              users occasionally change — or phone numbers — which vary by country — a username is portable,
              memorable, and consistent. When you sign up for Instagram as <code>alexjones92</code>, you're
              likely to carry that same handle to Reddit, TikTok, Discord, GitHub, and every other service you
              join.
            </p>

            <p>
              This consistency is the foundation of cross-platform identity correlation. A username that appears
              on Instagram with a real name, on Reddit with personal opinions, on GitHub with a work email, and
              on a gaming forum with a location creates a composite identity profile that was never intentionally
              published as a whole. Each individual account reveals limited information; linked together through a
              shared username, they reveal far more than the user intended.
            </p>

            <p>
              Data brokers, OSINT investigators, and automated scraping systems exploit this pattern daily.
              They query publicly accessible profile URLs — <code>instagram.com/username</code>,{" "}
              <code>reddit.com/user/username</code>, <code>github.com/username</code> — and aggregate the
              results into sellable identity dossiers. Understanding which platforms expose your username is the
              first step toward controlling your digital footprint.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>Social Media Platforms</h2>

            <p>
              Social media networks are the most prolific source of username-based identity exposure. These
              platforms are designed to be discoverable — public profiles, searchable handles, and indexed pages
              are features, not bugs. The result is that social media usernames are among the easiest identifiers
              to search and cross-reference.
            </p>

            <p>Key platforms where usernames reveal public profiles include:</p>

            <ul>
              <li>
                <strong>Instagram</strong> — Profiles at <code>instagram.com/username</code>. Public by default
                for most account types. Displays real names, bios, photos, and follower counts.
              </li>
              <li>
                <strong>TikTok</strong> — Profiles at <code>tiktok.com/@username</code>. Public profiles are
                indexed by search engines. Video content, bios, and follower data are visible.
              </li>
              <li>
                <strong>Reddit</strong> — Profiles at <code>reddit.com/user/username</code>. Complete post and
                comment history is publicly visible unless manually deleted.
              </li>
              <li>
                <strong>Twitter / X</strong> — Profiles at <code>x.com/username</code>. Tweet history, likes,
                and bio details are public unless the account is protected.
              </li>
              <li>
                <strong>Pinterest</strong> — Profiles at <code>pinterest.com/username</code>. Pins and boards
                reveal interests, aesthetics, and sometimes purchase intent.
              </li>
              <li>
                <strong>Snapchat</strong> — Usernames are shared publicly on other platforms (bios, forums) and
                can be cross-referenced even though Snapchat itself doesn't host traditional profile pages.
              </li>
              <li>
                <strong>YouTube</strong> — Channel pages display video history, subscriptions, and community
                posts linked to usernames.
              </li>
              <li>
                <strong>LinkedIn</strong> — Professional profiles with real names, job history, education, and
                skills. Custom URLs often include the user's chosen handle.
              </li>
              <li>
                <strong>Threads</strong> — Meta's text platform uses Instagram handles, automatically extending
                username exposure to a new network.
              </li>
              <li>
                <strong>Mastodon</strong> — Federated social network where usernames are visible across instances
                and indexed by search engines.
              </li>
            </ul>

            <p>
              FootprintIQ checks all of these platforms — and hundreds more — in a single{" "}
              <Link to="/usernames" className="text-primary underline underline-offset-4 hover:text-primary/80">
                username search
              </Link>
              . The scan identifies where a handle appears publicly, with confidence scoring to distinguish
              genuine matches from coincidental username collisions.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>Gaming Platforms</h2>

            <p>
              Gaming networks are a significant source of username exposure, particularly among younger
              demographics. Gamers frequently carry the same handle across every platform they use — from PC
              gaming to console networks to mobile games — creating dense cross-platform chains.
            </p>

            <p>Platforms where gaming usernames reveal profiles include:</p>

            <ul>
              <li>
                <strong>Steam</strong> — Profiles at <code>steamcommunity.com/id/username</code>. Displays game
                libraries, playtime, friends lists, and community activity.
              </li>
              <li>
                <strong>Xbox / Microsoft</strong> — Gamertags are publicly searchable and reveal game history,
                achievements, and friend lists.
              </li>
              <li>
                <strong>PlayStation Network</strong> — PSN IDs are discoverable through third-party tracking
                sites even when Sony's own privacy settings are restrictive.
              </li>
              <li>
                <strong>Roblox</strong> — Profiles at <code>roblox.com/users/username</code>. Particularly
                important given the platform's young user base.
              </li>
              <li>
                <strong>Minecraft</strong> — Username lookup sites track name history, server activity, and
                skin data.
              </li>
              <li>
                <strong>Epic Games / Fortnite</strong> — Usernames are tracked by stats sites that display match
                history and performance data.
              </li>
              <li>
                <strong>Twitch</strong> — Profiles at <code>twitch.tv/username</code>. Streaming history, chat
                logs (via third-party loggers), and follower data are public.
              </li>
              <li>
                <strong>Discord</strong> — While Discord doesn't host traditional public profiles, usernames
                surface in public server directories, bot sites, and gaming leaderboards.
              </li>
              <li>
                <strong>Chess.com</strong> — Profiles display game history, ratings, and activity patterns.
              </li>
              <li>
                <strong>Kick</strong> and <strong>Rumble</strong> — Emerging streaming platforms with public
                profile pages tied to usernames.
              </li>
            </ul>

            <p>
              The gaming ecosystem is particularly vulnerable to username-based exposure because gamers tend to
              use the same handle everywhere. A username discovered on Steam can lead to Twitch, Discord, Reddit,
              and social media profiles — often revealing real names, locations, and personal details that the
              user never intended to connect to their gaming identity.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>Developer Communities</h2>

            <p>
              Developer and technical platforms present a unique exposure risk: they often contain professional
              information — real names, employer details, email addresses — alongside code contributions and
              project activity. A username on a developer platform can reveal far more about a person's
              professional identity than a social media profile.
            </p>

            <p>Key developer platforms where usernames reveal profiles include:</p>

            <ul>
              <li>
                <strong>GitHub</strong> — Profiles at <code>github.com/username</code>. Displays repositories,
                contributions, commit email addresses (sometimes personal or work emails), and organisation
                memberships.
              </li>
              <li>
                <strong>GitLab</strong> — Similar to GitHub with public profiles showing project activity and
                contribution history.
              </li>
              <li>
                <strong>Stack Overflow</strong> — Public profiles display question and answer history, reputation
                scores, and sometimes real names and locations.
              </li>
              <li>
                <strong>npm</strong> — Package registry where maintainer usernames link to published packages and
                sometimes personal websites.
              </li>
              <li>
                <strong>Docker Hub</strong> — Public profiles show container images and pull statistics.
              </li>
              <li>
                <strong>Hacker News</strong> — Profiles at <code>news.ycombinator.com/user?id=username</code>.
                Comment history and karma are fully public.
              </li>
              <li>
                <strong>Product Hunt</strong> — Profiles show products launched, upvotes, and professional
                affiliations.
              </li>
              <li>
                <strong>Keybase</strong> — Designed explicitly to link identities across platforms, making
                cross-referencing trivial by design.
              </li>
              <li>
                <strong>Dev.to</strong> and <strong>Hashnode</strong> — Blogging platforms where developer
                usernames connect to article history and professional branding.
              </li>
            </ul>

            <p>
              For developers, the risk is particularly acute because code contributions and commit histories
              often contain work email addresses. A{" "}
              <Link
                to="/reverse-username-search"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                reverse username lookup
              </Link>{" "}
              starting from a GitHub handle can reveal employer, location, and personal contact information in
              seconds.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>Forums And Online Communities</h2>

            <p>
              Forums and niche communities are often overlooked in digital footprint assessments, but they
              represent some of the most revealing sources of personal information. Unlike social media — where
              users curate their image — forum posts tend to be candid, detailed, and persistent.
            </p>

            <p>Forum platforms where usernames reveal profiles and post history include:</p>

            <ul>
              <li>
                <strong>Reddit</strong> — The largest forum platform globally. Complete post and comment history
                is public and searchable. Topics reveal interests, opinions, locations, and personal
                circumstances.
              </li>
              <li>
                <strong>Quora</strong> — Public Q&A platform where profiles display answer history, credentials,
                and sometimes real names and professional details.
              </li>
              <li>
                <strong>4chan / Boards</strong> — While posts are anonymous, usernames (tripcodes) used on some
                boards can be cross-referenced.
              </li>
              <li>
                <strong>Discourse-based forums</strong> — Thousands of community forums run on Discourse with
                public profile pages at <code>forum.example.com/u/username</code>.
              </li>
              <li>
                <strong>vBulletin and phpBB forums</strong> — Legacy forum software with public member profiles
                and post histories, often indexed by search engines for years.
              </li>
              <li>
                <strong>Substack</strong> — Newsletter platform where author usernames link to publication
                history and subscriber interactions.
              </li>
            </ul>

            <p>
              Forum data is particularly valuable for identity correlation because of its candid nature. A Reddit
              user who mentions their city in one post, their profession in another, and their age in a third has
              effectively published a detailed personal profile — all linked by a single username.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>Dating Platforms</h2>

            <p>
              Dating platforms represent one of the most sensitive categories of username exposure. Users on
              these platforms share personal information — photos, age, location, interests, and relationship
              status — that they typically wouldn't post on other social networks. When a dating profile username
              matches handles used on other platforms, the exposure risk is significant.
            </p>

            <p>Dating and relationship platforms where usernames surface include:</p>

            <ul>
              <li>
                <strong>Tinder</strong> — While Tinder doesn't use traditional usernames, profile information
                shared on Tinder often cross-references with other platforms via shared photos or linked
                Instagram accounts.
              </li>
              <li>
                <strong>Bumble</strong> — Profile details can be correlated with other platforms through
                username reuse and shared biographical information.
              </li>
              <li>
                <strong>OkCupid</strong> — Public usernames that can be searched and cross-referenced with other
                platform handles.
              </li>
              <li>
                <strong>Plenty of Fish</strong> — Usernames are often reused from other platforms, creating
                discoverable links.
              </li>
              <li>
                <strong>Kik</strong> — Frequently shared on dating platforms as a secondary contact method,
                creating cross-platform username chains.
              </li>
            </ul>

            <p>
              FootprintIQ's{" "}
              <Link
                to="/find-dating-profiles"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                dating profile search
              </Link>{" "}
              helps users understand where their personal information appears across dating and social platforms.
              If you use the same username on a dating app and on social media, those profiles can be linked by
              anyone with access to a username search tool.
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>How Investigators Use Username Searches</h2>

            <p>
              Open-source intelligence (OSINT) practitioners use username searches as a primary investigative
              technique. The process is straightforward: take a known username and check whether it appears on
              hundreds of platforms simultaneously. The results reveal cross-platform presence, which can then be
              analysed for identity correlation.
            </p>

            <p>The typical investigative workflow follows these steps:</p>

            <ol>
              <li>
                <strong>Identify a known username</strong> from a public source — a social media post, a data
                breach notification, a forum signature, or a website bio.
              </li>
              <li>
                <strong>Run a cross-platform scan</strong> using a tool like FootprintIQ that checks the handle
                against 500+ platform URL patterns simultaneously.
              </li>
              <li>
                <strong>Analyse matching profiles</strong> for correlation signals — shared names, photos, bios,
                locations, email addresses, and creation dates.
              </li>
              <li>
                <strong>Build a composite view</strong> by linking confirmed matches into an identity graph that
                shows how the subject's online presence connects across platforms.
              </li>
              <li>
                <strong>Assess exposure and risk</strong> based on the volume and sensitivity of information
                discovered across the matched profiles.
              </li>
            </ol>

            <p>
              This process is entirely legal when it accesses only publicly available data. Professional
              investigators — cybersecurity teams, fraud analysts, corporate security departments, and authorised
              research teams — use these techniques daily. FootprintIQ automates the most time-consuming part of
              this workflow: checking hundreds of platforms simultaneously rather than visiting each one manually.
            </p>

            <p>
              For a deeper understanding of how this technology works, read our{" "}
              <Link
                to="/guides/how-username-search-tools-work"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                technical guide to username search tools
              </Link>
              .
            </p>

            {/* ──────────────────────────────────────────── */}
            <h2>How To Scan Your Digital Footprint</h2>

            <p>
              Understanding your own exposure is the most effective step you can take toward protecting your
              digital identity. Most people underestimate how many platforms their username appears on — and how
              much information those platforms collectively reveal.
            </p>

            <p>FootprintIQ's{" "}
              <Link
                to="/digital-footprint-checker"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                digital footprint checker
              </Link>{" "}
              scans over 500 platforms in a single search. Enter a username and receive a comprehensive report
              showing every platform where that handle appears publicly. Results include confidence scoring,
              platform categorisation, and actionable remediation steps.
            </p>

            <p>To reduce your digital footprint:</p>

            <ul>
              <li>
                <strong>Audit your usernames</strong> — Run a scan to see where your handles appear across the
                web.
              </li>
              <li>
                <strong>Delete unused accounts</strong> — Every forgotten account is an exposure point. Remove
                accounts on platforms you no longer use.
              </li>
              <li>
                <strong>Use unique handles</strong> — Stop reusing the same username across platforms. Use a
                password manager to generate and store unique handles.
              </li>
              <li>
                <strong>Tighten privacy settings</strong> — On platforms you actively use, review privacy
                settings and limit what's publicly visible.
              </li>
              <li>
                <strong>Monitor regularly</strong> — Your digital footprint changes over time. Run scans
                quarterly to catch new exposure before it becomes entrenched.
              </li>
              <li>
                <strong>Request data broker removal</strong> — If your information appears on data aggregation
                sites, submit removal requests to reduce downstream exposure.
              </li>
            </ul>

            <p>
              The platforms listed in this article represent only a fraction of the websites where usernames
              reveal online profiles. New platforms launch constantly, and existing platforms change their privacy
              defaults regularly. A proactive approach — scanning, auditing, and remediating — is the only
              reliable way to maintain control over your digital identity.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-12 p-6 rounded-xl border border-border bg-card text-center">
            <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Scan Your Username Across 500+ Platforms
            </h3>
            <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
              Find out where your username appears publicly. Free, ethical, and privacy-first.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Run a Free Scan
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* FAQ */}
          {faqItems.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqItems.map((faq, i) => (
                  <details key={i} className="group p-4 rounded-xl border border-border bg-card">
                    <summary className="font-medium text-foreground cursor-pointer list-none flex items-center justify-between">
                      {faq.question}
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-2" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <RelatedLinks
            paths={[
              "/usernames",
              "/reverse-username-search",
              "/digital-footprint-checker",
              "/username-search-engine",
              "/research/username-reuse-statistics",
            ]}
          />
        </article>
      </main>

      <Footer />
    </>
  );
}
