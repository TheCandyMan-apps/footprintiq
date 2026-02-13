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
  Sparkles,
  Phone,
  Zap,
  RefreshCw,
  Clock,
  Scale,
  Target
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    },
    {
      question: "How accurate is a digital footprint scanner?",
      answer: "Accuracy depends on the scanner's methodology and sources. FootprintIQ uses multiple OSINT tools and cross-validates results to reduce false positives. We search over 500 public platforms and breach databases, providing confidence scores for each finding. However, no scanner can guarantee 100% coverage—some information may exist in sources we don't index, or under variations of your identifiers we haven't checked. For best results, run scans with multiple usernames and email addresses you've used over time."
    },
    {
      question: "Can a footprint scanner find deleted accounts?",
      answer: "In many cases, yes. When you delete a social media account, the platform removes it from their public interface, but traces often remain. Your username may still appear in cached search results, archived web pages, or data broker listings. Breach databases also retain records indefinitely—if your email was in a breach before you deleted the account, that record still exists. A footprint scanner reveals these persistent traces that outlast account deletion."
    },
    {
      question: "How often should I scan my digital footprint?",
      answer: "We recommend scanning at least once per quarter, or after any significant online activity changes. Major life events—job changes, moving, ending relationships—often prompt privacy reviews. If you've received a breach notification, scan immediately to assess your exposure. Regular scanning helps you catch new exposures early, before they compound into larger risks. Some users with higher security needs scan monthly."
    },
    {
      question: "What's the difference between a footprint scanner and a background check?",
      answer: "Background checks access restricted databases like court records, credit histories, and criminal records—often requiring consent and legal authorization. A digital footprint scanner like FootprintIQ only searches publicly accessible sources that anyone can find. We don't access government databases, credit bureaus, or private records. Our focus is helping you understand your public exposure, not conducting formal investigations that would require special authorization."
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
        "item": "https://footprintiq.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Digital Footprint Scanner",
        "item": "https://footprintiq.app/digital-footprint-scanner"
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
    "description": "An ethical digital footprint scanner using open-source intelligence (OSINT) techniques to help you understand online exposure across usernames, emails, and public data sources — without surveillance or invasive data collection.",
    "featureList": [
      "Username search across 500+ platforms",
      "Email breach detection",
      "Public profile discovery",
      "Ethical OSINT-based scanning",
      "Transparency and consent-first design",
      "False-positive reduction"
    ]
  };

  const schemaOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FootprintIQ",
    "url": "https://footprintiq.app",
    "logo": "https://footprintiq.app/logo.png",
    "description": "An ethical digital footprint intelligence platform using open-source intelligence (OSINT) techniques to help people understand online exposure while avoiding surveillance, monitoring, or invasive data collection."
  };

  const schemaHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Scan Your Digital Footprint",
    "description": "Step-by-step guide to checking your online exposure using FootprintIQ's free footprint scanner.",
    "totalTime": "PT5M",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Enter your identifier",
        "text": "Enter your username, email address, or phone number into the footprint scanner. You can run multiple scans with different identifiers for comprehensive coverage."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Scanner queries public sources",
        "text": "Our footprint scanner searches over 500 public platforms, breach databases, and OSINT sources for matches. This process takes 2-3 minutes depending on scan depth."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Results are aggregated",
        "text": "Findings from multiple tools are aggregated, de-duplicated, and validated. Each result receives a confidence score based on cross-validation."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Review your exposure report",
        "text": "You receive a structured report showing where your information appears, categorized by risk level. Use this to prioritize which exposures to address first."
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>How to Find Your Digital Footprint — Free Digital Footprint Checker | FootprintIQ</title>
        <meta 
          name="description" 
          content="Learn how to find your digital footprint with our free digital footprint checker. Discover how to find the digital footprint of someone using ethical OSINT methods. Scans 500+ sources for social media, email breaches, and data exposure." 
        />
        <meta name="keywords" content="how to find digital footprint, find your digital footprint, how to find digital footprint of someone, free digital footprint checker, digital footprint finder, find my digital footprint, digital footprint intelligence, personal data exposure, trail of data, ethical OSINT tools, username scanner, email breach scanner" />
        <link rel="canonical" href="https://footprintiq.app/digital-footprint-scanner" />
        
        <meta property="og:title" content="How to Find Your Digital Footprint — Free Digital Footprint Checker" />
        <meta property="og:description" content="Learn how to find your digital footprint and how to find the digital footprint of someone. Free checker scans 500+ sources for social media, email breaches, and data exposure." />
        <meta property="og:url" content="https://footprintiq.app/digital-footprint-scanner" />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Find Your Digital Footprint — Free Checker" />
        <meta name="twitter:description" content="Learn how to find digital footprint traces with our free checker. Discover how to find the digital footprint of someone using ethical OSINT methods." />
        
        <script type="application/ld+json">{JSON.stringify(schemaFAQ)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaBreadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaSoftware)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaOrganization)}</script>
        <script type="application/ld+json">{JSON.stringify(schemaHowTo)}</script>
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Discover Where Your Personal Data Appears Online
            </h1>
            
            {/* Lead-in subtitle with keyword variations */}
            <p className="text-xl text-primary/80 font-medium mb-6">
              Learn how to find digital footprint traces across 500+ platforms. Our free digital footprint checker helps you discover where your personal data appears—including social media, email breaches, and data broker listings.
            </p>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Wondering how to find your digital footprint? A digital footprint checker scans public sources—websites, social media platforms, data aggregators, and breach databases—to show you what others can find about you. Every trail of data you leave behind contributes to your online presence.
              </p>
              
              <p>
                Most people underestimate how much personal information is publicly accessible. Over years of internet use, data accumulates across dozens of sites. Old forum accounts, forgotten social profiles, and breached passwords all contribute. A free digital footprint checker reveals this accumulated exposure in minutes.
              </p>
              
              <p>
                Understanding how to find the digital footprint of someone (including yourself) starts with the right tools. Most exposure isn't caused by hacking—it comes from normal internet use. Account sign-ups, public posts, and data broker collection all create visibility that search engines can index.
              </p>
              
              <p>
                Before you can reduce your exposure, you need to understand it. Find your digital footprint with a free scan—our digital footprint intelligence platform shows exactly what exists so you can make informed decisions.
              </p>
            </div>

            {/* Quick Summary Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                What This Digital Footprint Checker Does in 30 Seconds
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Searches 500+ social media platforms for your usernames
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Checks data breach databases for exposed email addresses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Identifies data broker listings with your personal data
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Provides a structured exposure report with IP address and search engine findings
                </li>
              </ul>
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
          
          {/* Internal Links Section - NEW */}
          <section className="mb-16 bg-muted/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Related Tools & Resources</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/usernames" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                Free Username Search
              </Link>
              <Link to="/email-breach-check" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                Email Breach Check
              </Link>
              <Link to="/blog/remove-data-brokers" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                How to Remove Data from Data Brokers
              </Link>
              <Link to="/username-exposure" className="flex items-center gap-2 text-primary hover:underline">
                <ArrowRight className="h-4 w-4" />
                Understanding Username Exposure
              </Link>
            </div>
          </section>

          {/* How Our Footprint Scanner Works - NEW SECTION */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">How Our Footprint Scanner Works</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Understanding how an online footprint scanner operates helps you trust the results. Here's the step-by-step process our digital footprint scanner follows:
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                {
                  step: 1,
                  title: "Enter your identifier",
                  description: "Start by entering a username, email address, or phone number. The footprint scanner accepts any identifier you want to check. For comprehensive coverage, run multiple scans with different identifiers you've used online over the years."
                },
                {
                  step: 2,
                  title: "Scanner queries 500+ public sources",
                  description: "Our free footprint scanner sends queries to social networks, forums, data aggregators, and breach databases. We use ethical OSINT methods—the same techniques used by security researchers and journalists—to find where your information appears."
                },
                {
                  step: 3,
                  title: "Results are aggregated and validated",
                  description: "Raw findings from multiple tools are combined, de-duplicated, and cross-validated. Each result receives a confidence score. False positives are filtered out so you only see genuine matches."
                },
                {
                  step: 4,
                  title: "You receive a structured exposure report",
                  description: "Your internet footprint is presented in a clear report organized by category and risk level. You can see exactly where your username appears, which breaches included your email, and what data broker listings may contain your information."
                }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground">
              The entire process typically takes 2-3 minutes. You'll receive results in real-time as our digital exposure tool completes each check.
            </p>
          </section>

          {/* Types of Footprint Scans - NEW SECTION */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Types of Footprint Scans</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Different identifiers reveal different aspects of your digital footprint. Our online visibility checker supports three primary scan types, each designed to uncover specific exposure patterns:
              </p>
            </div>

            <div className="grid gap-6 mb-8">
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Username Footprint Scanner</h3>
                      <p className="text-muted-foreground mb-3">
                        The username scanner discovers where a specific handle appears across the internet. It's the most revealing scan type because usernames create linkable identities. When you reuse "alex_1995" across platforms, each account becomes connected in ways that aren't obvious until you see them mapped together.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Searches 500+ social networks and forums
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Identifies profile reuse across platforms
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Reveals forgotten accounts you may have created
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Email Breach Scanner</h3>
                      <p className="text-muted-foreground mb-3">
                        The email exposure scanner checks whether your address appears in known data breaches. Over 15 billion records have been exposed in public breaches—if you've used the internet for any length of time, your email has likely been compromised at least once.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Cross-references aggregated breach databases
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Identifies which services were compromised
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Shows what data types were exposed (passwords, names, etc.)
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Phone Number Lookup</h3>
                      <p className="text-muted-foreground mb-3">
                        The phone scanner checks for associated accounts and data broker listings. Phone numbers are increasingly used as account identifiers and often appear in people-search sites without your knowledge. This scan reveals where your number has been linked.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Finds accounts linked to your phone number
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Checks data broker and people-search sites
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          Identifies potential spam/scam targeting vectors
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Pro tip:</strong> For the most complete picture, run all three scan types. Your username, email, and phone number each reveal different facets of your online exposure that together form your complete digital footprint.
              </p>
            </div>
          </section>

          {/* What Is a Digital Footprint */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">What Does a Digital Footprint Scanner Check?</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Your digital footprint is the trail of information you leave behind as you use the internet. Every account you create, post you make, and service you sign up for adds to this trail. Over time, it builds into a detailed picture of your online presence that a footprint scanner can reveal.
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
                        Information you intentionally share—social media posts, account profiles, forum comments, and public content you create. You have some control over this data. A digital footprint scanner shows where this active content exists.
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
                        Information collected without your direct action—data broker profiles, breach records, aggregated data from third parties. This often exists without your knowledge. An online footprint scanner reveals this hidden exposure.
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
            <h2 className="text-2xl font-bold mb-6">What Our Footprint Scanner Searches</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                FootprintIQ uses open-source intelligence (OSINT) methods to search publicly accessible sources. Here's what our online footprint scanner looks for:
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                {
                  icon: User,
                  title: "Usernames across public websites",
                  description: "Our username scanner checks 500+ platforms to see where a username appears, from major social networks to niche forums and services."
                },
                {
                  icon: Mail,
                  title: "Email exposure from known breaches",
                  description: "The email breach scanner cross-references emails against aggregated breach databases to identify potential password exposures."
                },
                {
                  icon: Globe,
                  title: "Public profiles and linked accounts",
                  description: "We identify connections between accounts that use the same username or email across different platforms—revealing your web presence."
                },
                {
                  icon: Search,
                  title: "Open-source intelligence sources",
                  description: "Our OSINT scanner queries public records, search engines, and intelligence databases that aggregate publicly available information."
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
                <strong className="text-foreground">Important:</strong> All sources our footprint scanner queries are publicly accessible. We do not access private databases, bypass authentication, or use any data that isn't already available through open channels.
              </p>
            </div>
          </section>

          {/* What FootprintIQ Does NOT Do */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">What a Legitimate Footprint Scanner Avoids</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Ethical boundaries matter. We believe in transparency about what our digital footprint scanner does and—equally important—what it doesn't do. These aren't limitations; they're intentional choices that define who we are.
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                {
                  title: "No private database access",
                  description: "We don't purchase, steal, or access private datasets. If information isn't publicly available, our footprint scanner doesn't have it."
                },
                {
                  title: "No monitoring or tracking",
                  description: "We don't install software on your devices, track your browsing, or continuously watch your online activity."
                },
                {
                  title: "No scraping behind logins",
                  description: "We don't log into accounts to access protected content. If it requires authentication, it's off-limits to our online visibility checker."
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
                We draw clear ethical lines because trust matters more than features. You should know exactly what a footprint scanner does before you use it—and FootprintIQ is built on that principle.
              </p>
            </div>
          </section>

          {/* Digital Footprint Scanner Comparison - NEW SECTION */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Digital Footprint Scanner Comparison</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                Not all digital footprint tools serve the same purpose. Understanding the differences helps you choose the right online exposure check for your needs:
              </p>
            </div>

            <div className="overflow-x-auto mb-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Feature</TableHead>
                    <TableHead>Free Footprint Scanners</TableHead>
                    <TableHead>Paid Monitoring Services</TableHead>
                    <TableHead>Data Broker Sites</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Cost</TableCell>
                    <TableCell>Free or freemium</TableCell>
                    <TableCell>$10-30/month</TableCell>
                    <TableCell>"Free" (you're the product)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Scan Type</TableCell>
                    <TableCell>On-demand, user-initiated</TableCell>
                    <TableCell>Continuous monitoring</TableCell>
                    <TableCell>Profile aggregation</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data Sources</TableCell>
                    <TableCell>Public OSINT sources</TableCell>
                    <TableCell>Public + some private sources</TableCell>
                    <TableCell>Purchased data, scraped info</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Your Data</TableCell>
                    <TableCell>Not sold or shared</TableCell>
                    <TableCell>Varies by provider</TableCell>
                    <TableCell>Actively sold to third parties</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Purpose</TableCell>
                    <TableCell>Self-awareness & education</TableCell>
                    <TableCell>Alerts & ongoing protection</TableCell>
                    <TableCell>Profit from your information</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Best For</TableCell>
                    <TableCell>One-time audits, learning</TableCell>
                    <TableCell>High-risk individuals</TableCell>
                    <TableCell>No one (avoid these)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">One-Time Scans</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Best for periodic privacy audits. Run a free footprint scan when you want to understand your current exposure. Ideal for most users who want awareness without ongoing costs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Continuous Monitoring</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Appropriate for high-risk individuals (executives, public figures) who need immediate alerts when new exposure appears. Paid services offer this.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Scale className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Self-Service vs. Managed</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Self-service footprint scanners give you control and education. Managed services handle removal for you but cost more and require trusting a third party.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none mb-10">
              <p>
                FootprintIQ fits the "free footprint scanner" category—we focus on awareness and education, giving you the knowledge to make informed decisions. For most people, periodic self-audits provide sufficient protection without ongoing costs.
              </p>
            </div>

            {/* FootprintIQ vs Competitors Table */}
            <h3 className="text-xl font-semibold mb-4">FootprintIQ vs. Competitors & Data Broker Sites</h3>
            <p className="text-muted-foreground mb-6">
              See how FootprintIQ compares to popular alternatives and why we're different from data broker sites that profit from your information:
            </p>
            
            <div className="overflow-x-auto mb-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Feature</TableHead>
                    <TableHead className="bg-primary/5">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        FootprintIQ
                      </span>
                    </TableHead>
                    <TableHead>Have I Been Pwned</TableHead>
                    <TableHead>Namechk / KnowEm</TableHead>
                    <TableHead>BeenVerified / Spokeo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Username search</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> 500+ sites
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell>~100 sites</TableCell>
                    <TableCell className="text-muted-foreground">Limited</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Email breach check</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">Partial</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Phone lookup</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell>Yes (paid)</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Data broker detection</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell className="text-destructive">They ARE brokers</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Free tier</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Generous
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    </TableCell>
                    <TableCell>Limited</TableCell>
                    <TableCell className="text-destructive">Teaser only</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sells your data</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <XCircle className="h-4 w-4" /> Never
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-primary" /> No
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-primary" /> No
                      </span>
                    </TableCell>
                    <TableCell className="text-destructive font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Yes
                      </span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Ethical OSINT focus</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Core principle
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" /> Yes
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Partial</TableCell>
                    <TableCell className="text-destructive">
                      <XCircle className="h-4 w-4" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Risk education</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Detailed
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Basic</TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Unified report</TableCell>
                    <TableCell className="bg-primary/5">
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <CheckCircle2 className="h-4 w-4" /> All-in-one
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">Breaches only</TableCell>
                    <TableCell className="text-muted-foreground">Usernames only</TableCell>
                    <TableCell>Aggregated (paid)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 border border-border/50">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-1">Why FootprintIQ is different</p>
                  <p className="text-sm text-muted-foreground">
                    Unlike data broker sites that profit by selling your information, FootprintIQ exists to give you visibility and control. We combine the best of specialized tools—username search, breach detection, and data broker awareness—into a single ethical platform that never sells your data.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Visibility Matters */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Why Use an Online Footprint Scanner?</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p>
                Identity theft and fraud aren't usually the result of a single dramatic hack. They're opportunistic—criminals look for exposed information and combine small pieces into larger attacks over time. A digital footprint scanner helps you see what they might find.
              </p>
              
              <p>
                An old email password from a 2015 breach might still work on other accounts where you reused it. A username connected across multiple platforms can help someone impersonate you or answer security questions. Aggregated personal details from data brokers can fuel targeted phishing attacks.
              </p>
              
              <p>
                The risk isn't hypothetical. It's mathematical. The more exposure you have, the more opportunity attackers have to find a weak point. Old data doesn't become safe just because time passes—it often sits in searchable databases indefinitely. An internet footprint check reveals these accumulated risks.
              </p>
              
              <p>
                Understanding your exposure is the first step toward reducing it. You can't address risks you don't know exist. That's why using a web presence scanner regularly is essential for modern digital hygiene.
              </p>
            </div>
          </section>

          {/* Footprint Scanner vs. Data Broker Sites */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Footprint Scanner vs. Data Broker Sites</h2>
            
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
                FootprintIQ exists to give you knowledge and agency—not to exploit your data or enable misuse. Our online footprint scanner focuses on helping you understand risk, make decisions, and take action if you choose to. The difference between awareness and exploitation isn't subtle; it's fundamental.
              </p>
              <p>
                If you're concerned about data brokers specifically, our guide on{" "}
                <Link to="/blog/remove-data-brokers" className="text-primary hover:underline">
                  how to remove yourself from data broker sites
                </Link>{" "}
                provides actionable steps you can take after running a footprint scan.
              </p>
            </div>
          </section>

          {/* Who Should Use a Digital Footprint Scanner */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Who Should Use a Digital Footprint Scanner?</h2>
            
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
                        Anyone who wants to understand their online visibility and take control of their personal information. Whether you're concerned about identity theft, protecting family members, or simply curious about your digital presence—an online footprint scanner provides answers.
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
                        People who need to audit their web presence for career reasons—job seekers reviewing what employers might find, executives managing reputation risk, or public figures assessing their exposure with a personal data scanner.
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
                        Anyone who wants to reduce their long-term exposure—people who've experienced a breach, those going through life changes, or anyone looking to minimize their attack surface with a free footprint scanner.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* What You Can Do After Scanning */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Next Steps After Running a Footprint Scan</h2>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              <p>
                A footprint scan is information, not a verdict. What you do with that information depends on your priorities and circumstances. Here are some common next steps after using our digital footprint scanner:
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
                  icon: Target,
                  title: "Decide what exposure matters",
                  description: "Not all visibility is equally risky. A public professional profile is different from an exposed password. Prioritize based on actual risk revealed by your footprint scan."
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
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <HelpCircle className="h-7 w-7 text-primary" />
              Common Questions About Footprint Scanning
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
            <h2 className="text-2xl font-bold mb-4">Understand Your Online Exposure</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Knowledge is the first step toward better security. Run a free footprint scan to see what information about you exists in public sources—no surveillance, no data selling, just clarity.
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
                <Link 
                  to="/which-data-matters" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    Which Personal Data Matters?
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Prioritising high-impact vs low-impact data
                  </span>
                </Link>
                <Link 
                  to="/stay-private-online" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    Is It Possible to Stay Private Online?
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Realistic privacy expectations today
                  </span>
                </Link>
                <Link 
                  to="/ai-answers-hub" 
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-colors group"
                >
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors block mb-1">
                    AI Answers Hub
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Quick answers to common privacy questions
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
