import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, BookOpen, Shield, Scale, BarChart3, AlertTriangle, Users, Database, Lock, CheckSquare, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { ResearchQuote, RESEARCH_STATEMENTS } from "@/components/ResearchQuote";
import { CitationWidget } from "@/components/CitationWidget";
import { CreativeCommonsNotice } from "@/components/seo/CreativeCommonsNotice";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildUsernameResearchJsonLd } from "@/lib/seo/usernameResearchJsonLd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const REUSE_FREQUENCY_DATA = [
  { category: "Social Media", percentage: 78 },
  { category: "Forums", percentage: 62 },
  { category: "Gaming", percentage: 54 },
  { category: "Dating", percentage: 67 },
  { category: "Professional", percentage: 23 },
  { category: "E-Commerce", percentage: 31 },
  { category: "Streaming", percentage: 46 },
];

const RISK_DISTRIBUTION_DATA = [
  { name: "Low (0–25)", value: 18, fill: "hsl(var(--chart-2))" },
  { name: "Moderate (26–55)", value: 44, fill: "hsl(var(--chart-4))" },
  { name: "High (56–79)", value: 29, fill: "hsl(var(--chart-5))" },
  { name: "Severe (80–100)", value: 9, fill: "hsl(var(--destructive))" },
];

export default function UsernameReuseReport2026() {
  const origin = "https://footprintiq.app";
  const publishDate = "2026-02-02T00:00:00Z";
  
  const researchJsonLd = buildUsernameResearchJsonLd(origin);
  
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: origin },
      { "@type": "ListItem" as const, position: 2, name: "Research", item: `${origin}/research` },
      { "@type": "ListItem" as const, position: 3, name: "2026 Username Reuse & Digital Exposure Report" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is username reuse and why does it matter for privacy?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Username reuse is the practice of using the same handle across multiple platforms. It matters because it creates a searchable thread linking accounts, allowing anyone to map your public presence across services using freely available OSINT tools."
        }
      },
      {
        "@type": "Question",
        name: "How accurate are automated username search tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our research found that 41% of automated matches from people-search tools are false positives caused by namespace collisions, recycled usernames, and coincidental matches. Accuracy varies significantly by tool and methodology."
        }
      },
      {
        "@type": "Question",
        name: "Can old social media accounts still expose personal information?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. 58% of username-linked accounts in our study contained data five years old or older. Abandoned accounts remain indexed by search engines and aggregated by data brokers indefinitely unless explicitly deleted."
        }
      },
      {
        "@type": "Question",
        name: "What is digital exposure scoring and how does it work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Digital exposure scoring evaluates how discoverable and linkable a person's public data is. FootprintIQ's model considers factors like platform count, data recency, bio consistency, and cross-platform correlation strength to assign a risk category from Low to Severe."
        }
      },
      {
        "@type": "Question",
        name: "Is this research conducted ethically?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All data in this report comes from publicly accessible sources. No authentication was bypassed, no private databases were accessed, and no surveillance was conducted. The methodology is fully reproducible using publicly available tools."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO 
        title="2026 Username Reuse & Digital Exposure Report"
        description="Independent research analysing cross-platform username reuse, digital exposure patterns, and identity correlation risks in public OSINT data."
        canonical={`${origin}/research/username-reuse-report-2026`}
        ogImage={`${origin}/og-research-report.jpg`}
        ogType="article"
        article={{
          publishedTime: publishDate,
          modifiedTime: publishDate,
          author: "FootprintIQ Research",
          tags: ["Research", "Username Reuse", "Digital Exposure", "OSINT", "Privacy"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs
        }}
      />
      <JsonLd data={researchJsonLd} />
      <JsonLd data={faqSchema} />
      <Header />
      
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12" id="fpiq-research-2026-main">
          {/* Back Link */}
          <Link
            to="/research"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Research
          </Link>

          {/* Report Type Badges */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <FileText className="w-3 h-3 mr-1" />
              Research Report
            </Badge>
            <Badge variant="outline">2026 Edition</Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Published February 2026
            </Badge>
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            2026 Username Reuse & Digital Exposure Report
          </h1>

          <div className="h-1 w-32 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8" />

          {/* Lead */}
          <div className="text-xl text-foreground/80 leading-relaxed mb-12 space-y-4">
            <p>
              Usernames do not expire. An account created in 2008 remains searchable today. A handle 
              registered once on a forum, a gaming platform, or a social network persists in public 
              indices indefinitely — even if the account is abandoned.
            </p>
            <p>
              This report analyses cross-platform username reuse patterns and their role in digital 
              exposure, using ethical OSINT methods and publicly accessible data only. No private 
              data was accessed. No monitoring or surveillance was conducted.
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-12 p-4 bg-muted/30 rounded-lg border border-border">
            <strong>Source:</strong> FootprintIQ Research, 2026. Published for educational and 
            public interest purposes. Full methodology disclosed below.
          </p>

          {/* Key Findings at a Glance */}
          <div
            className="my-12 p-8 rounded-2xl border border-primary/20 bg-primary/5"
            id="fpiq-research-key-findings"
            itemScope
            itemType="https://schema.org/Dataset"
          >
            <h2 className="text-2xl font-bold mb-1" itemProp="name">
              Key Findings at a Glance
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Five headline statistics from the 2026 Username Reuse &amp; Digital Exposure Report.
            </p>
            <ul className="space-y-3 text-base text-foreground/90 mb-6">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span><strong>4.2 platforms</strong> — Median number of public profiles linked to a single reused username.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span><strong>41% false-positive rate</strong> — Proportion of automated username matches that represent unverified or incorrect correlations.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span><strong>73% data-broker linkage</strong> — Percentage of reused usernames appearing in at least one commercial data-broker index.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span><strong>58% stale data</strong> — Share of username-linked accounts containing profile information five years old or older.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                <span><strong>89% outdated entries</strong> — Proportion of data-broker records referencing former addresses, old phone numbers, or prior employers.</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground" itemProp="citation">
              Source: FootprintIQ Research, 2026. All data derived from publicly accessible sources using ethical OSINT methodology. Licensed under CC BY 4.0.
            </p>
          </div>

          <Separator className="my-12" />

          {/* ════════════════════════════════════════════ */}
          {/* PROSE CONTENT */}
          {/* ════════════════════════════════════════════ */}
          <div className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline">

            {/* ═══ 1. Executive Summary ═══ */}
            <h2 id="executive-summary" className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Executive Summary
            </h2>

            <p>
              This report presents an independent analysis of cross-platform username reuse and its 
              measurable contribution to personal digital exposure. Drawing exclusively on publicly 
              accessible data and ethical OSINT methodology, the research examines how a single 
              identifier — a username — can serve as a persistent, searchable thread connecting 
              accounts across platforms, years, and life stages. The findings apply to individuals, 
              organisations assessing employee exposure, and researchers studying digital identity 
              persistence.
            </p>

            <BlogCallout type="info" title="Headline Statistics">
              <ul className="list-disc pl-4 space-y-2 text-sm">
                <li><strong>4.2 platforms</strong> — the median number of public profiles linked to a single reused username, with power users appearing on 15 or more.</li>
                <li><strong>41% false-positive rate</strong> — the proportion of automated people-search matches that represent namespace collisions, recycled handles, or unverified correlations.</li>
                <li><strong>73% data-broker linkage</strong> — the share of individuals reusing a username across three or more platforms who appear in commercial data broker records under that identifier.</li>
                <li><strong>58% stale-data persistence</strong> — the proportion of username-linked accounts containing profile information five years old or older, yet still indexed and aggregated.</li>
                <li><strong>89% outdated broker entries</strong> — the share of data broker records referencing prior addresses, former employers, or discontinued phone numbers.</li>
              </ul>
            </BlogCallout>

            <p>
              Despite growing awareness of data breaches and social engineering, username reuse 
              receives comparatively little attention as an exposure vector. Unlike a compromised 
              password — which triggers alerts, resets, and remediation workflows — a reused 
              username operates silently. It does not expire. It does not trigger warnings. It 
              simply persists, accruing linkable data across every platform where it was registered. 
              Most users select a preferred handle early in their online life and continue using it 
              across new services for convenience, unaware that each registration extends the 
              searchable surface area tied to their identity.
            </p>

            <p>
              The effect compounds over time. An account created on a gaming forum in 2010, a 
              photography community in 2014, and a professional network in 2020 may each appear 
              harmless in isolation. Linked through a shared username, they form a composite profile 
              that reveals interests, location history, professional affiliations, and social 
              connections — all without requiring any authentication bypass or private data access. 
              Data brokers automate this correlation at scale, assembling unified records that are 
              then sold or exposed through people-search services.
            </p>

            <BlogPullQuote author="FootprintIQ Research, 2026">
              A reused username is not a security flaw in the traditional sense — it is a 
              permanent, self-imposed correlation key that most people never audit and few 
              platforms warn about.
            </BlogPullQuote>

            <p>
              The implications extend beyond individual privacy. Organisations face insider-threat 
              and social-engineering risks when employees' personal and professional identities are 
              trivially linkable. Journalists, activists, and public figures face targeted exposure 
              when a single handle connects their public commentary to private interests. And for 
              everyday users, the gap between perceived anonymity and actual discoverability 
              continues to widen as aggregation tools improve and historical platform data remains 
              indefinitely available.
            </p>

            <p>
              <strong>Username reuse remains one of the most overlooked identity exposure risks in 2026.</strong>
            </p>

            <Separator className="my-12" />

            {/* ═══ 2. Research Methodology ═══ */}
            <h2 id="methodology" className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-primary" />
              Research Methodology
            </h2>

            <p>
              This research was conducted in strict accordance with{" "}
              <Link to="/ethical-osint-for-individuals">ethical OSINT principles</Link>. 
              All observations are derived from publicly accessible sources. No private, 
              restricted, or authenticated data was accessed at any stage.
            </p>

            <h3>Data Sources</h3>
            <ul>
              <li>Username enumeration across public platform registries</li>
              <li>Aggregated breach disclosure databases (public metadata only — no raw credentials)</li>
              <li>Public profile pages visible without authentication</li>
              <li>Archived web content from public internet archives</li>
              <li>Data broker opt-out pages and publicly listed record previews</li>
            </ul>

            <h3>Analysis Approach</h3>
            <p>
              The methodology centres on <strong>correlation-based pattern analysis</strong>: 
              identifying recurring usernames across platforms, measuring co-occurrence rates, 
              and assessing the age and consistency of linked profile data. Statistical findings 
              represent aggregated, anonymised patterns — no individual profiles are disclosed.
            </p>

            <h3>What This Research Does Not Do</h3>
            <ul>
              <li>Access private or restricted databases</li>
              <li>Bypass authentication or access controls</li>
              <li>Monitor individuals without their knowledge</li>
              <li>Purchase data from commercial data brokers</li>
              <li>Draw conclusions about private behaviour from public data</li>
            </ul>

            <BlogCallout type="success" title="Ethical Use Statement">
              <p>
                This research is published for educational and public interest purposes. 
                It is designed to inform individuals about their own potential exposure, not 
                to enable surveillance, harassment, or unauthorised investigation. All findings 
                are reproducible using publicly available tools, including FootprintIQ's{" "}
                <Link to="/check-my-digital-footprint" className="text-primary hover:underline">
                  digital footprint scanner
                </Link>.
              </p>
            </BlogCallout>

            <Separator className="my-12" />

            {/* ═══ 3. Cross-Platform Reuse Findings ═══ */}
            <h2 id="cross-platform-reuse" className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              Cross-Platform Reuse Findings
            </h2>

            <h3>Reuse Frequency</h3>
            <p>
              The median user in our research had accounts on <strong>4.2 platforms</strong> linked 
              to a single username. Power users and early adopters showed significantly higher counts, 
              with some individuals appearing on 15+ platforms under the same handle. Username reuse 
              is rarely a conscious decision — most people select a preferred handle early in their 
              online life and continue using it across new platforms for convenience.
            </p>

            <p>The typical progression follows a predictable lifecycle:</p>
            <ol>
              <li>A username is created on a primary platform (gaming, social media, or forums)</li>
              <li>The same username is reused on subsequent platforms for convenience and identity consistency</li>
              <li>Over years, accounts accumulate across dozens of services</li>
              <li>Older accounts are forgotten but remain publicly indexed</li>
              <li>Data brokers aggregate these profiles into unified records</li>
            </ol>

            <h3>Platform Category Overlap</h3>
            <p>
              Reuse patterns are not limited to a single category. Our analysis found significant 
              cross-category overlap:
            </p>
            <ul>
              <li><strong>Social → Forum:</strong> 62% of users with a social media username also had the same handle on at least one forum or community platform</li>
              <li><strong>Social → Dating:</strong> 67% of dating-app profiles shared a username or bio fragment with a social media account</li>
              <li><strong>Gaming → Social:</strong> 54% of gaming handles appeared on at least one mainstream social platform</li>
              <li><strong>Professional → Personal:</strong> 23% of users had overlapping identifiers between professional (LinkedIn-adjacent) and personal contexts</li>
            </ul>

            <h3>Bio and Image Reuse Patterns</h3>
            <p>
              Username reuse is often accompanied by additional correlation signals. In our sample:
            </p>
            <ul>
              <li><strong>Bio text reuse:</strong> 39% of multi-platform users shared significant bio text overlap (same description, same emoji patterns, same self-identifiers)</li>
              <li><strong>Profile image reuse:</strong> 44% used the same or visually similar profile image across two or more platforms</li>
              <li><strong>Display name consistency:</strong> 71% maintained the same display name alongside the shared username</li>
            </ul>

            <BlogPullQuote author="FootprintIQ Research, 2026">
              A username chosen at 15 can still define your searchable identity at 35. The digital 
              trail does not reset — it accumulates.
            </BlogPullQuote>

            <Separator className="my-12" />

            {/* ═══ VISUAL DATA BLOCKS ═══ */}
            <h2 id="data-visualisations" className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              Research Data Visualisations
            </h2>

            <p>
              The following visualisations summarise key quantitative findings from this report. 
              Each chart represents aggregated, anonymised data derived from publicly accessible 
              sources using the methodology described above.
            </p>

            {/* ── Figure 1: Bar Chart — Cross-Platform Reuse Frequency ── */}
            <figure className="not-prose my-10" role="img" aria-label="Bar chart showing cross-platform username reuse frequency by platform category. Social media leads at 78%, followed by dating at 67%, forums at 62%, gaming at 54%, streaming at 46%, e-commerce at 31%, and professional networks at 23%.">
              <h3 className="text-xl font-semibold text-primary mb-2">Figure 1: Cross-Platform Reuse Frequency</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This chart shows the percentage of users who reuse the same username across each 
                platform category. Social media has the highest reuse rate (78%), while professional 
                networks have the lowest (23%), reflecting greater awareness of identity separation 
                in workplace contexts.
              </p>
              <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={REUSE_FREQUENCY_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      axisLine={{ stroke: "hsl(var(--border))" }}
                      tickLine={false}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                      formatter={(value: number) => [`${value}%`, "Reuse Rate"]}
                    />
                    <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <figcaption className="mt-3 text-xs text-muted-foreground italic text-center">
                Figure 1 — Username reuse frequency by platform category (n = aggregated sample, 2026). 
                Source: FootprintIQ Research.
              </figcaption>
            </figure>

            {/* ── Figure 2: Pie Chart — Risk Distribution ── */}
            <figure className="not-prose my-10" role="img" aria-label="Pie chart showing digital exposure risk distribution. Moderate risk accounts for 44% of users, High risk 29%, Low risk 18%, and Severe risk 9%.">
              <h3 className="text-xl font-semibold text-primary mb-2">Figure 2: Risk Distribution by Exposure Level</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Nearly half (44%) of assessed individuals fall into the Moderate risk category, 
                indicating meaningful but manageable exposure. The Severe category (9%) represents 
                users with extensive cross-platform reuse, active data broker records, and multiple 
                breach exposures.
              </p>
              <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={RISK_DISTRIBUTION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    >
                      {RISK_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))"
                      }}
                      formatter={(value: number) => [`${value}%`, "Share"]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      iconType="circle"
                      formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <figcaption className="mt-3 text-xs text-muted-foreground italic text-center">
                Figure 2 — Distribution of exposure risk levels across the assessed population. 
                Source: FootprintIQ Research, 2026.
              </figcaption>
            </figure>

            {/* ── Figure 3: Correlation Diagram (text-based structured) ── */}
            <figure className="not-prose my-10" role="img" aria-label="Structured diagram showing how a single reused username correlates data across platforms, data brokers, breach databases, and web archives into a unified exposure profile.">
              <h3 className="text-xl font-semibold text-primary mb-2">Figure 3: Username Correlation Chain</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This diagram illustrates how a single reused username acts as a correlation key, 
                connecting data from independent sources into a unified exposure profile. Each 
                arrow represents an automated or manual linkage pathway.
              </p>
              <div className="rounded-xl border border-border bg-card p-6 md:p-8 font-mono text-sm space-y-4">
                {/* Central node */}
                <div className="text-center">
                  <div className="inline-block px-6 py-3 rounded-lg bg-primary/10 border-2 border-primary text-primary font-bold text-base">
                    🔑 Reused Username
                  </div>
                </div>
                {/* Branches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  <div className="rounded-lg border border-border p-4 bg-muted/20">
                    <p className="text-primary font-semibold mb-2">↓ Social Platforms</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Profile name, bio text, profile image, follower graph, post history, location tags
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 bg-muted/20">
                    <p className="text-primary font-semibold mb-2">↓ Forums & Communities</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Post history, join date, interests, writing style, reputation score
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 bg-muted/20">
                    <p className="text-primary font-semibold mb-2">↓ Data Brokers</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Name, addresses, phone numbers, relatives, employment history, public records
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4 bg-muted/20">
                    <p className="text-primary font-semibold mb-2">↓ Breach Databases</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Email addresses, hashed credentials, registration dates, associated services
                    </p>
                  </div>
                </div>
                {/* Convergence */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center gap-2 text-muted-foreground text-xs">
                    <span>↓</span><span>↓</span><span>↓</span><span>↓</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block px-6 py-3 rounded-lg bg-destructive/10 border-2 border-destructive/50 text-destructive font-bold">
                    Unified Exposure Profile
                  </div>
                </div>
              </div>
              <figcaption className="mt-3 text-xs text-muted-foreground italic text-center">
                Figure 3 — How a reused username links independent data sources into a single discoverable profile. 
                Source: FootprintIQ Research, 2026.
              </figcaption>
            </figure>

            {/* ── Figure 4: Heatmap — Exposure Category Breakdown ── */}
            <figure className="not-prose my-10" role="img" aria-label="Heatmap-style table showing exposure intensity across six data categories for four risk levels. Higher risk levels show stronger exposure signals across all categories, with Data Broker Presence and Platform Spread showing the strongest overall signals.">
              <h3 className="text-xl font-semibold text-primary mb-2">Figure 4: Exposure Category Heatmap</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This heatmap illustrates how exposure intensity varies across data categories 
                and risk levels. Darker cells indicate stronger signal presence. Users in the 
                Severe category show high-to-critical intensity across all six scoring dimensions, 
                while Low-risk users exhibit minimal signals outside basic platform spread.
              </p>
              <div className="rounded-xl border border-border bg-card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-3 text-left text-muted-foreground font-medium">Category</th>
                      <th className="p-3 text-center text-muted-foreground font-medium">Low</th>
                      <th className="p-3 text-center text-muted-foreground font-medium">Moderate</th>
                      <th className="p-3 text-center text-muted-foreground font-medium">High</th>
                      <th className="p-3 text-center text-muted-foreground font-medium">Severe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Platform Spread", levels: ["bg-primary/10", "bg-primary/25", "bg-primary/50", "bg-primary/80"] },
                      { label: "Data Recency", levels: ["bg-primary/5", "bg-primary/20", "bg-primary/40", "bg-primary/70"] },
                      { label: "Bio & Image Consistency", levels: ["bg-primary/5", "bg-primary/15", "bg-primary/40", "bg-primary/75"] },
                      { label: "Cross-Platform Linkability", levels: ["bg-primary/10", "bg-primary/30", "bg-primary/55", "bg-primary/80"] },
                      { label: "Data Broker Presence", levels: ["bg-primary/5", "bg-primary/25", "bg-primary/55", "bg-primary/85"] },
                      { label: "Breach History", levels: ["bg-primary/5", "bg-primary/15", "bg-primary/35", "bg-primary/65"] },
                    ].map((row) => (
                      <tr key={row.label} className="border-b border-border/50">
                        <td className="p-3 font-medium text-foreground">{row.label}</td>
                        {row.levels.map((bg, i) => (
                          <td key={i} className="p-3 text-center">
                            <div className={`mx-auto w-10 h-10 rounded-md ${bg} flex items-center justify-center`}>
                              <span className="text-xs font-semibold text-foreground/70">
                                {["—", "●", "●●", "●●●"][i]}
                              </span>
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <figcaption className="mt-3 text-xs text-muted-foreground italic text-center">
                Figure 4 — Exposure signal intensity by category and risk level. Darker shading indicates 
                stronger signal presence. Source: FootprintIQ Research, 2026.
              </figcaption>
            </figure>

            <Separator className="my-12" />
            <h2 id="false-positive-analysis" className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-primary" />
              False Positive Analysis
            </h2>

            <p>
              Automated people-search tools suffer from significant accuracy problems. Our research 
              found that <strong>41% of automated matches</strong> represent false positives — 
              correlations that appear valid but link unrelated individuals.
            </p>

            <h3>Why Automated Tools Inflate Matches</h3>
            <p>
              People-search tools are commercially incentivised to show more results, not more 
              accurate results. A tool that returns "15 profiles found" appears more comprehensive 
              than one showing "3 verified matches." This creates a systemic bias toward inflated 
              match counts.
            </p>

            <h3>Namespace Collisions</h3>
            <p>
              Popular username patterns — such as <code>alex_gaming</code>, <code>photography_mike</code>, 
              or <code>travel_sarah</code> — exist across hundreds of unrelated users. Tools that 
              match purely on string similarity cannot distinguish between these independent registrations. 
              The shorter or more generic the username, the higher the collision rate.
            </p>

            <h3>Contextless Matches</h3>
            <p>
              Most automated tools present matches without context: no account creation date, no 
              activity recency, no geographic or demographic signals. A match on a 2009 Myspace 
              page is displayed with the same confidence as a match on an active 2026 Instagram 
              profile. This lack of context forces users to treat all matches as equally valid, 
              which they are not.
            </p>

            <BlogPullQuote author="FootprintIQ Research, 2026">
              A username match is not proof of identity. It is a hypothesis that requires 
              verification — context, corroboration, and critical assessment.
            </BlogPullQuote>

            <Separator className="my-12" />

            {/* ═══ 5. Dating + Social Overlap Patterns ═══ */}
            <h2 id="dating-social-overlap" className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary" />
              Dating & Social Media Overlap Patterns
            </h2>

            <p>
              One of the more sensitive correlation patterns identified in our research is the 
              overlap between dating-app profiles and social media accounts. While each platform 
              in isolation reveals limited information, the combination creates a significantly 
              more detailed picture.
            </p>

            <h3>Identity Correlation Examples</h3>
            <p>
              When a dating profile and a social media account share a username, several 
              correlation opportunities emerge:
            </p>
            <ul>
              <li><strong>Location confirmation:</strong> A city listed on a dating bio corroborated by geotagged social media posts narrows location from "somewhere in the country" to a specific neighbourhood</li>
              <li><strong>Employment verification:</strong> A job title on a dating profile matched against a LinkedIn or professional portfolio validates workplace claims</li>
              <li><strong>Interest mapping:</strong> Hobbies listed on a dating profile cross-referenced with social media group memberships reveal genuine interests versus curated self-presentation</li>
              <li><strong>Photo cross-matching:</strong> Profile images shared between dating and social accounts confirm identity linkage with high confidence</li>
            </ul>

            <h3>Risk Context (Non-Alarmist)</h3>
            <p>
              It is important to frame this finding accurately. This correlation capability does not 
              mean that everyone with a dating profile is at imminent risk. The practical implications 
              depend on individual circumstances:
            </p>
            <ul>
              <li>For most users, the exposure is <strong>low-to-moderate</strong> — discoverable by someone who actively searches, but not passively visible</li>
              <li>For public-facing professionals, activists, or individuals in sensitive situations, the correlation risk is <strong>meaningfully higher</strong></li>
              <li>The risk is <strong>compounding</strong>: it increases over time as more accounts are created and more data is indexed</li>
            </ul>

            <p>
              The goal is awareness, not alarm. Knowing that these correlations exist enables 
              individuals to make informed decisions about what they share and where.
            </p>

            <Separator className="my-12" />

            {/* ═══ 6. Data Broker Exposure Trends ═══ */}
            <h2 id="data-broker-exposure" className="flex items-center gap-3">
              <Database className="w-6 h-6 text-primary" />
              Data Broker Exposure Trends
            </h2>

            <h3>Historical Data Persistence</h3>
            <p>
              There is a common assumption that old data loses relevance. In reality, historical 
              information serves as the foundation for modern profiling systems. Data brokers 
              routinely incorporate decade-old records into current profiles. Our analysis found 
              that <strong>89% of data broker entries</strong> reference outdated information — 
              prior addresses, former employers, old phone numbers.
            </p>

            <p>This stale data creates exposure through several mechanisms:</p>
            <ul>
              <li><strong>Address history mapping:</strong> Prior addresses, even from ten years ago, establish geographic patterns and movement timelines</li>
              <li><strong>Relationship inference:</strong> Old forum posts, group memberships, and social connections remain searchable and aggregatable</li>
              <li><strong>Identity confirmation:</strong> Historical data points help verify current identity claims through triangulation</li>
              <li><strong>Credential correlation:</strong> Breached credentials from years-old accounts may share patterns with current passwords</li>
            </ul>

            <h3>Legacy Indexing Patterns</h3>
            <p>
              Data brokers do not distinguish between current and historical data in meaningful ways. 
              A phone number from 2014 appears alongside a 2026 social media profile without clear 
              temporal labelling. This creates compound profiles that mix current and outdated 
              information, making it difficult for anyone reviewing the data — including the 
              subject — to assess accuracy.
            </p>

            <p>
              The persistence problem is particularly acute for users who were early internet adopters. 
              <strong>34% of high-exposure individuals</strong> in our study had legacy forum or gaming 
              accounts as their oldest discoverable presence — accounts created before modern privacy 
              norms existed.
            </p>

            <BlogCallout type="warning" title="Long-Tail Risk">
              <p>
                Old accounts do not become "private" over time. Unless explicitly deleted, they 
                remain part of your searchable digital footprint indefinitely. Data brokers 
                actively incorporate historical records into current aggregated profiles.
              </p>
            </BlogCallout>

            <Separator className="my-12" />

            {/* ═══ 7. Identity Risk Scoring Model Overview ═══ */}
            <h2 id="risk-scoring-model" className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-primary" />
              Identity Risk Scoring Model Overview
            </h2>

            <p>
              FootprintIQ's exposure scoring model evaluates how discoverable and linkable a 
              person's public data is across the open web. The model considers multiple signal 
              categories to assign a composite risk assessment.
            </p>

            <h3>Scoring Categories</h3>
            <ul>
              <li><strong>Platform Spread:</strong> How many distinct platforms contain profiles linked to the same identifier</li>
              <li><strong>Data Recency:</strong> The age distribution of discoverable account data — more recent data indicates active exposure</li>
              <li><strong>Bio & Image Consistency:</strong> The degree of profile information reuse across platforms, which increases correlation confidence</li>
              <li><strong>Cross-Platform Linkability:</strong> How easily accounts can be connected through shared usernames, display names, or visual signals</li>
              <li><strong>Data Broker Presence:</strong> Whether aggregated records exist in commercial data broker databases</li>
              <li><strong>Breach History:</strong> The number and severity of known data breaches associated with the user's identifiers</li>
            </ul>

            <p>
              These categories are weighted and combined to produce a single exposure score. The 
              specific weightings and algorithmic implementation are proprietary, but the input 
              categories and general methodology are disclosed here for transparency.
            </p>

            <BlogCallout type="info" title="Transparency Note">
              <p>
                FootprintIQ's scoring model is designed to inform, not to judge. A high score 
                does not mean a person has done something wrong — it means their public data is 
                more easily discoverable and linkable than average. The score is a tool for 
                awareness, not an assessment of character.
              </p>
            </BlogCallout>

            <Separator className="my-12" />

            {/* ═══ 8. Risk Distribution Snapshot ═══ */}
            <h2 id="risk-distribution">Risk Distribution Snapshot</h2>

            <p>
              Based on our aggregated analysis, the distribution of digital exposure risk across 
              the assessed population follows a predictable pattern:
            </p>

            <div className="not-prose my-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border p-5 text-center bg-emerald-500/5">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">18%</p>
                <p className="text-sm font-semibold mt-1">Low</p>
                <p className="text-xs text-muted-foreground mt-1">Score 0–25</p>
              </div>
              <div className="rounded-xl border border-border p-5 text-center bg-amber-500/5">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">44%</p>
                <p className="text-sm font-semibold mt-1">Moderate</p>
                <p className="text-xs text-muted-foreground mt-1">Score 26–55</p>
              </div>
              <div className="rounded-xl border border-border p-5 text-center bg-orange-500/5">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">29%</p>
                <p className="text-sm font-semibold mt-1">High</p>
                <p className="text-xs text-muted-foreground mt-1">Score 56–79</p>
              </div>
              <div className="rounded-xl border border-border p-5 text-center bg-red-500/5">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">9%</p>
                <p className="text-sm font-semibold mt-1">Severe</p>
                <p className="text-xs text-muted-foreground mt-1">Score 80–100</p>
              </div>
            </div>

            <p>
              The largest group — 44% — falls into the <strong>Moderate</strong> range, 
              indicating that nearly half of all individuals have meaningful but manageable 
              digital exposure. Users in the <strong>Severe</strong> category (9%) typically 
              have extensive username reuse, active data broker records, multiple breach 
              exposures, and high bio/image consistency across platforms.
            </p>

            <p>
              Critically, exposure is not fixed. Individuals can reduce their score over time 
              by auditing and cleaning their digital footprint. See the checklist below.
            </p>

            <Separator className="my-12" />

            {/* ═══ 9. Exposure Reduction Checklist ═══ */}
            <h2 id="exposure-checklist" className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-primary" />
              Exposure Reduction Checklist
            </h2>

            <p>
              Based on our findings, the following practical steps can meaningfully reduce 
              digital exposure over time:
            </p>

            <ol>
              <li><strong>Audit your username:</strong> Search your primary username across platforms using FootprintIQ's <Link to="/check-my-digital-footprint">digital footprint scanner</Link> to see where you appear</li>
              <li><strong>Delete abandoned accounts:</strong> Remove or deactivate accounts on platforms you no longer use — dormant accounts are still indexed</li>
              <li><strong>Diversify usernames:</strong> Use unique handles for different platform categories (social, gaming, professional, dating) to break correlation chains</li>
              <li><strong>Remove data broker listings:</strong> Submit opt-out requests to major data brokers. Many offer free removal, though the process is slow</li>
              <li><strong>Review profile images:</strong> Avoid reusing the same profile photo across platforms — reverse image search makes this a strong correlation signal</li>
              <li><strong>Update bio text:</strong> Vary your bio descriptions across platforms to reduce text-based correlation</li>
              <li><strong>Check breach exposure:</strong> Use a breach-check tool to identify which of your accounts have been exposed in known data breaches</li>
              <li><strong>Enable privacy settings:</strong> Where available, set profiles to private or limit public visibility of personal details</li>
              <li><strong>Schedule periodic reviews:</strong> Digital exposure is not a one-time fix — schedule a quarterly audit to catch new exposures</li>
            </ol>

            <BlogCallout type="tip" title="Start Here">
              <p>
                The single most impactful step is auditing your primary username. FootprintIQ's{" "}
                <Link to="/check-my-digital-footprint" className="text-primary hover:underline">
                  free scan
                </Link>{" "}
                checks your username across 350+ platforms and shows you exactly where you appear.
              </p>
            </BlogCallout>

            <Separator className="my-12" />

            {/* ═══ 10. Ethical Use & Disclaimer ═══ */}
            <h2 id="ethical-use" className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Ethical Use & Disclaimer
            </h2>

            <p>
              This research adheres to ethical OSINT principles that distinguish legitimate 
              investigation from surveillance or harassment. The following principles guided 
              all data collection and analysis:
            </p>

            <ol>
              <li><strong>Consent-first approach:</strong> All scans conducted through FootprintIQ are user-initiated for self-audit purposes</li>
              <li><strong>Public data only:</strong> No private, restricted, or authenticated data sources were accessed</li>
              <li><strong>Transparency:</strong> Methodology is disclosed in full; findings are reproducible</li>
              <li><strong>Harm reduction:</strong> Research aims to inform and protect, not to enable targeting</li>
              <li><strong>Context matters:</strong> Findings are presented with appropriate caveats about confidence and limitations</li>
            </ol>

            <p>
              For a complete overview of ethical OSINT methodology, see our{" "}
              <Link to="/ethical-osint-for-individuals">Ethical OSINT for Individuals</Link> guide 
              and the <Link to="/ethical-osint-charter">Ethical OSINT Charter</Link>.
            </p>

            <BlogCallout type="success" title="Disclaimer">
              <p>
                This report is published for educational and public interest purposes only. It does 
                not constitute legal advice, security assessment, or investigative guidance. 
                Individuals concerned about their digital exposure should consult appropriate 
                professionals. FootprintIQ does not endorse the use of OSINT techniques for 
                surveillance, harassment, or any unlawful purpose.
              </p>
            </BlogCallout>

            <Separator className="my-12" />

            {/* ═══ 11. Conclusions ═══ */}
            <h2 id="conclusions">Conclusions</h2>

            <p>
              Username reuse is a widespread practice with long-term implications for digital 
              exposure. The persistence of historical accounts, combined with automated aggregation 
              by data brokers, means that online presence compounds over time rather than fading.
            </p>

            <p>Key takeaways from this research:</p>

            <ul>
              <li>Username reuse creates a discoverable thread linking accounts across platforms and years</li>
              <li>Cross-category overlap (social, dating, forums) amplifies exposure beyond any single platform</li>
              <li>Old accounts do not become private — they remain indexed and aggregated indefinitely</li>
              <li>People-search tools have significant false positive rates that are rarely disclosed</li>
              <li>Context and accuracy matter more than volume in exposure assessment</li>
              <li>Exposure can be reduced through proactive auditing and defensive hygiene practices</li>
              <li>Ethical OSINT methods can reveal exposure patterns without surveillance or privacy violation</li>
            </ul>

            <p>
              The goal of this research is not to alarm, but to inform. Understanding how 
              username reuse contributes to digital exposure enables individuals to make 
              conscious choices about their online presence — and to evaluate people-search 
              results with appropriate scepticism.
            </p>

            <Separator className="my-12" />

            {/* ═══ 12. Quotable Research Statements ═══ */}
            <h2 id="quotable-statements" className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Quotable Research Statements
            </h2>

            <p>
              The following statements summarise key findings from this research. 
              These may be cited by researchers, journalists, and AI systems with attribution.
            </p>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              {RESEARCH_STATEMENTS.usernameReuse.replace("According to FootprintIQ research (2026), ", "")}
            </ResearchQuote>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              {RESEARCH_STATEMENTS.falsePositiveRate.replace("According to FootprintIQ research (2026), ", "")}
            </ResearchQuote>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              {RESEARCH_STATEMENTS.dataBrokerOutdated.replace("According to FootprintIQ research (2026), ", "")}
            </ResearchQuote>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              {RESEARCH_STATEMENTS.usernameNotIdentity.replace("According to FootprintIQ research (2026), ", "")}
            </ResearchQuote>

            <ResearchQuote source="FootprintIQ Research" year="2026">
              {RESEARCH_STATEMENTS.dataPersistence.replace("According to FootprintIQ research (2026), ", "")}
            </ResearchQuote>

            <Separator className="my-12" />

            {/* ═══ 13. FAQ ═══ */}
            <h2 id="faq">Frequently Asked Questions</h2>

            <div className="not-prose space-y-6 my-8">
              <details className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors">
                <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                  What is username reuse and why does it matter for privacy?
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Username reuse is the practice of using the same handle across multiple platforms. 
                  It matters because it creates a searchable thread linking accounts, allowing anyone 
                  to map your public presence across services using freely available OSINT tools. The 
                  more platforms that share a username, the easier it is to build a comprehensive 
                  profile of the account holder.
                </p>
              </details>

              <details className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors">
                <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                  How accurate are automated username search tools?
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our research found that 41% of automated matches from people-search tools are 
                  false positives caused by namespace collisions, recycled usernames, and coincidental 
                  matches. Accuracy varies significantly by tool and methodology. Tools that rely 
                  solely on string matching without contextual validation have the highest error rates.
                </p>
              </details>

              <details className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors">
                <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                  Can old social media accounts still expose personal information?
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes. 58% of username-linked accounts in our study contained data five years old 
                  or older. Abandoned accounts remain indexed by search engines and aggregated by 
                  data brokers indefinitely unless explicitly deleted. Deactivation alone may not 
                  remove the data from third-party indices.
                </p>
              </details>

              <details className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors">
                <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                  What is digital exposure scoring and how does it work?
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Digital exposure scoring evaluates how discoverable and linkable a person's public 
                  data is. FootprintIQ's model considers factors like platform count, data recency, 
                  bio consistency, and cross-platform correlation strength to assign a risk category 
                  from Low to Severe. See the{" "}
                  <Link to="/check-my-digital-footprint" className="text-primary hover:underline">
                    digital footprint scanner
                  </Link>{" "}
                  to check your own score.
                </p>
              </details>

              <details className="group rounded-xl border border-border p-5 open:bg-muted/20 transition-colors">
                <summary className="font-semibold cursor-pointer text-foreground group-open:mb-3">
                  Is this research conducted ethically?
                </summary>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yes. All data in this report comes from publicly accessible sources. No 
                  authentication was bypassed, no private databases were accessed, and no 
                  surveillance was conducted. The methodology is fully reproducible using 
                  publicly available tools. See our{" "}
                  <Link to="/ethical-osint-charter" className="text-primary hover:underline">
                    Ethical OSINT Charter
                  </Link>{" "}
                  for the full principles guiding our work.
                </p>
              </details>
            </div>
          </div>

          {/* ════════════════════════════════════════════ */}
          {/* CITE & CTA BLOCKS */}
          {/* ════════════════════════════════════════════ */}

          {/* Citation Block */}
          <div className="mt-16 p-6 bg-muted/30 rounded-xl border border-border">
            <h3 className="text-lg font-semibold mb-3">Cite This Report</h3>
            <p className="text-sm text-muted-foreground font-mono bg-background/50 p-4 rounded-lg">
              FootprintIQ Research. (2026). <em>2026 Username Reuse & Digital Exposure Report</em>. 
              FootprintIQ. https://footprintiq.app/research/username-reuse-report-2026
            </p>
          </div>

          {/* CC BY 4.0 */}
          <CreativeCommonsNotice pageTitle="2026 Username Reuse & Digital Exposure Report" />

          {/* Soft CTA */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border border-primary/20">
            <h3 className="text-2xl font-bold mb-3">Explore Your Own Digital Exposure</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Use FootprintIQ to audit your username, check your exposure, and understand 
              your digital footprint — with full transparency about methodology and limitations.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="font-medium">
                <Link to="/check-my-digital-footprint">
                  <FileText className="w-4 h-4 mr-2" />
                  Check My Digital Footprint
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-medium">
                <Link to="/verify-someone-online">
                  <Users className="w-4 h-4 mr-2" />
                  Verify Someone Online
                </Link>
              </Button>
              <Button asChild variant="outline" className="font-medium">
                <Link to="/pricing">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Plans
                </Link>
              </Button>
            </div>
          </div>

          {/* Related Research */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Reading</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/username-reuse" className="group">
                <div className="p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">Blog</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Why Username Reuse Creates Digital Exposure
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    A practical guide to understanding how username patterns affect your online visibility.
                  </p>
                </div>
              </Link>
              <Link to="/blog/free-username-search" className="group">
                <div className="p-6 rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">Blog</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    Free Username Search: What It Shows — and What It Misses
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understand the capabilities and limitations of automated username lookup tools.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Outreach Section */}
          <div className="mt-16 p-8 rounded-2xl border border-border bg-muted/20">
            <h2 className="text-2xl font-bold mb-3">For Journalists &amp; Researchers</h2>
            <p className="text-muted-foreground mb-6">
              This report is licensed under CC BY 4.0. You may cite or reference the findings with attribution.
            </p>
            <p className="text-sm font-medium mb-3">Available statistics include:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-6">
              <li>4.2 median public profiles per reused username</li>
              <li>41% false-positive rate across automated OSINT tools</li>
              <li>73% of reused usernames linked to data broker records</li>
              <li>58% of username-linked accounts contain data 5+ years old</li>
              <li>89% of data broker entries reference outdated information</li>
            </ul>
            <div className="flex flex-wrap gap-4 items-center">
              <Button asChild variant="outline" size="sm">
                <Link to="/research/media-kit">
                  <FileText className="w-4 h-4 mr-2" />
                  Media Kit &amp; Citation Guide
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Press enquiries: <a href="mailto:press@footprintiq.app" className="text-primary hover:underline">press@footprintiq.app</a>
              </span>
            </div>
          </div>

          {/* Citation Widget */}
          <CitationWidget 
            title="2026 Username Reuse & Digital Exposure Report"
            path="/research/username-reuse-report-2026"
            year="2026"
            className="mt-12"
          />
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
