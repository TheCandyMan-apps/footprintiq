import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Shield,
  Eye,
  Zap,
  Target,
  ArrowRight,
  Globe,
  Gamepad2,
  Code,
  Briefcase,
  Users,
  Lock
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Is username search free?",
    answer: "Yes, single username searches are completely free. No account required. You can run unlimited free searches to check where a username appears across 500+ platforms."
  },
  {
    question: "What platforms do you check?",
    answer: "We check 500+ platforms including social media (Twitter, Instagram, TikTok, Reddit), gaming networks (Steam, Discord, Xbox, PlayStation), developer tools (GitHub, GitLab, Stack Overflow), professional networks (LinkedIn, Behance, Dribbble), and hundreds of forums and communities."
  },
  {
    question: "Is this legal?",
    answer: "Yes. We only check publicly accessible profile URLs that anyone can visit. We don't access private accounts, bypass authentication, or use any unauthorised techniques. This is ethical OSINT — open-source intelligence from publicly available data."
  },
  {
    question: "Why do some results show 'suspicious'?",
    answer: "Suspicious means the platform rate-limited our check or blocked automated requests. It doesn't confirm the username exists — manual verification may be needed. This is common with platforms that have aggressive bot protection."
  },
  {
    question: "Can I check multiple usernames?",
    answer: "Bulk username checking is available on our Pro plan, allowing up to 100 usernames per batch. This is ideal for security teams, investigators, and researchers who need to check multiple usernames efficiently."
  }
];

const platformCategories = [
  { icon: Globe, label: "Social Media", description: "Twitter, Instagram, TikTok, Reddit, and more" },
  { icon: Gamepad2, label: "Gaming Networks", description: "Steam, Discord, Xbox, PlayStation" },
  { icon: Code, label: "Developer Platforms", description: "GitHub, GitLab, Stack Overflow" },
  { icon: Briefcase, label: "Professional Networks", description: "LinkedIn, Behance, Dribbble" },
  { icon: Users, label: "Forums & Communities", description: "500+ forums and communities" }
];

const differentiators = [
  { icon: Target, title: "Correlation Analysis", description: "We identify patterns across platforms to help you understand the full picture" },
  { icon: Shield, title: "Risk Context", description: "Understand which findings matter for privacy and security exposure" },
  { icon: Zap, title: "False Positive Filtering", description: "Reduce noise from coincidental matches and inactive accounts" },
  { icon: Eye, title: "Actionable Intelligence", description: "Know what to do with the results — not just raw data" }
];

export default function UsernamePage() {

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: faqItems.map(item => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer
      }
    }))
  };

  return (
    <>
      <SEO
        title="Free Username Search — See Where Your Username Appears Online"
        description="Check where your username appears across 500+ platforms including social media, gaming, and forums. Free search — no login required, public data only."
        canonical="https://footprintiq.app/username-search"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Username Search", item: "https://footprintiq.app/username-search" }
            ]
          },
          faq: faqSchema
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              100% Free • Public Data Only • No Login Required
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Free Username Search
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Discover where any username appears across hundreds of public platforms — including social media, gaming sites, forums, and professional networks.
            </p>

            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              FootprintIQ is a username search tool that helps individuals discover where their usernames appear across public platforms using ethical OSINT techniques.
            </p>
            
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/scan">
                Run a Free Username Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Ethical OSINT Explanation */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Username Search Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                FootprintIQ checks public profile pages across 500+ platforms to see if a username is registered. 
                We use ethical OSINT techniques — only querying publicly accessible URLs that anyone can visit.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What we check */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  What We Check
                </h3>
                <ul className="space-y-3">
                  {platformCategories.map((cat, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <cat.icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium">{cat.label}</span>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* What we don't do */}
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  What We Don't Do
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Access private or locked accounts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Scrape behind logins or paywalls</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Use hacking or unauthorised techniques</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                    <span>Store or sell your search queries</span>
                  </li>
                </ul>
                <p className="mt-6 text-sm border-t pt-4">
                  This is <strong>ethical OSINT</strong> — open-source intelligence gathered only from publicly accessible sources.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to discover your digital footprint?</h2>
            <p className="text-muted-foreground mb-6">
              Start a free scan to see where your username appears across 500+ platforms.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link to="/scan">
                Run a Free Username Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>


        {/* Why Username Reuse Matters */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 md:p-8 border-l-4 border-l-primary">
              <h2 className="text-2xl font-bold mb-4">Why Username Reuse Matters</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Usernames are often reused across platforms — creating a traceable pattern</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>This can link accounts together and reveal interests or identity patterns</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>Attackers and data brokers commonly use usernames as a starting point for investigations</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Differentiation Section */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Beyond Basic Username Search</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free username search tools simply tell you "found" or "not found" — they don't explain what that means for your digital exposure. FootprintIQ goes further.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {differentiators.map((item, idx) => (
                <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA Section */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Want the Full Picture?</h2>
                <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Username search is just the beginning. A full digital footprint scan checks email breach exposure, 
                  data broker listings, public records, domain/WHOIS exposure, and more.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Email breaches</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Data broker listings</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Public records</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Domain/WHOIS</span>
                </div>
                <Button asChild size="lg" className="text-lg px-8">
                  <Link to="/scan">
                    Run a Full Digital Footprint Scan
                    <ArrowRight className="ml-2 w-5 h-5" />
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
              Want to see how your username connects to email exposure or data brokers?
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
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">
                Common questions about username search and digital exposure
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
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
        <section className="py-12 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Explore More OSINT Tools</h2>
            <p className="text-center text-muted-foreground mb-8">
              Username search is just one piece of the puzzle. Check your complete digital footprint.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/email-breach-check" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Email Breach Check
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check if your email appears in public data breaches and exposure sources
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
                    Combine username, email, phone, and name searches for complete exposure analysis
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Related Content */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Learn More</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/username-search-tools" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Username Search Tools Explained
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compare Sherlock, Maigret, and other username lookup tools
                  </p>
                </Card>
              </Link>
              <Link to="/blog/free-username-search" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Free Username Search: What It Shows — and What It Misses
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understanding the limitations of username lookup tools
                  </p>
                </Card>
              </Link>
              <Link to="/blog/username-reuse" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    Username Reuse: Why It's a Privacy Risk
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    How using the same username everywhere can expose you
                  </p>
                </Card>
              </Link>
              <Link to="/blog/what-is-digital-exposure" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    What Is Digital Exposure?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understanding your online footprint and risk surface
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
