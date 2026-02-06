import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Building2, Phone, MapPin, Users, Eye, CheckCircle, ArrowRight, Award } from "lucide-react";

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
];

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
        <meta name="description" content="Protect your professional reputation. See what data brokers, public records, and social media reveal about you and your family." />
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

        {/* What We Scan */}
        <section className="py-16">
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
