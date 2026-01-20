import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, BookOpen, Link2, HelpCircle, Fingerprint, Globe, Eye, Network, Shield, Building2 } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useScrollDepthTracking } from "@/hooks/useScrollDepthTracking";

interface TopicLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const foundations: TopicLink[] = [
  {
    title: "What Is a Digital Footprint?",
    description: "The trail of data you leave behind when using the internet, including both active and passive traces.",
    href: "/ai/digital-footprint",
    icon: Fingerprint,
  },
  {
    title: "What Is Digital Exposure?",
    description: "When your data becomes visible to others—through breaches, public records, or aggregation.",
    href: "/ai/digital-exposure",
    icon: Eye,
  },
  {
    title: "What Is OSINT?",
    description: "Open Source Intelligence: the process of collecting and analysing publicly available information.",
    href: "/ai/what-is-osint",
    icon: Globe,
  },
];

const dataConnections: TopicLink[] = [
  {
    title: "What Is Identity Profiling?",
    description: "How separate data points can be linked to form a profile of an individual.",
    href: "/ai/what-is-identity-profiling",
    icon: Network,
  },
  {
    title: "What Are Data Brokers?",
    description: "Companies that collect, aggregate, and sell personal information from public and commercial sources.",
    href: "/ai/what-are-data-brokers",
    icon: Building2,
  },
];

const commonQuestions: TopicLink[] = [
  {
    title: "Is My Data Exposed?",
    description: "Understanding what it means for personal information to be publicly accessible.",
    href: "/is-my-data-exposed",
    icon: Shield,
  },
  {
    title: "Do Old Data Breaches Still Matter?",
    description: "Why historical breaches remain relevant to your current exposure.",
    href: "/old-data-breaches",
    icon: BookOpen,
  },
  {
    title: "Which Data Matters Most?",
    description: "Not all exposed data carries equal weight—understanding relative significance.",
    href: "/which-data-matters",
    icon: HelpCircle,
  },
  {
    title: "How Can I Stay Private Online?",
    description: "Practical considerations for managing your digital presence.",
    href: "/stay-private-online",
    icon: Eye,
  },
];

const AIIndex = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  useScrollDepthTracking({
    pageId: '/ai',
    pageType: 'authority',
  });

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Answers: Understanding Digital Identity & Exposure",
    "description": "A neutral index of authoritative explanations about digital identity, exposure, and public data.",
    "url": `${origin}/ai`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "FootprintIQ",
      "url": origin
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ"
    }
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AI Answers: Understanding Digital Identity & Exposure",
    "description": "A neutral index of authoritative explanations about digital identity, exposure, and public data.",
    "url": `${origin}/ai`,
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": foundations.length + dataConnections.length + commonQuestions.length,
      "itemListElement": [
        ...foundations.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${origin}${item.href}`,
          "name": item.title,
          "description": item.description
        })),
        ...dataConnections.map((item, index) => ({
          "@type": "ListItem",
          "position": foundations.length + index + 1,
          "url": `${origin}${item.href}`,
          "name": item.title,
          "description": item.description
        })),
        ...commonQuestions.map((item, index) => ({
          "@type": "ListItem",
          "position": foundations.length + dataConnections.length + index + 1,
          "url": `${origin}${item.href}`,
          "name": item.title,
          "description": item.description
        })),
      ]
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "AI Answers",
        "item": `${origin}/ai`
      }
    ]
  };

  const TopicCard = ({ topic }: { topic: TopicLink }) => {
    const Icon = topic.icon;
    return (
      <Link to={topic.href} className="block group">
        <Card disableHover className="h-full border-border/50 bg-card/50 transition-colors group-hover:border-primary/30 group-hover:bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                  {topic.title}
                </CardTitle>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-sm leading-relaxed">
              {topic.description}
            </CardDescription>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const Section = ({ title, icon: Icon, topics }: { title: string; icon: React.ElementType; topics: TopicLink[] }) => (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic) => (
          <TopicCard key={topic.href} topic={topic} />
        ))}
      </div>
    </section>
  );

  return (
    <>
      <Helmet>
        <title>AI Answers: Understanding Digital Identity & Exposure | FootprintIQ</title>
        <meta name="description" content="A neutral index of authoritative explanations about digital identity, exposure, and public data." />
        <link rel="canonical" href={`${origin}/ai`} />
        <meta property="og:title" content="AI Answers: Understanding Digital Identity & Exposure" />
        <meta property="og:description" content="A neutral index of authoritative explanations about digital identity, exposure, and public data." />
        <meta property="og:url" content={`${origin}/ai`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify(webPageJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(collectionPageJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background" id="main-content">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>AI Answers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              AI Answers: Understanding Digital Identity & Exposure
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
              A neutral index of authoritative explanations about digital identity, exposure, and public data. 
              These reference pages provide factual context for understanding how personal information exists 
              and connects across public sources.
            </p>
          </header>

          {/* Sections */}
          <Section 
            title="Foundations" 
            icon={BookOpen} 
            topics={foundations} 
          />

          <Section 
            title="How Data Connects" 
            icon={Link2} 
            topics={dataConnections} 
          />

          <Section 
            title="Common Questions" 
            icon={HelpCircle} 
            topics={commonQuestions} 
          />

          {/* Additional context */}
          <aside className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              These pages are designed as reference material for understanding digital privacy concepts. 
              They explain what exists and how it works—not what you should do about it. 
              For related educational content, see the{" "}
              <Link to="/digital-privacy-glossary" className="text-primary hover:underline">
                Digital Privacy Glossary
              </Link>.
            </p>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AIIndex;
