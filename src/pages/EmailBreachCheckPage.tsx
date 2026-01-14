import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Mail,
  Link2,
  FileText,
  Eye,
  Users,
  Database,
  Lock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

const faqItems = [
  {
    question: "Is this the same as Have I Been Pwned?",
    answer: "We use multiple sources including Have I Been Pwned. Our tool adds context, correlation, and actionable next steps that raw breach databases don't provide."
  },
  {
    question: "Do you access my inbox?",
    answer: "No. We never access your email inbox. We only check public breach databases and exposure sources that anyone can query."
  },
  {
    question: "Is this legal and ethical?",
    answer: "Yes. We only check publicly accessible breach records and exposure data. We don't access private accounts, bypass authentication, or use any unauthorised techniques."
  },
  {
    question: "Will this remove my data?",
    answer: "The free check identifies exposure. Our Pro plan provides evidence packs you can use to request data removal from brokers and services."
  },
  {
    question: "What does Pro add?",
    answer: "Pro adds correlation analysis (linking email to usernames and accounts), deeper breach context, data broker monitoring, and exportable evidence for removal requests."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://footprintiq.app"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Email Breach Check",
      "item": "https://footprintiq.app/email-breach-check"
    }
  ]
};

export default function EmailBreachCheckPage() {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const navigate = useNavigate();

  const scrollToSearch = () => {
    document.getElementById("email-search")?.scrollIntoView({ behavior: "smooth" });
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setIsValidEmail(validateEmail(value));
    } else {
      setIsValidEmail(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    navigate(`/scan?email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Check Email Breach & Exposure — Free OSINT Scan | FootprintIQ"
        description="Check if your email appears in data breaches or public exposure using ethical OSINT techniques. Free email breach check — no inbox access, no monitoring, no login required."
        canonical="https://footprintiq.app/email-breach-check"
      />
      
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-6">
            <Shield className="w-3 h-3 mr-1" />
            Ethical OSINT · Public Data Only
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Check if Your Email Appears in Data Breaches
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Email exposure is often the starting point for identity compromise. Run a free check to see where your email appears — using ethical OSINT techniques.
          </p>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            FootprintIQ is an email exposure and digital footprint analysis tool that helps individuals understand where their email appears across public sources using ethical OSINT methods.
          </p>
          
          <Button size="lg" onClick={scrollToSearch} className="text-lg px-8 py-6">
            <Search className="mr-2 w-5 h-5" />
            Check Email Exposure
          </Button>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Public data only
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No inbox access
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No monitoring
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              No login required
            </span>
          </div>
        </div>
      </section>

      {/* Why Email Exposure Matters */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 md:p-8 border-l-4 border-l-primary">
            <h2 className="text-2xl font-bold mb-4">Why Email Exposure Matters</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>Email addresses often link accounts, usernames, and profiles across the web</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>Exposed emails are used for phishing, impersonation, and account takeover attempts</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span>Many tools show breaches without explaining what the exposure actually connects to</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* How Email Breach Check Works */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How Email Breach Check Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Understand what we check and — importantly — what we don't do.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* What We Check */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                What We Check
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Public breach references</span>
                    <p className="text-sm text-muted-foreground">Via Have I Been Pwned and similar public sources</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Associated usernames and accounts</span>
                    <p className="text-sm text-muted-foreground">Linked identifiers across platforms</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Data broker listings</span>
                    <p className="text-sm text-muted-foreground">Public people-search and data aggregator sites</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">Contextual exposure signals</span>
                    <p className="text-sm text-muted-foreground">Risk indicators and correlation patterns</p>
                  </div>
                </li>
              </ul>
            </Card>

            {/* What We Don't Do */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                What We Don't Do
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive/60 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">No inbox access</span>
                    <p className="text-sm text-muted-foreground">We never read, scan, or access your email</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive/60 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">No private databases</span>
                    <p className="text-sm text-muted-foreground">We don't access stolen data or dark web marketplaces</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive/60 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">No monitoring or tracking</span>
                    <p className="text-sm text-muted-foreground">Checks are on-demand, not continuous surveillance</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive/60 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">No login required</span>
                    <p className="text-sm text-muted-foreground">Run a check without creating an account</p>
                  </div>
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
                This is ethical OSINT — we only query publicly accessible data that anyone can access.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Email Search Form */}
      <section id="email-search" className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Check Your Email Exposure</h2>
            <p className="text-muted-foreground text-center mb-6">
              Enter your email to see where it appears in public breach databases
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className={`pl-10 h-12 text-lg ${!isValidEmail ? 'border-destructive' : ''}`}
                />
              </div>
              {!isValidEmail && (
                <p className="text-sm text-destructive">Please enter a valid email address</p>
              )}
              <Button type="submit" className="w-full h-12 text-lg" disabled={!isValidEmail}>
                <Search className="mr-2 w-5 h-5" />
                Check Email Exposure
              </Button>
            </form>
            
            <p className="text-xs text-muted-foreground text-center mt-4">
              <Lock className="inline w-3 h-3 mr-1" />
              Your email is checked against public breach databases — we never access your inbox
            </p>
          </Card>
        </div>
      </section>

      {/* What Happens After */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What Happens After the Free Check</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Free Check</h3>
              <p className="text-sm text-muted-foreground">
                Shows where your email exposure exists across public breach databases
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Pro Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Explains how your email connects to usernames, accounts, and data brokers
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Evidence for Removal</h3>
              <p className="text-sm text-muted-foreground">
                Use findings to request data deletion from brokers and services
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Beyond Basic Breach Lookup</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            FootprintIQ goes further than simple breach databases. We provide context, correlation, and actionable intelligence.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <Link2 className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Correlation Analysis</h3>
              <p className="text-sm text-muted-foreground">
                We show how your email connects to usernames, domains, and accounts
              </p>
            </Card>
            
            <Card className="p-6">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Risk Context</h3>
              <p className="text-sm text-muted-foreground">
                Understand which breaches actually matter for your security
              </p>
            </Card>
            
            <Card className="p-6">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Actionable Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Know what to do next, not just raw breach counts
              </p>
            </Card>
            
            <Card className="p-6">
              <FileText className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">Evidence for Removal</h3>
              <p className="text-sm text-muted-foreground">
                Use findings to request data deletion from brokers
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Get the Full Picture
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
              Email is just one piece of your digital footprint. Our full scan reveals the complete exposure landscape.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/scan">
                  Run Full Digital Footprint Scan
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Bridge CTA before FAQ */}
      <section className="py-8 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Want to see how your email connects to usernames and data brokers?
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/scan">
              Run a Full Digital Footprint Scan
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Related Tools Section */}
      <section className="py-12 px-6 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">Explore More OSINT Tools</h2>
          <p className="text-center text-muted-foreground mb-8">
            Email breach check is just one piece of the puzzle. Explore your complete digital footprint.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/username-search" className="group">
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                  Username Search
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find where any username appears across hundreds of public platforms
                </p>
              </Card>
            </Link>
            <Link to="/scan" className="group">
              <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                  Full Digital Footprint Scan
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-muted-foreground">
                  Combine email, username, phone, and name searches for complete exposure analysis
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Related Content */}
      <section className="py-12 px-6 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-center">Related Resources</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog/check-email-breach">
                How to Check If Your Email Was Breached
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog/what-is-digital-exposure">
                What Is Digital Exposure?
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/blog/dark-web-monitoring-explained">
                Dark Web Monitoring Explained
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
