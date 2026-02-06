import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Briefcase, Search, Users, Eye, CheckCircle, ArrowRight, Linkedin, FileSearch, Building, UserCheck } from "lucide-react";

const PAIN_POINTS = [
  {
    icon: <Search className="h-5 w-5" />,
    title: "Employer background checks",
    description: "Recruiters Google you. Old profiles and forum posts can affect your candidacy.",
  },
  {
    icon: <Linkedin className="h-5 w-5" />,
    title: "LinkedIn isn't everything",
    description: "Your professional brand extends beyond LinkedIn to every platform you've used.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Username traceability",
    description: "That gaming username from 2015 might still link to your real identity.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Data broker listings",
    description: "People-search sites may show your address, phone, and relatives to anyone.",
  },
];

const SCAN_SOURCES = [
  "Professional networks (LinkedIn, GitHub)",
  "Social media profiles",
  "Forum and community accounts",
  "People-search sites",
  "Data broker databases",
  "Public records aggregators",
];

const FAQS = [
  {
    question: "What will employers actually find?",
    answer: "We show you the same publicly accessible information that background check services and recruiters can find when they search your name, email, or usernames.",
  },
  {
    question: "Can this help me get a job?",
    answer: "By knowing what's publicly visible, you can proactively address or remove outdated or unflattering information before it affects your candidacy.",
  },
  {
    question: "Is my search private?",
    answer: "Yes. We don't store your queries, and your scan results are only visible to you. We never share or sell data.",
  },
  {
    question: "Should I scan my professional email or personal email?",
    answer: "Both. Your professional email may appear in business directories and LinkedIn, while your personal email might be linked to older social media accounts or data broker listings.",
  },
  {
    question: "What if I find something embarrassing from years ago?",
    answer: "Our results include guidance on how to address each finding—whether that's deleting old accounts, requesting removal from data brokers, or adjusting privacy settings on social platforms.",
  },
  {
    question: "How is this different from just Googling myself?",
    answer: "We scan hundreds of sources simultaneously, including data brokers and databases that don't appear in standard Google searches. We also check for username connections across platforms that surface how your professional identity links to personal accounts.",
  },
];

const WHY_THIS_MATTERS = {
  title: "Why Your Digital Footprint Affects Your Career",
  content: `A CareerBuilder survey found that 70% of employers use social media to screen candidates during the hiring process, and 57% found content that caused them not to hire a candidate. What's more, recruiters don't just look at LinkedIn—they search your name, email, and any usernames they find.

Your digital footprint extends far beyond platforms you actively use. Old forum accounts, gaming profiles, and social media from a decade ago may still be indexed and discoverable. People-search sites aggregate public records, addresses, and phone numbers that recruiters can access with a simple name search.

Understanding what employers can find gives you the opportunity to take action before it costs you an opportunity. FootprintIQ scans the same sources recruiters and background check services use, giving you a complete picture of your professional digital presence.`,
};

const HOW_IT_WORKS = {
  title: "How to Audit Your Professional Reputation",
  steps: [
    "Enter your name to see what people-search sites reveal",
    "Scan your professional email to check for breach exposure",
    "Check usernames you've used across platforms for connections to your real identity",
    "Review your exposure score and identify high-priority concerns",
    "Take action: adjust privacy settings, request removals, or delete old accounts",
  ],
};

export default function JobSeekersLandingPage() {
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
        <title>See What Employers Find — Digital Reputation Check | FootprintIQ</title>
        <meta name="description" content="Free scan shows what recruiters and employers see when they search your name. Check your digital reputation before your next interview. Background check yourself first." />
        <link rel="canonical" href="https://footprintiq.app/for/job-seekers" />
        <meta property="og:title" content="Digital Reputation Check for Job Seekers | FootprintIQ" />
        <meta property="og:description" content="See what employers find when they Google you. Free digital footprint scan." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Briefcase className="h-3 w-3 mr-1.5" />
              For Job Seekers
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              See What Employers Find
              <span className="block text-primary mt-2">When They Google You</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Recruiters check more than your resume. Discover your digital reputation 
              across social media, forums, and people-search sites.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Free basic scan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Private & secure
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Actionable insights
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
              What Affects Your Digital Reputation
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
              A systematic approach to understanding and improving your professional digital presence.
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

        {/* What We Check */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              What We Check
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              We scan the same sources recruiters and background check services use.
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
              What You'll Learn About Your Digital Presence
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <FileSearch className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Old Account Discovery</h3>
                  <p className="text-sm text-muted-foreground">
                    Find forgotten accounts from years ago that may still be visible to employers. That MySpace profile or gaming forum account might still link to your current identity.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Building className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Data Broker Listings</h3>
                  <p className="text-sm text-muted-foreground">
                    See which people-search sites list your personal information. These sites often show addresses, phone numbers, and relatives—information you may want to opt out from.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <UserCheck className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">Username Connections</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover how your professional identity connects to personal accounts. A recruiter who finds your Twitter might trace it to other platforms through username reuse.
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
            <p className="text-center text-sm text-muted-foreground mb-3">
              Related tools: <Link to="/search-username" className="text-primary hover:underline">Username Search</Link> · <Link to="/instagram-username-search" className="text-primary hover:underline">Instagram Search</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Search</Link> · <Link to="/tiktok-username-search" className="text-primary hover:underline">TikTok Search</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Also for: <Link to="/for/developers" className="text-primary hover:underline">Developers</Link> · <Link to="/for/executives" className="text-primary hover:underline">Executives</Link> · <Link to="/for/crypto" className="text-primary hover:underline">Crypto Holders</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Prepare for Your Next Opportunity
            </h2>
            <p className="text-muted-foreground mb-8">
              Know what employers see before they see it. Free scan, instant results.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Check My Digital Reputation
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
