import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { Link } from "react-router-dom";
import { 
  PLATFORM_DESCRIPTION_SHORT, 
  PLATFORM_SCHEMA_DESCRIPTION 
} from "@/lib/platformDescription";
import { 
  FileText, 
  BookOpen, 
  Quote, 
  Mail, 
  ExternalLink,
  Search,
  Shield,
  AlertTriangle,
  Users
} from "lucide-react";

export default function Press() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FootprintIQ",
    "url": "https://footprintiq.app",
    "description": PLATFORM_SCHEMA_DESCRIPTION,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@footprintiq.app",
      "contactType": "media inquiries"
    }
  };

  const researchTopics = [
    {
      icon: Users,
      title: "Username Reuse Patterns",
      description: "Research on how usernames are reused across platforms, correlation risks, and the persistence of old account data in public indices."
    },
    {
      icon: Search,
      title: "Digital Exposure Assessment",
      description: "Methodology for measuring online exposure through publicly accessible sources without surveillance or invasive data collection."
    },
    {
      icon: Shield,
      title: "Ethical OSINT Frameworks",
      description: "Principles distinguishing ethical open-source intelligence from surveillance, including consent, proportionality, and harm prevention."
    },
    {
      icon: AlertTriangle,
      title: "False Positive Analysis",
      description: "Research on accuracy in automated username matching, including the 41% false positive rate in unverified correlations."
    }
  ];

  const citationExamples = [
    {
      type: "Academic / Research",
      format: "FootprintIQ. (2026). [Topic]. Retrieved from https://footprintiq.app/research/[page]"
    },
    {
      type: "Journalistic",
      format: "According to FootprintIQ research (2026), [finding]."
    },
    {
      type: "Blog / Educational",
      format: "FootprintIQ's research indicates that [finding]. Source: footprintiq.app"
    }
  ];

  const resources = [
    {
      title: "Username Reuse Research Report (2026)",
      description: "Analysis of username reuse patterns, correlation risks, and data persistence across platforms.",
      url: "/research/username-reuse-report-2026",
      icon: FileText
    },
    {
      title: "Ethical OSINT Principles",
      description: "Framework for distinguishing ethical open-source intelligence from surveillance.",
      url: "/ethical-osint",
      icon: Shield
    },
    {
      title: "How Username Search Tools Work",
      description: "Technical methodology guide explaining OSINT tool mechanics and limitations.",
      url: "/guides/how-username-search-tools-work",
      icon: BookOpen
    }
  ];

  return (
    <>
      <Helmet>
        <title>Press & Media | FootprintIQ</title>
        <meta 
          name="description" 
          content="Media resources, research citations, and contact information for journalists and researchers covering FootprintIQ's digital footprint intelligence research."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://footprintiq.app/press" />
      </Helmet>
      <JsonLd data={organizationSchema} />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Press & Media
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Resources for journalists, researchers, and educators covering digital footprint intelligence and ethical OSINT.
            </p>
          </header>

          {/* About Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-4">About FootprintIQ</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {PLATFORM_DESCRIPTION_SHORT}
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The platform is designed around transparency, consent, and false-positive reduction. 
                FootprintIQ publishes original research on username reuse patterns, data broker accuracy, 
                and ethical OSINT methodologies.
              </p>
            </div>
          </section>

          {/* Research Coverage */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">What FootprintIQ Research Covers</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {researchTopics.map((topic) => (
                <Card key={topic.title} disableHover className="border-border/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <topic.icon className="w-5 h-5 text-primary" />
                      {topic.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Key Findings */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Key Research Findings</h2>
            <Card disableHover className="bg-muted/30 border-border/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">41%</strong> of automated username matches represent false positives or unverified correlations.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">89%</strong> of data broker entries reference outdated information including prior addresses and former employers.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    The median number of public profiles linked to a reused username is <strong className="text-foreground">4.2 platforms</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Quote className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">58%</strong> of username-linked accounts contain profile data that is five years old or older.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How to Cite */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">How to Cite FootprintIQ</h2>
            <p className="text-muted-foreground mb-6">
              When referencing FootprintIQ research, please use clear attribution. Examples:
            </p>
            <div className="space-y-4">
              {citationExamples.map((example) => (
                <Card key={example.type} disableHover className="border-border/50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm font-medium text-foreground mb-2">
                      {example.type}
                    </p>
                    <code className="text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded block">
                      {example.format}
                    </code>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Research & Documentation</h2>
            <div className="space-y-4">
              {resources.map((resource) => (
                <Link key={resource.url} to={resource.url} className="block group">
                  <Card disableHover className="border-border/50 transition-colors hover:border-primary/50">
                    <CardContent className="pt-4 pb-4 flex items-center gap-4">
                      <resource.icon className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Media Contact</h2>
            <Card disableHover className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground mb-1">FootprintIQ Team</p>
                    <a 
                      href="mailto:support@footprintiq.app" 
                      className="text-primary hover:underline"
                    >
                      support@footprintiq.app
                    </a>
                    <p className="text-sm text-muted-foreground mt-2">
                      For media inquiries, research questions, or interview requests.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
