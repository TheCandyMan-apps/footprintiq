import { Link } from "react-router-dom";
import { IntentAlignmentBanner } from "@/components/seo/IntentAlignmentBanner";
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
  Lock,
  Search,
  Filter,
  FileText,
  HelpCircle,
  BookOpen,
  Scale
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
  { icon: Globe, label: "Social Media Platforms", description: "Find social accounts on Twitter, Instagram, TikTok, Reddit, and more" },
  { icon: Gamepad2, label: "Gaming Networks", description: "Steam, Discord, Xbox, PlayStation gaming profiles" },
  { icon: Code, label: "Developer Platforms", description: "GitHub, GitLab, Stack Overflow developer accounts" },
  { icon: Briefcase, label: "Professional Networks", description: "LinkedIn, Behance, Dribbble professional profiles" },
  { icon: Users, label: "Forums & Communities", description: "500+ forums to map your complete online presence" }
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

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FootprintIQ Username Search",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.6",
      ratingCount: "587",
      bestRating: "5",
    },
    description: "Free username search tool to find people by username across 500+ social media platforms. Search usernames, lookup accounts, and find social profiles.",
  };

  return (
    <>
      <SEO
        title="Username Search — Find Accounts by Username Free | FootprintIQ"
        description="Search username across 500+ platforms free. Find accounts by username, lookup usernames on social media including Instagram, Facebook, TikTok & more. Best free username search tool using ethical OSINT."
        canonical="https://footprintiq.app/usernames"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Username Search", item: "https://footprintiq.app/usernames" }
            ]
          },
          faq: faqSchema,
          custom: webAppSchema
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Intent Alignment */}
        <IntentAlignmentBanner />
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-6 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              100% Free • Public Data Only • No Login Required
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Username Search — Find Accounts by Username Free
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
              Search username across 500+ platforms to find accounts by username — including 
              Instagram, Facebook, TikTok, Twitter, and gaming networks. The best free username 
              search tool for checking usernames, finding social profiles, and discovering 
              online identities across multiple platforms.
            </p>
            
            <Button size="lg" asChild className="text-lg px-8 py-6 mb-8">
              <Link to="/scan">
                Run a Free Username Scan
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Long-form Content Section for SEO */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <h2>How to Search Username and Find Accounts Online</h2>
            
            <p>
              Looking to search username handles and find accounts by username? A username search tool scans 
              public profile pages across popular social media platforms, gaming networks, and online communities 
              to show you where a specific handle appears. You can check username availability, find social 
              profiles on Instagram and Facebook, gather information about online identities, or understand 
              username reuse patterns across multiple platforms.
            </p>
            
            <p>
              Most people use the same username across multiple sites. This creates a traceable pattern 
              that anyone can follow. A username you created years ago on a gaming forum might still be 
              indexed by search engines—even if you've forgotten about it entirely.
            </p>

            <h3>What Is a Username Search?</h3>
            
            <p>
              A username search is a lookup that checks whether a specific handle exists on various 
              websites. When you run a username search, the tool visits public profile URLs like 
              <code>twitter.com/username</code> or <code>github.com/username</code> and checks if the 
              page exists. This is the same information anyone could find manually, but automated to 
              save hours of work.
            </p>

            <p>
              Free social media username search tools like FootprintIQ check over 500 platforms 
              simultaneously. We search major social networks like Twitter, Instagram, and TikTok. 
              We also check gaming platforms like Steam and Discord, developer sites like GitHub and 
              Stack Overflow, and hundreds of forums and niche communities.
            </p>

            <h3>Why Find People by Username?</h3>
            
            <p>
              There are several legitimate reasons to find people by username:
            </p>
            
            <ol>
              <li>
                <strong>Audit your own exposure.</strong> See where your usernames appear online. 
                Discover forgotten accounts that still contain your personal information.
              </li>
              <li>
                <strong>Verify online identities.</strong> Check if someone you're interacting with 
                has a consistent online presence across platforms.
              </li>
              <li>
                <strong>Research for security purposes.</strong> Understand how usernames can be 
                correlated to build a profile of someone's online activity.
              </li>
              <li>
                <strong>Claim your brand identity.</strong> Check if a username is available across 
                platforms before committing to it for business purposes.
              </li>
            </ol>

            <h3>Free vs. Paid Username Search Tools</h3>
            
            <p>
              Free username search tools provide basic lookup functionality. You enter a username, 
              and the tool tells you where it was found. This works well for simple queries and 
              personal audits.
            </p>
            
            <p>
              Paid tools add features like batch searching (checking multiple usernames at once), 
              historical data (seeing when accounts were created), and correlation analysis 
              (understanding how different usernames might belong to the same person). FootprintIQ 
              offers both free single searches and Pro features for deeper investigation.
            </p>

            <h3>Understanding False Positives</h3>
            
            <p>
              Not every match is meaningful. Common usernames like "alex" or "gaming123" exist on 
              nearly every platform—owned by completely different people. This creates false positives: 
              results that match your query but belong to someone else entirely.
            </p>
            
            <p>
              Quality username search tools filter these false positives using confidence scoring. 
              A high-confidence match on an unusual username is more significant than a low-confidence 
              match on a common one. Always verify results before drawing conclusions.
            </p>

            <h3>Ethical Username Search Practices</h3>
            
            <p>
              Ethical OSINT tools only access publicly available information. We don't bypass login 
              screens, guess passwords, or access private accounts. If a profile is set to private, 
              we can detect that the username exists but not see its contents—exactly like any 
              visitor to that platform.
            </p>
            
            <p>
              This matters because privacy is a right. Username search is a tool for understanding 
              public exposure, not for surveillance or stalking. We encourage users to search their 
              own usernames to understand their digital footprint, and to use results responsibly 
              when researching others.
            </p>
          </div>
        </section>

        {/* Ethical OSINT Explanation */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Our Deep Username Search Works</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our free social media username search checks public profile pages across 500+ platforms 
                to find people by username. This deep username search uses ethical OSINT techniques — 
                only querying publicly accessible URLs that anyone can visit.
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
              <h2 className="text-3xl font-bold mb-4">Beyond Basic Username Search Tools</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Most free username search tools simply tell you "found" or "not found" — they don't explain 
                what that means for your online presence or digital exposure. FootprintIQ uses open source 
                intelligence methods to find social accounts and provide actionable context.
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
            
            <p className="text-sm text-muted-foreground mt-6 text-center">
              For a deeper dive into how these tools work, read our{" "}
              <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline font-medium">
                technical guide to username search tools
              </Link>.
            </p>
          </div>
        </section>

        {/* NEW: How It Works - Step by Step */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Username Search Works: Step by Step</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Understanding the process helps you interpret results correctly and set realistic expectations.
              </p>
            </div>

            <div className="grid gap-6">
              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      You Enter a Username
                    </h3>
                    <p className="text-muted-foreground">
                      Type the exact username you want to check. The tool doesn't require an account, 
                      payment, or personal information to run a basic scan.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      We Query Public Profile URLs
                    </h3>
                    <p className="text-muted-foreground">
                      Our system checks publicly accessible profile pages across 500+ platforms. 
                      We're essentially visiting <code className="bg-muted px-1 rounded">platform.com/username</code> and 
                      analysing the response — the same thing anyone could do manually, but automated.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <Filter className="w-5 h-5 text-primary" />
                      Results Are Filtered for Accuracy
                    </h3>
                    <p className="text-muted-foreground">
                      Raw results often include false positives. Our system applies confidence scoring 
                      to distinguish likely matches from coincidental ones. Learn more in our{" "}
                      <Link to="/research/username-reuse-report-2026" className="text-primary hover:underline">
                        username reuse research
                      </Link>.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      You Review Contextualised Findings
                    </h3>
                    <p className="text-muted-foreground">
                      Each result includes the platform, profile URL, and confidence level. 
                      We explain what findings mean — not just whether a username exists, but 
                      what that might indicate for your digital exposure.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* NEW: Common Misconceptions */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <HelpCircle className="w-8 h-8 text-primary" />
                Common Misconceptions About Username Search
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Many assumptions about username lookup tools are wrong. Here's what people often misunderstand.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "If a username is found, it definitely belongs to the person I'm looking for"
                </h3>
                <p className="text-muted-foreground mb-3">
                  <strong className="text-foreground">Reality:</strong> Common usernames like "alex," "gaming," or "john123" 
                  exist on every platform — owned by different, unrelated people. A username match is a 
                  <em> hypothesis</em>, not a conclusion. Our{" "}
                  <Link to="/guides/how-username-search-tools-work" className="text-primary hover:underline">
                    technical guide
                  </Link>{" "}
                  explains why approximately 41% of automated matches are false positives.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "More results means a better tool"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> Volume isn't quality. A tool that returns 
                  200 matches with no filtering is less useful than one that returns 30 verified, contextualised 
                  results. Mass data without accuracy creates confusion, not clarity.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "Username search can find anyone's private information"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> Ethical username search only accesses 
                  publicly visible data — profile pages that anyone can visit without logging in. 
                  It cannot bypass privacy settings, access private accounts, or retrieve hidden information.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "If no results are found, the username doesn't exist anywhere"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> No tool checks every platform on the internet. 
                  Some sites actively block automated queries. A "not found" result means the username wasn't 
                  detected on the platforms checked — not that it doesn't exist elsewhere.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-destructive" />
                  Misconception: "Old accounts don't matter"
                </h3>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Reality:</strong> Abandoned accounts often remain indexed 
                  and searchable. A dormant profile from 2015 can still appear in search results, 
                  potentially with outdated but still-public information. Understanding this temporal dimension 
                  is key to interpreting results correctly.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* NEW: Accuracy & Ethics */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                <Scale className="w-8 h-8 text-primary" />
                Accuracy & Ethics: Our Approach
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We believe ethical OSINT requires transparency about methods, honest acknowledgment of 
                limitations, and respect for privacy boundaries.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Our Accuracy Commitments
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Confidence scores on every result — not just "found/not found"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>False positive filtering to reduce noise from coincidental matches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Transparent source attribution — you know where data comes from</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Clear limitations — we tell you what we can't determine</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Our Ethical Principles
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Self-audit focus — designed for checking your own exposure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Public data only — no hacking, scraping, or unauthorised access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>Data minimisation — we don't store or sell your search queries</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <span>No fear-based marketing — honest information, not alarm</span>
                  </li>
                </ul>
              </Card>
            </div>

            <Card className="p-6 border-l-4 border-l-primary bg-muted/30">
              <div className="flex items-start gap-4">
                <BookOpen className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Learn More About Ethical OSINT</h4>
                  <p className="text-muted-foreground mb-4">
                    We've published detailed resources explaining our methodology, the limitations 
                    of username search, and the principles that guide ethical open-source intelligence.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link 
                      to="/ethical-osint" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                    >
                      What Is Ethical OSINT? <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link 
                      to="/guides/how-username-search-tools-work" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                    >
                      How Username Tools Work <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link 
                      to="/responsible-use" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                    >
                      Responsible Use Policy <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* How to Lookup a Username Section - NEW SEO CONTENT */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">How to Lookup a Username</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-muted-foreground mb-4">
                Looking up a username across the internet is a common OSINT (open source intelligence) technique used to find social media accounts and online presence. Here's how to perform a deep user search:
              </p>
              <ol className="space-y-4 text-muted-foreground">
                <li><strong>Enter the username:</strong> Type the exact username you want to search. Our tool checks social media platforms, gaming networks, forums, and professional sites.</li>
                <li><strong>Wait for results:</strong> Our search tool queries 500+ platforms simultaneously to find where the username is registered.</li>
                <li><strong>Review findings:</strong> Each result includes the platform name, profile URL, and confidence level. This helps you find people by username effectively.</li>
                <li><strong>Analyse your online presence:</strong> See which accounts are linked together through username reuse — a key part of understanding digital exposure.</li>
              </ol>
            </div>
          </div>
        </section>

        {/* What a Deep Username Search Reveals - NEW SEO CONTENT */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">What a Deep Username Search Reveals</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p className="text-muted-foreground">
                A comprehensive username lookup reveals more than just account existence. When you search for a username, you can discover:
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Social Media Accounts</h3>
                <p className="text-sm text-muted-foreground">Find social profiles across Twitter, Instagram, TikTok, Reddit, and 100+ other social media platforms.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Gaming Profiles</h3>
                <p className="text-sm text-muted-foreground">Discover accounts on Steam, Discord, Xbox, PlayStation, and gaming communities.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Professional Presence</h3>
                <p className="text-sm text-muted-foreground">Locate professional profiles on LinkedIn, GitHub, Behance, and developer platforms.</p>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-2">Online Presence Patterns</h3>
                <p className="text-sm text-muted-foreground">Understand how accounts link together through shared usernames, revealing digital footprint exposure.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Related Tools Section */}
        <section className="py-12 px-6">
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
              <Link to="/digital-footprint-scanner" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Digital Footprint Scanner
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Combine username, email, phone, and name searches for complete exposure analysis
                  </p>
                </Card>
              </Link>
              <Link to="/username-search-tools" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    Username OSINT Tools Explained
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Compare Sherlock, Maigret, and other open source intelligence tools
                  </p>
                </Card>
              </Link>
              <Link to="/blog/what-is-osint-risk" className="group">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    What is OSINT Risk?
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Understand how open source intelligence exposes your digital footprint
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
