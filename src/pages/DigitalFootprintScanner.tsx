import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  Search, 
  Shield, 
  Mail, 
  Globe, 
  User, 
  Database,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  Briefcase,
  FileSearch,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  Sparkles
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DigitalFootprintScanner = () => {
  const faqs = [
    {
      question: "What is a digital footprint scanner?",
      answer: "A digital footprint scanner is a tool that searches publicly available sources to identify where your personal information appears online. It helps you understand your online visibility by finding usernames, email mentions, public profiles, and breach exposures across the internet. Unlike surveillance tools, a scanner like FootprintIQ only examines open-source information that anyone could find with enough time and expertise."
    },
    {
      question: "Is it legal to scan my digital footprint?",
      answer: "Yes, scanning your own digital footprint is completely legal. FootprintIQ only accesses publicly available information—the same data that search engines, researchers, and anyone else can access. We do not access private accounts, bypass security measures, or retrieve information that requires authentication. You have every right to understand what information about you exists in the public domain."
    },
    {
      question: "Does FootprintIQ monitor me?",
      answer: "No. FootprintIQ does not monitor, track, or surveil you. When you run a scan, we search public sources for information related to the identifier you provide (username, email, or phone number). We do not install tracking software, access your devices, or continuously watch your online activity. Each scan is a point-in-time check, not ongoing surveillance."
    },
    {
      question: "Is this the same as a data removal service?",
      answer: "No, these are different services. FootprintIQ is a visibility tool—it helps you understand where your information appears. Data removal services attempt to contact websites and data brokers to request deletion of your information. While knowing your exposure is the first step toward removal, FootprintIQ focuses on awareness and understanding rather than removal requests. Some users choose to handle removal themselves after understanding their exposure, while others use dedicated removal services."
    },
    {
      question: "Can I remove my digital footprint completely?",
      answer: "Complete removal is extremely difficult, if not impossible, for most people. Information spreads across the internet through backups, archives, data broker networks, and third-party aggregation. However, you can significantly reduce your exposure by deleting old accounts, requesting removal from data brokers, and improving your security practices. The goal should be risk reduction, not perfect invisibility. Understanding what exists is the essential first step."
    },
    {
      question: "Who should use an OSINT-based scan?",
      answer: "Anyone curious about their online visibility can benefit from a scan. However, it's particularly valuable for people concerned about identity theft, professionals managing their online reputation, journalists and researchers needing ethical investigation tools, job seekers wanting to review what employers might find, and anyone who has experienced a data breach and wants to understand their exposure. If you've ever wondered what information about you exists online, a scan provides concrete answers."
    }
  ];

  const schemaFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const schemaBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Digital Footprint Scanner",
        "item": "https://footprintiq.com/digital-footprint-scanner"
      }
    ]
  };

  const schemaSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ Digital Footprint Scanner",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Free ethical digital footprint scanner that checks your online exposure across usernames, emails, and public data sources using open-source intelligence methods.",
    "featureList": [
      "Username search across 500+ platforms",
      "Email breach detection",
      "Public profile discovery",
      "OSINT-based scanning",
      "Privacy-focused analysis"
    ]
  };

  const schemaOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FootprintIQ",
    "url": "https://footprintiq.com",
    "logo": "https://footprintiq.com/logo.png",
    "description": "Ethical digital footprint intelligence platform"
  };

  return (
    <>
      <Helmet>
        <title>Digital Footprint Scanner – Free & Ethical Online Exposure Check | FootprintIQ</title>
        <meta 
          name="description" 
          content="Scan your digital footprint for free. Check where your usernames, emails, and personal data appear online using ethical OSINT methods. No surveillance, no data selling—just visibility." 
        />
        <meta name="keywords" content="digital footprint scanner, online footprint scanner, digital footprint check, find my digital footprint, personal data exposure, ethical OSINT tools, username search, email breach check" />
        <link rel="canonical" href="https://footprintiq.com/digital-footprint-scanner" />
        
        <meta property="og:title" content="Digital Footprint Scanner – Free & Ethical Online Exposure Check" />
        <meta property="og:description" content="Understand your online visibility. Scan usernames, emails, and public data with ethical OSINT methods. Free, private, and transparent." />
        <meta property="og:url" content="https://footprintiq.com/digital-footprint-scanner" />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Digital Footprint Scanner – Free & Ethical Online Exposure Check" />
        <meta name="twitter:description" content="Understand your online visibility. Scan usernames, emails, and public data with ethical OSINT methods." />
        
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaSoftware)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaOrganization)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main id="main-content" className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
              <li>/</li>
              <li className="text-foreground">Digital Footprint Scanner</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <section className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Digital Footprint Scanner – Free & Ethical Online Exposure Check
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                A digital footprint scanner is a tool that helps you understand where your personal information appears online. It searches public sources—websites, social platforms, data aggregators, and breach databases—to show you what others can find about you.
              </p>
              
              <p>
                Most people don't realize how much of their information is publicly accessible. Over years of internet use, data accumulates across dozens or hundreds of sites. Old forum accounts, forgotten social profiles, and breached passwords all contribute to your digital footprint.
              </p>
              
              <p>
                The important thing to understand: most exposure isn't caused by hacking. It comes from normal internet use over time. Account sign-ups, public posts, data broker collection, and third-party data sharing all create visibility that most people never think about.
              </p>
              
              <p>
                Before you can reduce your exposure, you need to understand it. A scan gives you that visibility—showing you what exists so you can make informed decisions about what matters.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to="/scan">
                  <Search className="h-5 w-5" />
                  Start Your Free Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/sample-report">View Sample Report</Link>
              </Button>
            </div>
          </section>

          {/* What Is a Digital Footprint */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">What Is a Digital Footprint?</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Your digital footprint is the trail of information you leave behind as you use the internet. Every account you create, post you make, and service you sign up for adds to this trail. Over time, it builds into a detailed picture of your online presence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Active Footprint</h3>
                      <p className="text-muted-foreground">
                        Information you intentionally share—social media posts, account profiles, forum comments, and public content you create. You have some control over this data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <EyeOff className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Passive Footprint</h3>
                      <p className="text-muted-foreground">
                        Information collected without your direct action—data broker profiles, breach records, aggregated data from third parties. This often exists without your knowledge.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Most people significantly underestimate their digital footprint. They remember their main social media accounts but forget the dozens of smaller services, old forums, and one-time sign-ups that still hold their information. Breach data compounds this—your email and passwords may exist in databases you never knew were compromised.
              </p>
              
              <p>
                Understanding both your active and passive footprint is essential for making informed decisions about your online privacy and security. For a deeper exploration of this topic, read our guide on{" "}
                <Link to="/what-is-a-digital-footprint" className="text-primary hover:underline">
                  what a digital footprint is and how it forms
                </Link>.
              </p>
            </div>
          </section>

          {/* What FootprintIQ Scans */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">What FootprintIQ Scans</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                FootprintIQ uses open-source intelligence (OSINT) methods to search publicly accessible sources. Here's what we look for:
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                {
                  icon: User,
                  title: "Usernames across public websites",
                  description: "We check 500+ platforms to see where a username appears, from major social networks to niche forums and services."
                },
                {
                  icon: Mail,
                  title: "Email exposure from known breaches",
                  description: "We cross-reference emails against aggregated breach databases to identify potential password exposures."
                },
                {
                  icon: Globe,
                  title: "Public profiles and linked accounts",
                  description: "We identify connections between accounts that use the same username or email across different platforms."
                },
                {
                  icon: Search,
                  title: "Open-source intelligence sources",
                  description: "We query public records, search engines, and OSINT databases that aggregate publicly available information."
                },
                {
                  icon: Database,
                  title: "Data broker and aggregation signals",
                  description: "We look for indicators that your information appears in data broker listings or people-search sites."
                }
              ].map((item, index) => (
                <Card key={index} className="border-border/50">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Important:</strong> All sources we query are publicly accessible. We do not access private databases, bypass authentication, or use any data that isn't already available through open channels.
              </p>
            </div>
          </section>

          {/* What FootprintIQ Does NOT Do */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">What FootprintIQ Does NOT Do</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Ethical boundaries matter. We believe in transparency about what we do and—equally important—what we don't do. These aren't limitations; they're intentional choices that define who we are.
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                {
                  title: "No private database access",
                  description: "We don't purchase, steal, or access private datasets. If information isn't publicly available, we don't have it."
                },
                {
                  title: "No monitoring or tracking",
                  description: "We don't install software on your devices, track your browsing, or continuously watch your online activity."
                },
                {
                  title: "No scraping behind logins",
                  description: "We don't log into accounts to access protected content. If it requires authentication, it's off-limits."
                },
                {
                  title: "No surveillance capabilities",
                  description: "We're an awareness tool, not a surveillance platform. We help you understand your own exposure—not spy on others."
                },
                {
                  title: "No selling or reselling data",
                  description: "Your scan results belong to you. We don't sell your information to data brokers, advertisers, or third parties."
                }
              ].map((item, index) => (
                <Card key={index} className="border-destructive/20 bg-destructive/5">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-primary/5 rounded-lg p-6 border border-primary/20">
              <p className="text-muted-foreground">
                We draw clear ethical lines because trust matters more than features. You should know exactly what a tool does before you use it—and FootprintIQ is built on that principle.
              </p>
            </div>
          </section>

          {/* Why Visibility Matters */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Why Digital Footprint Visibility Matters</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Identity theft and fraud aren't usually the result of a single dramatic hack. They're opportunistic—criminals look for exposed information and combine small pieces into larger attacks over time.
              </p>
              
              <p>
                An old email password from a 2015 breach might still work on other accounts where you reused it. A username connected across multiple platforms can help someone impersonate you or answer security questions. Aggregated personal details from data brokers can fuel targeted phishing attacks.
              </p>
              
              <p>
                The risk isn't hypothetical. It's mathematical. The more exposure you have, the more opportunity attackers have to find a weak point. Old data doesn't become safe just because time passes—it often sits in searchable databases indefinitely.
              </p>
              
              <p>
                Understanding your exposure is the first step toward reducing it. You can't address risks you don't know exist.
              </p>
            </div>
          </section>

          {/* Who This Is For */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Who This Is For</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <UserCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Privacy-Conscious Individuals</h3>
                      <p className="text-muted-foreground">
                        Anyone who wants to understand their online visibility and take control of their personal information. Whether you're concerned about identity theft, protecting family members, or simply curious about your digital presence.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Professionals & Executives</h3>
                      <p className="text-muted-foreground">
                        People who need to audit their online presence for career reasons—job seekers reviewing what employers might find, executives managing reputation risk, or public figures assessing their exposure.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileSearch className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Journalists & Researchers</h3>
                      <p className="text-muted-foreground">
                        Investigators who need ethical OSINT tools for legitimate research. FootprintIQ provides structured, reproducible searches across public sources without crossing ethical or legal boundaries.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Risk Reduction Seekers</h3>
                      <p className="text-muted-foreground">
                        Anyone who wants to reduce their long-term exposure—people who've experienced a breach, those going through life changes, or anyone looking to minimize their attack surface.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How FootprintIQ Is Different */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">How FootprintIQ Is Different</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Not all digital footprint tools serve the same purpose. Some exist to help you—others exist to exploit you. Understanding the difference matters.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Awareness Tools (Like FootprintIQ)
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" />
                      <span>Help you understand your own exposure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" />
                      <span>Provide context about what information means</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" />
                      <span>Focus on risk education and understanding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-primary shrink-0" />
                      <span>Don't sell or resell your data</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    People-Search & Data Broker Sites
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-destructive shrink-0" />
                      <span>Profit from aggregating and selling personal data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-destructive shrink-0" />
                      <span>Often charge to see or remove your own information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-destructive shrink-0" />
                      <span>Enable stalking, harassment, and fraud</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-1 text-destructive shrink-0" />
                      <span>Resist removal requests or make them difficult</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                FootprintIQ exists to give you knowledge and agency—not to exploit your data or enable misuse. We focus on helping you understand risk, make decisions, and take action if you choose to. The difference between awareness and exploitation isn't subtle; it's fundamental.
              </p>
              <p>
                If you're concerned about data brokers specifically, our guide on{" "}
                <Link to="/blog/remove-data-brokers" className="text-primary hover:underline">
                  how to remove yourself from data broker sites
                </Link>{" "}
                provides actionable steps you can take.
              </p>
            </div>
          </section>

          {/* What You Can Do After Scanning */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">What You Can Do After Scanning</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                A scan is information, not a verdict. What you do with that information depends on your priorities and circumstances. Here are some common next steps:
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                {
                  icon: Lock,
                  title: "Improve account hygiene",
                  description: "Review old accounts, update passwords, enable two-factor authentication where possible, and delete accounts you no longer use."
                },
                {
                  icon: Shield,
                  title: "Reduce username and password reuse",
                  description: "If the same credentials appear across multiple breaches, prioritize changing them. Consider a password manager for unique passwords."
                },
                {
                  icon: Eye,
                  title: "Decide what exposure matters",
                  description: "Not all visibility is equally risky. A public professional profile is different from an exposed password. Prioritize based on actual risk."
                },
                {
                  icon: Sparkles,
                  title: "Secure core accounts",
                  description: "Focus on high-value accounts first: email, banking, primary social media. These are often used to reset other accounts."
                }
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> This is general information, not legal or financial advice. If you're dealing with identity theft, fraud, or serious security concerns, consult appropriate professionals.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Closing CTA */}
          <section className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/20">
            <h2 className="text-3xl font-bold mb-4">Understand Your Online Exposure</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Knowledge is the first step toward better security. Run a free scan to see what information about you exists in public sources—no surveillance, no data selling, just clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/scan">
                  <Search className="h-5 w-5" />
                  Start Your Free Scan
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/trust">Learn About Our Ethics</Link>
              </Button>
            </div>
          </section>

          {/* Internal Links */}
          <section className="mt-16 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold mb-6">Related Resources</h3>
            
            {/* Educational Guides */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Educational Guides</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link 
                  to="/what-is-a-digital-footprint" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    What Is a Digital Footprint?
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Examples, risks, and how to check yours
                  </span>
                </Link>
                <Link 
                  to="/reduce-digital-footprint" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    How to Reduce Your Digital Footprint
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Practical, ethical steps to lower exposure
                  </span>
                </Link>
                <Link 
                  to="/how-identity-theft-starts" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    How Identity Theft Starts
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Why it's rarely a hack
                  </span>
                </Link>
                <Link 
                  to="/username-exposure" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    Username Exposure
                  </span>
                  <span className="text-sm text-muted-foreground">
                    How accounts get linked across the internet
                  </span>
                </Link>
                <Link 
                  to="/what-is-osint" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    What Is OSINT?
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Ethical open-source intelligence explained
                  </span>
                </Link>
                <Link 
                  to="/digital-privacy-glossary" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    Digital Privacy Glossary
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Key terms and definitions explained
                  </span>
                </Link>
                <Link 
                  to="/is-my-data-exposed" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    Is My Data Already Exposed?
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Calm, factual answers about data exposure
                  </span>
                </Link>
                <Link 
                  to="/old-data-breaches" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    Should I Worry About Old Breaches?
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Why most old breaches don't cause harm
                  </span>
                </Link>
              </div>
            </div>

            {/* Blog Posts */}
            <div className="mb-8">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">From the Blog</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link 
                  to="/blog/what-is-digital-footprint" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Understanding Your Digital Footprint
                </Link>
                <Link 
                  to="/blog/remove-data-brokers" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  How to Remove Yourself from Data Brokers
                </Link>
                <Link 
                  to="/blog/what-is-digital-exposure" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Understanding Digital Exposure
                </Link>
                <Link 
                  to="/blog/check-email-breach" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  How to Check If Your Email Was Breached
                </Link>
                <Link 
                  to="/blog/username-reuse" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  The Risks of Username Reuse
                </Link>
                <Link 
                  to="/blog/social-media-privacy" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Social Media Privacy Guide
                </Link>
              </div>
            </div>

            {/* Tools & Resources */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">Tools & Resources</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link 
                  to="/username-search" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Username Search Tool
                </Link>
                <Link 
                  to="/email-breach-check" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Email Breach Check
                </Link>
                <Link 
                  to="/trust" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Our Trust & Ethics
                </Link>
                <Link 
                  to="/data-sources" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  How We Source Data
                </Link>
                <Link 
                  to="/sample-report" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  View Sample Report
                </Link>
                <Link 
                  to="/blog/password-security-guide" 
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Password Security Guide
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DigitalFootprintScanner;
