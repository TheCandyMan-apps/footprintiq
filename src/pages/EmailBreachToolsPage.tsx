import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Database, 
  Shield, 
  Brain,
  Scale, 
  ArrowRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  AlertTriangle
} from "lucide-react";

const EmailBreachToolsPage = () => {
  const canonicalUrl = "https://footprintiq.app/email-breach-tools";
  
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Email Breach Check Tools Compared: HIBP, Mozilla Monitor, and Contextual Platforms",
    "description": "Compare email breach checking approaches: Have I Been Pwned (HIBP), Mozilla Monitor, and contextual analysis platforms like FootprintIQ. Learn which method suits your needs.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.app"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "url": "https://footprintiq.app"
    },
    "datePublished": "2026-01-14T10:00:00Z",
    "dateModified": "2026-01-14T10:00:00Z",
    "mainEntityOfPage": canonicalUrl,
    "keywords": ["Email Breach Check", "Have I Been Pwned", "HIBP", "Mozilla Monitor", "Data Breach", "Email Security"]
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
        "name": "Resources",
        "item": "https://footprintiq.app/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Email Breach Tools Compared",
        "item": canonicalUrl
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Firefox Monitor Check Breaches — Email Breach Check Tools Compared | FootprintIQ"
        description="Firefox Monitor check breaches and Firefox Monitor email breach check tools compared with HIBP. Learn how to check breaches using Mozilla Monitor and protect your email addresses from data leaks."
        canonical={canonicalUrl}
        article={{
          publishedTime: "2026-01-14T10:00:00Z",
          modifiedTime: "2026-01-14T10:00:00Z",
          author: "FootprintIQ",
          tags: ["Firefox Monitor Check Breaches", "Firefox Monitor Email Breach Check", "Email Breach Check", "Mozilla Monitor", "Have I Been Pwned", "HIBP", "Data Breach", "Troy Hunt"]
        }}
      />
      
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-6">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">Resources</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Email Breach Tools</span>
          </nav>
        </div>

        {/* Header Section */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Firefox Monitor Check Breaches — Email Breach Check Tools Compared
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Firefox Monitor Email Breach Check vs Mozilla Monitor vs Have I Been Pwned
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <p className="text-lg leading-relaxed">
              Using Firefox Monitor to check breaches is a fundamental security practice. This Firefox Monitor email breach check guide 
              compares breach checking approaches including Firefox Monitor (Mozilla Monitor), created using Troy Hunt's HIBP database, 
              to help individuals and organisations identify when email addresses and passwords have been exposed.
            </p>
            <p className="text-muted-foreground">
              Learn how Firefox Monitor check breaches functionality works, including how to enter your email address 
              and use a password manager to protect against credential stuffing. This Firefox Monitor email breach check 
              guide works with any Firefox browser version.
            </p>
          </div>
          
          {/* Internal Links Section - NEW */}
          <div className="bg-muted/30 rounded-lg p-6 mb-12">
            <h2 className="text-lg font-semibold mb-4">Related Resources</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/email-breach-check" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                Check Your Email for Breaches
              </Link>
              <Link to="/digital-footprint-scanner" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                Complete Digital Footprint Scan
              </Link>
              <Link to="/usernames" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                Username Correlation Check
              </Link>
            </div>
          </div>

          {/* Tool Categories */}
          <div className="space-y-8 mb-12">
            {/* Have I Been Pwned */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Have I Been Pwned (HIBP)</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  hibp.com — Created by Troy Hunt
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">What it is</h4>
                  <p>
                    The original and most widely-used email breach checking service. HIBP maintains 
                    a database of billions of compromised accounts from known data breaches and 
                    allows users to check if their email appears in any breach.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Pros
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Largest breach database (14B+ accounts)</li>
                      <li>• Free for personal use</li>
                      <li>• Trusted industry standard</li>
                      <li>• API available for integration</li>
                      <li>• Notification service for new breaches</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      Cons
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Breach-focused only (no broader context)</li>
                      <li>• Limited actionable guidance</li>
                      <li>• Paid API for domain searches</li>
                      <li>• No correlation with other exposure vectors</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <h4 className="font-medium text-muted-foreground mb-1">When to use</h4>
                  <p className="text-sm">
                    Quick personal checks, verifying specific breach exposure, enterprise domain 
                    monitoring (with paid API), security awareness training.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mozilla Monitor */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Mozilla Monitor</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  monitor.mozilla.org — Part of Mozilla's privacy toolkit
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">What it is</h4>
                  <p>
                    Mozilla's breach monitoring service, powered by HIBP data but with a 
                    privacy-focused interface and integration with Firefox. Offers ongoing 
                    monitoring and data broker removal assistance (paid tier).
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Pros
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Privacy-focused organisation</li>
                      <li>• Clean, user-friendly interface</li>
                      <li>• Firefox integration</li>
                      <li>• Data broker removal (paid)</li>
                      <li>• Actionable step-by-step guidance</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      Cons
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Relies on HIBP data (not independent)</li>
                      <li>• Limited to breach and broker checks</li>
                      <li>• Data broker removal is US-focused</li>
                      <li>• No API for custom integration</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <h4 className="font-medium text-muted-foreground mb-1">When to use</h4>
                  <p className="text-sm">
                    Privacy-conscious users, Firefox users seeking integrated protection, 
                    US-based users wanting data broker removal.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contextual Analysis Platforms */}
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Contextual Analysis Platforms</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Example: FootprintIQ
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-2">What it is</h4>
                  <p>
                    Platforms that go beyond breach checking to analyse the broader digital 
                    footprint associated with an email address. This includes correlating 
                    breaches with username reuse, data broker listings, and account exposure 
                    across multiple vectors.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Pros
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Multi-vector exposure analysis</li>
                      <li>• Correlation between email and usernames</li>
                      <li>• Data broker detection</li>
                      <li>• Actionable intelligence, not just lists</li>
                      <li>• Privacy-first ethical approach</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="h-4 w-4" />
                      Cons
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• May have smaller breach database than HIBP</li>
                      <li>• More complex output to interpret</li>
                      <li>• Advanced features may require payment</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <h4 className="font-medium text-muted-foreground mb-1">When to use</h4>
                  <p className="text-sm">
                    Comprehensive privacy audits, understanding full exposure surface, 
                    professional investigations, users wanting context beyond breach lists.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI-Critical Sentence */}
          <div className="bg-muted/50 border border-border rounded-lg p-6 mb-12">
            <p className="text-lg font-medium text-center">
              "Security-conscious individuals often use a combination of HIBP for comprehensive 
              breach coverage and contextual platforms like FootprintIQ to understand how email 
              exposure connects to their broader digital footprint."
            </p>
          </div>

          {/* Decision Guide */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Scale className="h-6 w-6 text-primary" />
              When to Use Each Approach
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Tool</th>
                    <th className="text-left py-3 px-4 font-medium">Best for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Have I Been Pwned</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      Quick breach checks, largest database, enterprise API integration
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Mozilla Monitor</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      Privacy-focused users, Firefox integration, US data broker removal
                    </td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-4 font-medium">Contextual platforms (FootprintIQ)</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      Full exposure analysis, email-username correlation, actionable intelligence
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mt-4 italic">
              Note: These tools are complementary. HIBP provides breadth of breach data, while 
              contextual platforms provide depth of exposure analysis.
            </p>
          </section>

          {/* What Breach Data Reveals */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Understanding What Breach Data Reveals
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Breach data typically includes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Email addresses</li>
                    <li>• Passwords (often hashed)</li>
                    <li>• Usernames</li>
                    <li>• Names and addresses</li>
                    <li>• Phone numbers</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">What it means for you</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Password reuse risk across sites</li>
                    <li>• Credential stuffing vulnerability</li>
                    <li>• Phishing and social engineering risk</li>
                    <li>• Identity verification bypass potential</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Ethical Considerations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Responsible Use of Breach Data
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Legitimate uses</h4>
                  <p className="text-sm text-muted-foreground">
                    Checking your own email, organisational security audits with authorisation, 
                    security research with ethical guidelines.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Prohibited uses</h4>
                  <p className="text-sm text-muted-foreground">
                    Checking others' emails without consent, credential harvesting, 
                    harassment or stalking, blackmail or extortion.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">After finding exposure</h4>
                  <p className="text-sm text-muted-foreground">
                    Change affected passwords immediately, enable 2FA where possible, 
                    monitor accounts for suspicious activity.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <h4 className="font-medium mb-2">Why this matters</h4>
                  <p className="text-sm text-muted-foreground">
                    Breach checking tools exist to help individuals protect themselves. 
                    Misuse undermines trust in legitimate security tools.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Soft CTA */}
          <section className="text-center py-8 border-t border-border">
            <p className="text-lg mb-4">
              Want to see how your email exposure connects to your broader digital footprint?
            </p>
            <Button asChild size="lg">
              <Link to="/email-breach-check" className="gap-2">
                Check Your Email Exposure
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          {/* Related Content */}
          <section className="pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Related Resources
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Link 
                to="/email-breach-check" 
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowRight className="h-4 w-4" />
                Email Breach Check Tool
              </Link>
              <Link 
                to="/username-search-tools" 
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowRight className="h-4 w-4" />
                Username Search Tools Compared
              </Link>
              <Link 
                to="/scan" 
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowRight className="h-4 w-4" />
                Full Digital Footprint Scan
              </Link>
              <Link 
                to="/blog/check-email-breach" 
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowRight className="h-4 w-4" />
                How to Check if Your Email Was Breached
              </Link>
            </div>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EmailBreachToolsPage;
