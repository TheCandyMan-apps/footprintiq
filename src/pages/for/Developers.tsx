import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Code, Github, Key, Eye, CheckCircle, ArrowRight, Terminal, Database, GitCommit, FileCode } from "lucide-react";

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
  {
    question: "What about my npm/PyPI package author information?",
    answer: "Package registries often display author email and website. We scan for where your email appears across these platforms, helping you understand your exposure as a package maintainer.",
  },
  {
    question: "How does this differ from GitHub's secret scanning?",
    answer: "GitHub's scanning checks for secrets in your code. We check for where your identity (username, email) appears publicly across the internet—including sites that may have indexed your old commits or profile information.",
  },
  {
    question: "Should developers use separate usernames for personal and professional accounts?",
    answer: "It depends on your threat model. Our scan helps you understand how connected your accounts are. If your gaming username links directly to your GitHub profile, you can make informed decisions about whether to maintain that connection.",
  },
];

const WHY_THIS_MATTERS = {
  title: "Why Developer OPSEC Matters",
  content: `Developers often underestimate how much their code history reveals about their identity. Git commits include email addresses. GitHub profiles show contribution patterns, timezones, and interests. Stack Overflow answers reveal your employer's tech stack, and package registries often display personal contact information.

This exposure creates multiple risk vectors. Recruiters use it for background checks. Spear phishers craft targeted attacks based on your projects and tech interests. And if you've ever accidentally committed a secret—even if you immediately removed it—it may still exist in cached or archived versions of your repository.

Beyond security, there's also the professional consideration. Your dev handle might link to gaming accounts, personal social media, or forum posts from a decade ago. Understanding these connections helps you present a consistent professional identity while maintaining the privacy boundaries you want.`,
};

const HOW_IT_WORKS = {
  title: "How to Audit Your Developer Footprint",
  steps: [
    "Scan your primary dev email (the one in your git config)",
    "Check your GitHub username across other platforms",
    "Search for any alternative handles you use for gaming or personal accounts",
    "Review connections between professional and personal identities",
    "Take action: update git email settings, consolidate or separate accounts",
  ],
};

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
        <meta name="description" content="Free scan for developers. Check what your GitHub profile, commit history, and dev usernames reveal about you. Audit your developer digital footprint." />
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

        {/* Why This Matters */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {WHY_THIS_MATTERS.title}
            </h2>
            <div className="prose prose-lg dark:prose-invert mx-auto">
              {WHY_THIS_MATTERS.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
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

        {/* How It Works */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              {HOW_IT_WORKS.title}
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              A systematic approach to understanding your developer exposure.
            </p>
            <div className="space-y-4">
              {HOW_IT_WORKS.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-muted-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer-Focused Scan Sources */}
        <section className="py-16 bg-muted/30">
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

        {/* Real-World Scenarios */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
              Common Developer Exposure Scenarios
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <GitCommit className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Commit Email Exposure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your git config uses your personal email, which appears in every commit. Years of contribution history now link your identity across every project you've touched.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Database className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Package Registry Identity</h3>
                  <p className="text-sm text-muted-foreground">
                    You published an npm package years ago with your personal website and email. That information is still visible to anyone who searches for you.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <FileCode className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Username Chain</h3>
                  <p className="text-sm text-muted-foreground">
                    Your GitHub username matches your gaming handle, which links to Discord servers where you've discussed personal projects and interests outside of work.
                  </p>
                </CardContent>
              </Card>
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

        {/* Internal Links */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-sm text-muted-foreground">
              Learn more: <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline">How Username Search Tools Work</Link> · <Link to="/username-exposure" className="text-primary hover:underline">Understanding Username Exposure</Link> · <Link to="/email-breach-check" className="text-primary hover:underline">Email Breach Check</Link>
            </p>
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
