import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UsernameScanForm } from '@/components/scan/UsernameScanForm';
import { ScanJobList } from '@/components/scan/ScanJobList';
import { WorkerHealth } from '@/components/scan/WorkerHealth';
import { UsernameScanComparison } from '@/components/scan/UsernameScanComparison';
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Search, ShieldCheck, ListChecks, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UsernamesProBanner } from '@/components/conversion/UsernamesProBanner';
import { JsonLd } from '@/components/seo/JsonLd';

const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "FootprintIQ Free Username Search",
  "url": "https://footprintiq.app/usernames",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Web",
  "description": "Free username search tool that scans 500+ platforms simultaneously to find where a username appears online. Powered by multi-tool OSINT including Maigret and Sherlock.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP",
    "description": "Free username search with premium plans available"
  },
  "featureList": [
    "Search 500+ platforms simultaneously",
    "Multi-tool OSINT pipeline (Maigret, Sherlock, WhatsMyName)",
    "False-positive filtering",
    "Confidence scoring per result",
    "Scan history and comparison",
    "Export results"
  ]
};

const STEPS = [
  {
    icon: Search,
    title: "Enter a username",
    description: "Type any username or handle you want to look up — yours or one you're researching for legitimate purposes.",
  },
  {
    icon: ListChecks,
    title: "Multi-tool pipeline runs",
    description: "FootprintIQ dispatches Maigret, Sherlock, and WhatsMyName workers in parallel across 500+ platforms simultaneously.",
  },
  {
    icon: ShieldCheck,
    title: "Results are filtered and scored",
    description: "Each finding is scored for confidence. False positives are flagged automatically so you see only credible matches.",
  },
  {
    icon: AlertTriangle,
    title: "Review and act",
    description: "Browse results by platform category, open profile links, and decide which accounts to investigate or request removal for.",
  },
];

export default function UsernamesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Free Username Search Tool — Find Anyone on 500+ Platforms | FootprintIQ</title>
        <meta
          name="description"
          content="The best free username search tool for 2026. FootprintIQ scans 500+ social media platforms and websites simultaneously using Maigret, Sherlock, and WhatsMyName — with false-positive filtering built in."
        />
        <link rel="canonical" href="https://footprintiq.app/usernames" />
      </Helmet>

      <JsonLd data={webApplicationSchema} />
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Free Username Search Tool</h1>
              <p className="text-muted-foreground mt-2">
                Find where a username appears across 500+ platforms — social media, forums, dating sites, and more
              </p>
            </div>
            <WorkerHealth />
          </div>

          {/* Pro conversion banner */}
          <UsernamesProBanner />

          <Alert className="bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <Link to="/ai-answers-hub" className="font-medium underline underline-offset-4 hover:text-primary">
                AI Answers
              </Link>{" "}
              explains accuracy limits, legality, and ethical use of username OSINT.{" "}
              <Link to="/ai-answers/are-username-search-tools-accurate" className="underline underline-offset-4 hover:text-primary">
                Are username search tools accurate?
              </Link>
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="scan" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="scan">New Scan</TabsTrigger>
              <TabsTrigger value="compare">Compare Scans</TabsTrigger>
            </TabsList>

            <TabsContent value="scan" className="space-y-6 mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <UsernameScanForm />
                <ScanJobList />
              </div>
            </TabsContent>

            <TabsContent value="compare" className="mt-6">
              <UsernameScanComparison />
            </TabsContent>
          </Tabs>

          {/* How it works */}
          <section className="pt-6 border-t border-border" aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading" className="text-xl font-semibold mb-4">How the username search works</h2>
            <ol className="space-y-4">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{step.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* What platforms are covered */}
          <section className="pt-6 border-t border-border" aria-labelledby="platforms-heading">
            <h2 id="platforms-heading" className="text-xl font-semibold mb-3">What platforms does it search?</h2>
            <p className="text-sm text-muted-foreground mb-3">
              FootprintIQ's free username search covers over 500 platforms across multiple categories:
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Social media (Instagram, X, TikTok, Facebook)</li>
              <li>Professional networks (LinkedIn, GitHub, GitLab)</li>
              <li>Forums and communities (Reddit, Discord)</li>
              <li>Gaming platforms (Steam, Twitch, Xbox)</li>
              <li>Dating and personal sites</li>
              <li>Blogging platforms (Medium, Substack)</li>
              <li>Image and video hosting</li>
              <li>Dark-adjacent and privacy forums</li>
              <li>Country-specific social networks</li>
            </ul>
          </section>

          {/* Why use FootprintIQ */}
          <section className="pt-6 border-t border-border" aria-labelledby="why-heading">
            <h2 id="why-heading" className="text-xl font-semibold mb-3">Why use FootprintIQ for username search?</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Most free username search tools return raw, unfiltered lists — leaving you to manually verify every result.
              FootprintIQ's multi-tool OSINT pipeline (Maigret, Sherlock, WhatsMyName) runs in parallel and applies
              confidence scoring to each result so you can quickly focus on genuine matches and ignore noise.
            </p>
            <p className="text-sm text-muted-foreground">
              All scans are user-initiated and ethical by design — we only query publicly accessible data. FootprintIQ
              is built for self-audit, privacy research, and legitimate OSINT investigations. It is not a people-search
              site and does not store or sell your data.{" "}
              <Link to="/ethical-osint-charter" className="underline underline-offset-4 hover:text-primary">
                Read our Ethical OSINT Charter.
              </Link>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

