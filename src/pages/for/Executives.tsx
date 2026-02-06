import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Building2, Phone, MapPin, Users, Eye, CheckCircle, ArrowRight, Award, Mail, Target, AlertTriangle } from "lucide-react";

const PAIN_POINTS = [
  {
    icon: <MapPin className="h-5 w-5" />,
    title: "Home address exposure",
    description: "Data brokers and public records often link executives to residential addresses.",
  },
  {
    icon: <Phone className="h-5 w-5" />,
    title: "Personal contact information",
    description: "Phone numbers and personal emails can be found and used for spear-phishing.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Family member connections",
    description: "Relatives' information may be publicly linked to your professional identity.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Social engineering risk",
    description: "Detailed public profiles enable highly targeted business email compromise.",
  },
];

const SCAN_SOURCES = [
  "Corporate registrations",
  "LinkedIn & professional networks",
  "People-search & data brokers",
  "Press & media mentions",
  "Public records aggregators",
  "Social media cross-references",
];

const FAQS = [
  {
    question: "Why should executives care about digital footprint?",
    answer: "C-suite and board members are high-value targets for social engineering, whale phishing, and reputational attacks. Public information about you is the first step in these attacks.",
  },
  {
    question: "Can this help with executive protection programs?",
    answer: "Yes. Understanding what's publicly known is essential for any executive protection or risk management program. Our scans provide a baseline for ongoing monitoring.",
  },
  {
    question: "Is this different from a standard background check?",
    answer: "We focus on what's publicly accessible online—the same information attackers and journalists can find. This complements traditional background checks with digital exposure analysis.",
  },
  {
    question: "Can you scan for family members' exposure?",
    answer: "You can run separate scans for family members with their consent. Understanding family exposure is important because attackers often use relationships as leverage in social engineering attacks.",
  },
  {
    question: "How does this help with board security requirements?",
    answer: "Many boards now require executives to understand their personal digital exposure as part of enterprise risk management. Our reports provide documentation for compliance and security review processes.",
  },
  {
    question: "What about my company's executive protection team—can they use this?",
    answer: "Yes. Enterprise plans include team access and ongoing monitoring. Your security team can use FootprintIQ as part of a broader executive protection program, with results feeding into existing security workflows.",
  },
];

const WHY_THIS_MATTERS = {
  title: "Why Executive Digital Exposure Is a Business Risk",
  content: `The FBI's 2023 Internet Crime Report documented over $2.7 billion in losses from business email compromise (BEC) attacks. These attacks often begin with detailed research on executives—their schedules, business relationships, communication patterns, and personal details—all gathered from publicly available sources.

Beyond financial fraud, executives face reputational risks. Activists, competitors, and journalists can piece together personal information from data brokers, social media, and public records. Home addresses, family members' names, and personal contact information create physical security concerns as well as vectors for targeted harassment.

For board members and C-suite executives, understanding personal digital exposure is now a governance issue. It affects not only individual safety but also enterprise risk. An executive whose personal email appears in a breach may be more susceptible to credential-based attacks that eventually reach corporate systems.`,
};

const HOW_IT_WORKS = {
  title: "How to Audit Executive Digital Exposure",
  steps: [
    "Scan your professional email to check for breach exposure and data broker listings",
    "Check your personal email and phone number for people-search site appearances",
    "Review where your home address appears in public records",
    "Assess connections between your professional identity and family members",
    "Take action: opt out of data brokers, adjust privacy settings, implement enhanced security measures",
  ],
};

export default function ExecutivesLandingPage() {
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
        <title>Executive Digital Protection — Reputation & Privacy Scan | FootprintIQ</title>
        <meta name="description" content="Protect your professional reputation. See what data brokers, public records, and social media reveal about you and your family. Executive protection starts here." />
        <link rel="canonical" href="https://footprintiq.app/for/executives" />
        <meta property="og:title" content="Executive Digital Protection | FootprintIQ" />
        <meta property="og:description" content="C-suite privacy and reputation scan. See what's publicly known before bad actors do." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Award className="h-3 w-3 mr-1.5" />
              For Executives
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Protect Your Reputation
              <span className="block text-primary mt-2">Before It's Tested</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Executives face targeted attacks. See what data brokers, public records, 
              and social media reveal about you and your family.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Data broker check
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Family exposure scan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Confidential results
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
              Executive-Specific Exposure Risks
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
              A systematic approach to understanding and managing your executive digital presence.
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

        {/* Executive Protection Sources */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              Executive Protection Sources
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              We check the sources that matter most for high-profile individuals.
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
              Executive Threat Scenarios
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Mail className="h-8 w-8 text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">Business Email Compromise</h3>
                  <p className="text-sm text-muted-foreground">
                    Attackers research your business relationships, communication style, and schedule from public sources. They use this to craft convincing emails requesting wire transfers or sensitive data.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Target className="h-8 w-8 text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">Whale Phishing</h3>
                  <p className="text-sm text-muted-foreground">
                    Your personal email appeared in a breach. Attackers use this to build a profile, then craft a highly personalized phishing attempt that references your recent travel, family, or business deals.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">Physical Security Threat</h3>
                  <p className="text-sm text-muted-foreground">
                    Data brokers expose your home address and family members' names. This information, combined with your public calendar, creates physical security vulnerabilities.
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
              Related tools: <Link to="/search-username" className="text-primary hover:underline">Username Search</Link> · <Link to="/email-breach-check" className="text-primary hover:underline">Email Breach Check</Link> · <Link to="/how-identity-theft-starts" className="text-primary hover:underline">How Identity Theft Starts</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Also for: <Link to="/for/developers" className="text-primary hover:underline">Developers</Link> · <Link to="/for/crypto" className="text-primary hover:underline">Crypto Holders</Link> · <Link to="/for/job-seekers" className="text-primary hover:underline">Job Seekers</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Start Your Executive Protection Audit
            </h2>
            <p className="text-muted-foreground mb-8">
              Free scan shows public exposure. Pro unlocks full analysis and removal recommendations.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Run Executive Privacy Scan
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
