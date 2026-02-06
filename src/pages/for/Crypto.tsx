import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroInputField } from "@/components/HeroInputField";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Phone, Mail, AlertTriangle, Lock, Eye, CheckCircle, ArrowRight, Smartphone, Wallet, ShieldAlert } from "lucide-react";

const PAIN_POINTS = [
  {
    icon: <Phone className="h-5 w-5" />,
    title: "SIM swap attacks",
    description: "Hackers port your number to access 2FA-protected wallets and exchanges.",
  },
  {
    icon: <Mail className="h-5 w-5" />,
    title: "Email-linked identities",
    description: "Your exchange email may be linked to your real name across data brokers.",
  },
  {
    icon: <AlertTriangle className="h-5 w-5" />,
    title: "Public wallet exposure",
    description: "On-chain activity can be tied back to your social profiles and usernames.",
  },
  {
    icon: <Eye className="h-5 w-5" />,
    title: "Social engineering risk",
    description: "Public forum posts and Discord activity reveal attack vectors.",
  },
];

const SCAN_SOURCES = [
  "Exchange-linked emails",
  "Discord & Telegram usernames",
  "Twitter/X crypto handles",
  "Forum activity (Reddit, Bitcointalk)",
  "Data broker listings",
  "Known breach databases",
];

const FAQS = [
  {
    question: "Can FootprintIQ see my wallet addresses?",
    answer: "No. We scan usernames, emails, and phone numbers—not blockchain data. We help you understand what publicly links your identity to your crypto activity.",
  },
  {
    question: "Is this different from a regular identity scan?",
    answer: "We scan the same sources, but crypto users should focus on phone number exposure (SIM swap risk) and username reuse across exchanges and forums.",
  },
  {
    question: "How does this help prevent SIM swaps?",
    answer: "By showing you where your phone number and email appear publicly, you can take action before attackers use that information to social engineer your carrier.",
  },
  {
    question: "What if my phone number is exposed on data broker sites?",
    answer: "Our Pro plan includes removal recommendations for major data brokers. For phone numbers specifically, consider using a dedicated number for 2FA that isn't linked to your identity.",
  },
  {
    question: "Should I scan my exchange email or my crypto username?",
    answer: "Both. Your exchange email may appear in breaches, while your crypto username (Twitter handle, Discord name) may link to forums where you've discussed holdings. A complete picture requires scanning both.",
  },
  {
    question: "How often should crypto holders run exposure scans?",
    answer: "We recommend quarterly scans at minimum, or immediately after any public crypto activity (tweets about holdings, forum posts, conference attendance) that could increase your attack surface.",
  },
];

const WHY_THIS_MATTERS = {
  title: "Why Crypto Security Starts With OPSEC",
  content: `The FBI's Internet Crime Complaint Center (IC3) reported over $68 million in SIM swap losses in 2021, with crypto holders being primary targets. These attacks don't require sophisticated hacking—attackers simply need enough personal information to convince your mobile carrier to port your number.

That information comes from public sources: data broker listings that expose your phone number and address, forum posts where you discussed your holdings, exchange breaches that leaked your email, and social media profiles that connect your crypto persona to your real identity.

FootprintIQ scans the same sources attackers use, giving you visibility into your exposure before it becomes a liability. By understanding what's publicly known about your crypto-linked identities, you can take targeted action to reduce your attack surface.`,
};

const HOW_IT_WORKS = {
  title: "How to Use FootprintIQ for Crypto Security",
  steps: [
    "Enter your exchange-linked email address to check for breach exposure",
    "Scan your crypto username (Twitter handle, Discord name) to find linked accounts",
    "Check your phone number to see if it appears on data broker sites",
    "Review your exposure score and prioritize high-risk findings",
    "Take action: update 2FA methods, remove data broker listings, use unique identifiers",
  ],
};

export default function CryptoLandingPage() {
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
        <title>Crypto Security Scan — Protect Against SIM Swaps & Doxxing | FootprintIQ</title>
        <meta name="description" content="Free OSINT scan for crypto users. Check if your phone, email, or wallet-linked identifiers are exposed before hackers find them. Prevent SIM swap attacks." />
        <link rel="canonical" href="https://footprintiq.app/for/crypto" />
        <meta property="og:title" content="Crypto Security Scan | FootprintIQ" />
        <meta property="og:description" content="Check your digital exposure before bad actors do. Free scan for crypto holders." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Badge variant="outline" className="mb-6 text-primary border-primary/30">
              <Lock className="h-3 w-3 mr-1.5" />
              For Crypto Holders
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Check Your OPSEC Before
              <span className="block text-primary mt-2">Hackers Check It First</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              SIM swaps and social engineering start with public information. 
              See what attackers can find about your crypto-linked identities.
            </p>
            <HeroInputField />
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                No wallet scanning
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Public data only
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-primary" />
                Anonymous scan
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
              Common Attack Vectors We Help You Find
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PAIN_POINTS.map((point, idx) => (
                <Card key={idx} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
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
              A step-by-step approach to auditing your crypto security posture.
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

        {/* What We Scan */}
        <section className="py-16 bg-muted/30">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
              What We Scan
            </h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              We check publicly accessible sources for exposure of your crypto-linked identifiers.
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
              Real-World Scenarios
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Smartphone className="h-8 w-8 text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">SIM Swap Attack</h3>
                  <p className="text-sm text-muted-foreground">
                    Attacker finds your phone number on a data broker site, calls your carrier, and ports your number. Within minutes, they reset your exchange 2FA and drain your funds.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <Wallet className="h-8 w-8 text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">Exchange Account Takeover</h3>
                  <p className="text-sm text-muted-foreground">
                    Your exchange email appeared in a breach. Attackers use credential stuffing to access your account, then withdraw to their wallet before you notice.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <ShieldAlert className="h-8 w-8 text-destructive mb-4" />
                  <h3 className="font-semibold mb-2">Targeted Phishing</h3>
                  <p className="text-sm text-muted-foreground">
                    Your Twitter handle links to your Discord, which links to a Bitcointalk account where you discussed holdings. Attackers craft a personalized phishing message referencing your specific situation.
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
              Related tools: <Link to="/search-username" className="text-primary hover:underline">Username Search</Link> · <Link to="/email-breach-check" className="text-primary hover:underline">Email Breach Check</Link> · <Link to="/twitter-username-search" className="text-primary hover:underline">Twitter/X Search</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Also for: <Link to="/for/developers" className="text-primary hover:underline">Developers</Link> · <Link to="/for/executives" className="text-primary hover:underline">Executives</Link> · <Link to="/for/job-seekers" className="text-primary hover:underline">Job Seekers</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Start Your Security Audit
            </h2>
            <p className="text-muted-foreground mb-8">
              Free scan shows what's publicly exposed. Pro unlocks full analysis and recommendations.
            </p>
            <Button size="lg" asChild>
              <Link to="/scan">
                Run Free Crypto Security Scan
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
