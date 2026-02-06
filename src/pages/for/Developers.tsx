import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Code, Github, Key, Eye, CheckCircle, ArrowRight, Terminal } from "lucide-react";

const PAIN_POINTS = [
  {
    icon: <Github className="h-5 w-5" />,
    title: "GitHub history exposure",
    description: "Commit history, issues, and PRs can reveal personal email, location, and work patterns.",
  },
  {
    icon: <Key className="h-5 w-5" />,
    title: "Leaked API keys & secrets",
    description: "Accidentally committed credentials may still be indexed and searchable.",
  },
  {
    icon: <Terminal className="h-5 w-5" />,
    title: "Stack Overflow & forums",
    description: "Years of Q&A activity can paint a detailed picture of your tech stack and projects.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Username traceability",
    description: "Your dev handle might link to gaming, social media, and non-professional content.",
  },
];

const SCAN_SOURCES = [
  "GitHub profiles & activity",
  "Stack Overflow & dev forums",
  "npm/PyPI package author info",
  "Tech community platforms",
  "Personal blogs & portfolios",
  "Data breach databases",
];

const FAQS = [
  {
    question: "Can you find leaked API keys?",
    answer: "We scan for your username and email across breach databases and public sources. For dedicated secret scanning, use tools like GitGuardian or truffleHog alongside FootprintIQ.",
  },
  {
    question: "Will this find my old GitHub commits?",
    answer: "We show where your username and email appear publicly. This includes GitHub profiles and associated activity that's indexed by search engines.",
  },
  {
    question: "Is this useful for OPSEC during job hunting?",
    answer: "Yes. Many developers have personal projects, gaming accounts, or old forum posts linked to their professional identity. We help you see the full picture.",
  },
];

export default function DevelopersLandingPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>Developer OPSEC Scan — GitHub Exposure & Code History Check | FootprintIQ</title>
        <meta name="description" content="Free scan for developers. Check what your GitHub profile, commit history, and dev usernames reveal about you." />
        <link rel="canonical" href="https://footprintiq.app/for/developers" />
        <meta property="og:title" content="Developer OPSEC Scan | FootprintIQ" />
        <meta property="og:description" content="See what your code history and dev profiles reveal. Free digital footprint scan for developers." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Code className="h-3 w-3 mr-1.5" />
              For Developers
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              What Does Your Code
              <span className="block text-primary mt-2">History Say About You?</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              GitHub commits, Stack Overflow posts, and dev forum activity create a detailed 
              digital footprint. See what's publicly linked to your identity.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                GitHub profile analysis
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Username tracing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Breach detection
              </span>
            </div>
          </div>
        </section>

        {/* Pain Points */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Developer-Specific Exposure Risks
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PAIN_POINTS.map((point, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                        {point.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{point.title}</h3>
                        <p className="text-sm text-muted-foreground">{point.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What We Scan */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Developer-Focused Scan Sources
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              We check platforms where developers commonly leave a digital trail.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {SCAN_SOURCES.map((source, idx) => (
                <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-4">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-background border border-border">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Audit Your Developer Footprint
            </h2>
            <p className="text-muted-foreground mb-8">
              See what your GitHub, Stack Overflow, and dev accounts reveal. Free scan, no account required.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Run Developer OPSEC Scan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
