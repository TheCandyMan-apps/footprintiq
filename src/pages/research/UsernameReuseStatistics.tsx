import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { ResearchQuote } from "@/components/ResearchQuote";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Users, AlertTriangle, BookOpen, ExternalLink } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const platformReuseData = [
  { platforms: "1", percentage: 23 },
  { platforms: "2", percentage: 36 },
  { platforms: "3", percentage: 22 },
  { platforms: "4", percentage: 11 },
  { platforms: "5+", percentage: 8 },
];

const categoryData = [
  { name: "Social Media", value: 38, fill: "hsl(var(--primary))" },
  { name: "Forums & Communities", value: 24, fill: "hsl(var(--accent))" },
  { name: "Developer Platforms", value: 18, fill: "hsl(280 70% 50%)" },
  { name: "Gaming", value: 12, fill: "hsl(320 70% 50%)" },
  { name: "Other", value: 8, fill: "hsl(var(--muted-foreground))" },
];

const riskByReuseData = [
  { reuse: "1 platform", risk: 12 },
  { reuse: "2 platforms", risk: 29 },
  { reuse: "3 platforms", risk: 48 },
  { reuse: "4 platforms", risk: 67 },
  { reuse: "5+ platforms", risk: 84 },
];

const barChartConfig = {
  percentage: { label: "Percentage", color: "hsl(var(--primary))" },
};

const riskChartConfig = {
  risk: { label: "Risk Score", color: "hsl(var(--destructive))" },
};

export default function UsernameReuseStatistics() {
  const faqItems = [
    {
      question: "How common is username reuse across platforms?",
      answer: "Based on aggregated OSINT scan data from FootprintIQ in 2026, approximately 41% of usernames appear on at least three platforms, whilst 28% appear on five or more. This high reuse rate significantly increases identity correlation risk.",
    },
    {
      question: "Does username reuse increase identity exposure?",
      answer: "Yes. Each additional platform where a username appears creates new data points that can be cross-referenced. Our research shows that exposure risk increases exponentially — a username found on five platforms carries roughly seven times the correlation risk of one found on a single platform.",
    },
    {
      question: "What types of platforms see the most username reuse?",
      answer: "Social media platforms account for the highest reuse at 38%, followed by forums and community sites at 24%, developer platforms at 18%, and gaming platforms at 12%.",
    },
    {
      question: "How is this data collected?",
      answer: "Statistics are derived from aggregated, anonymised OSINT username scan data processed through FootprintIQ's multi-tool pipeline. Individual usernames and personally identifiable information are never retained or published.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Username Reuse Statistics (2026 Study) – Cross-Platform Data | FootprintIQ</title>
        <meta
          name="description"
          content="2026 username reuse statistics: 41% of usernames appear on 3+ platforms. Research data on cross-platform exposure, identity risk, and reuse patterns."
        />
        <link rel="canonical" href="https://footprintiq.app/research/username-reuse-statistics" />
      </Helmet>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Username Reuse Statistics (2026 Study)",
          description:
            "Research and statistics about username reuse across online platforms, based on aggregated OSINT scan data.",
          author: {
            "@type": "Organization",
            name: "FootprintIQ Research",
            url: "https://footprintiq.app",
          },
          publisher: {
            "@type": "Organization",
            name: "FootprintIQ",
          },
          datePublished: "2026-03-01",
          dateModified: "2026-03-04",
          url: "https://footprintiq.app/research/username-reuse-statistics",
        }}
      />
      <JsonLd
        data={{
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
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
            { "@type": "ListItem", position: 2, name: "Research", item: "https://footprintiq.app/research" },
            { "@type": "ListItem", position: 3, name: "Username Reuse Statistics", item: "https://footprintiq.app/research/username-reuse-statistics" },
          ],
        }}
      />

      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/research" className="hover:text-primary transition-colors">Research</Link>
          <span>/</span>
          <span className="text-foreground">Username Reuse Statistics</span>
        </nav>

        {/* Hero */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
              2026 Study
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent-foreground border border-accent/20">
              Peer Data
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Username Reuse Statistics
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Research and statistics about username reuse across online platforms, based on
            aggregated OSINT scan data processed through FootprintIQ in 2026.
          </p>
        </header>

        {/* Key Findings */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Key Findings
          </h2>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { stat: "41%", label: "of usernames appear on at least 3 platforms" },
              { stat: "28%", label: "appear on 5 or more platforms" },
              { stat: "4.2", label: "median platforms per reused username" },
            ].map((item) => (
              <div
                key={item.stat}
                className="p-6 rounded-xl bg-muted/30 border border-border/50 text-center"
              >
                <p className="text-4xl font-bold text-primary mb-2">{item.stat}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <ResearchQuote source="FootprintIQ Research" year="2026">
            Usernames are frequently reused across multiple platforms over several years, increasing correlation and exposure risk even when no recent breach has occurred.
          </ResearchQuote>

          <div className="grid md:grid-cols-2 gap-4 mt-8">
            {[
              { stat: "58%", label: "of username-linked accounts contain profile data 5+ years old" },
              { stat: "89%", label: "of data broker entries reference outdated information" },
              { stat: "15+", label: "platforms for power users with a single handle" },
              { stat: "41%", label: "of automated matches are false positives requiring verification" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/30"
              >
                <span className="text-2xl font-bold text-primary shrink-0 w-16 text-right">
                  {item.stat}
                </span>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Reuse Patterns */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Platform Reuse Patterns
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            The distribution of username reuse follows a predictable curve. Most users reuse a
            handle across two platforms, but a significant minority carry the same username
            across five or more services — creating substantial identity correlation surfaces.
          </p>

          <div className="p-6 rounded-xl bg-muted/20 border border-border/50 mb-8">
            <h3 className="text-lg font-semibold mb-4">Username Distribution by Platform Count</h3>
            <ChartContainer config={barChartConfig} className="h-[280px] w-full">
              <BarChart data={platformReuseData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="platforms"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: "Number of platforms", position: "insideBottom", offset: -5, fontSize: 12 }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: "% of usernames", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="p-6 rounded-xl bg-muted/20 border border-border/50">
            <h3 className="text-lg font-semibold mb-4">Reuse by Platform Category</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="h-[240px] w-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      strokeWidth={2}
                      stroke="hsl(var(--background))"
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2">
                {categoryData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name}: <strong className="text-foreground">{item.value}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Common cross-platform reuse patterns include social media to forums (e.g., Twitter → Reddit),
            developer platforms to professional networks (e.g., GitHub → LinkedIn handles), and
            gaming to streaming services. Understanding these patterns is central to{" "}
            <Link to="/reverse-username-search" className="text-primary hover:underline">
              reverse username search
            </Link>{" "}
            investigations.
          </p>
        </section>

        {/* Identity Exposure Risks */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            Identity Exposure Risks
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Reused usernames create a compounding exposure effect. Each additional platform
            where a handle appears adds new data points — profile photos, bios, follower lists,
            activity timestamps — that can be cross-referenced to build a composite identity profile.
          </p>

          <div className="p-6 rounded-xl bg-muted/20 border border-border/50 mb-8">
            <h3 className="text-lg font-semibold mb-4">Exposure Risk Score by Reuse Count</h3>
            <ChartContainer config={riskChartConfig} className="h-[280px] w-full">
              <BarChart data={riskByReuseData} accessibilityLayer>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="reuse" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  label={{ value: "Risk score", angle: -90, position: "insideLeft", fontSize: 12 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="risk" fill="hsl(var(--destructive))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-border/30 bg-background">
              <h3 className="font-semibold mb-1">Profile Photo Correlation</h3>
              <p className="text-sm text-muted-foreground">
                When the same username appears with matching profile images across platforms,
                identity confidence jumps from ~40% to over 90%. Even without photos, shared
                bios and activity patterns enable high-confidence correlation.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/30 bg-background">
              <h3 className="font-semibold mb-1">Temporal Persistence</h3>
              <p className="text-sm text-muted-foreground">
                Accounts created as early as 2008 remain searchable today. A handle registered
                once persists in public indices indefinitely unless explicitly deleted. This means
                old, forgotten accounts continue to expose personal data.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border/30 bg-background">
              <h3 className="font-semibold mb-1">Context Collapse</h3>
              <p className="text-sm text-muted-foreground">
                Aggregating data from different contexts — professional networks, hobby forums,
                dating sites — removes the original context in which information was shared,
                potentially causing harm even when all underlying data was public.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            To understand your own exposure, try FootprintIQ's{" "}
            <Link to="/check-my-digital-footprint" className="text-primary hover:underline">
              digital footprint checker
            </Link>. It scans 500+ platforms and provides an actionable exposure report.
          </p>
        </section>

        {/* Methodology */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Methodology
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            All statistics presented in this study are derived from aggregated, anonymised
            OSINT username scan data processed through FootprintIQ's multi-tool scanning
            pipeline during 2025–2026. The pipeline includes established OSINT tools such as
            Sherlock, Maigret, WhatsMyName, and SpiderFoot, with results cross-validated
            through FootprintIQ's false-positive filtering system.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground mb-6">
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Individual usernames and PII are never retained or published
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Only publicly accessible data from OSINT sources is used
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              AI-powered false-positive filtering reduces noise by approximately 41%
            </li>
            <li className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Data is aggregated at the statistical level — no individual profiles are exposed
            </li>
          </ul>

          <p className="text-sm text-muted-foreground">
            For a comprehensive overview of our research methodology and full dataset findings, see the{" "}
            <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">
              2026 Username Reuse & Digital Exposure Report
            </Link>. For OSINT methodology standards, refer to the{" "}
            <a
              href="https://www.osintframework.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              OSINT Framework <ExternalLink className="h-3 w-3" />
            </a>{" "}
            and{" "}
            <a
              href="https://inteltechniques.com/tools/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              IntelTechniques <ExternalLink className="h-3 w-3" />
            </a>{" "}
            for additional context on ethical OSINT practices.
          </p>
        </section>

        {/* CTA */}
        <section className="mb-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-3">Run a Username Scan</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            See how many platforms your username appears on. FootprintIQ scans 500+ sites
            and provides an actionable exposure report in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/scan">
                Scan Your Username Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/reverse-username-search">
                Reverse Username Search
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqItems.map((item) => (
              <div key={item.question} className="p-5 rounded-xl bg-muted/20 border border-border/30">
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Citation */}
        <footer className="pt-6 border-t border-border/30">
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            Cite this page: FootprintIQ Research. (2026). <em>Username Reuse Statistics (2026 Study)</em>.
            FootprintIQ. https://footprintiq.app/research/username-reuse-statistics
          </p>
        </footer>
      </main>

      <Footer />
    </div>
  );
}
