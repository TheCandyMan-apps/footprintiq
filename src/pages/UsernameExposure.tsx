import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Link2,
  Eye, 
  Search, 
  AlertCircle, 
  Clock, 
  Shield, 
  ChevronRight,
  Users,
  Globe,
  Database,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const UsernameExposure = () => {
  const faqs = [
    {
      question: "How do usernames link accounts together?",
      answer: "When you use the same username across multiple platforms, anyone can search for that handle and find all your associated accounts. Search engines index public profiles, and OSINT tools automate this process by checking hundreds of platforms simultaneously. The username becomes a unique identifier that connects otherwise separate accounts into a single, visible pattern."
    },
    {
      question: "Can I stop my accounts from being linked?",
      answer: "You can reduce future linking by using different usernames for different contexts—one for professional use, another for personal, and perhaps others for specific interests. However, accounts already created with the same username will remain linked unless you change those usernames or delete the accounts. Complete prevention is difficult, but intentional variation significantly reduces exposure."
    },
    {
      question: "Is username exposure the same as being hacked?",
      answer: "No, they're fundamentally different. Hacking involves unauthorized access to your accounts or data. Username exposure is about visibility—the public information that anyone can find without breaking any rules. Your accounts can be highly visible without ever being compromised. Exposure is about what's publicly accessible, not about security breaches."
    },
    {
      question: "What tools do researchers use to find usernames?",
      answer: "Common open-source tools include Sherlock, Maigret, and WhatsMyName. These tools check whether a username exists on hundreds of platforms by making public queries to each site. They only access publicly available information—nothing behind logins or in private databases. Security researchers, journalists, and individuals use these tools for legitimate purposes."
    },
    {
      question: "Should I use different usernames for everything?",
      answer: "It depends on your goals. Using completely different usernames for every account offers maximum privacy but can be difficult to manage. A practical approach is to use distinct usernames for different contexts: professional identity, personal social media, gaming, forums, and so on. This limits how much information can be connected while remaining manageable."
    },
    {
      question: "How can I check my username exposure?",
      answer: "Start by searching your common usernames in a search engine to see what appears. For a more thorough check, a digital footprint scanner can search hundreds of platforms automatically and show you where your usernames appear. This gives you a clear picture of your current exposure so you can make informed decisions about what to address."
    }
  ];

  const misconceptions = [
    {
      myth: "Only hackers can link my accounts",
      reality: "Anyone with a search engine or free OSINT tool can do this",
      icon: XCircle
    },
    {
      myth: "I need to be 'targeted' to be exposed",
      reality: "Automated tools scan usernames without targeting individuals",
      icon: XCircle
    },
    {
      myth: "Deleting an account removes all traces",
      reality: "Archives, screenshots, and data broker records often persist",
      icon: XCircle
    },
    {
      myth: "Unique passwords protect my privacy",
      reality: "Passwords protect access; usernames create visibility",
      icon: XCircle
    },
    {
      myth: "My accounts are too small to matter",
      reality: "Small accounts still contain metadata and context",
      icon: XCircle
    },
    {
      myth: "I haven't done anything wrong, so exposure doesn't matter",
      reality: "Exposure isn't about wrongdoing—it's about control over your information",
      icon: XCircle
    }
  ];

  const osintReveals = [
    "Account existence across hundreds of platforms",
    "Profile photos and biographical information",
    "Activity patterns and timestamps",
    "Associated emails or linked accounts",
    "Group memberships and public posts",
    "Historical usernames and account changes"
  ];

  const practicalGuidance = [
    {
      title: "Audit your usernames",
      description: "Search your common handles to see what's visible across the web"
    },
    {
      title: "Vary usernames by context",
      description: "Consider different handles for professional vs. personal use"
    },
    {
      title: "Review old accounts",
      description: "Identify and delete platforms you no longer use"
    },
    {
      title: "Check privacy settings",
      description: "Many profiles are public by default—adjust as needed"
    },
    {
      title: "Don't panic",
      description: "Exposure exists for almost everyone—understanding it is the first step"
    }
  ];

  // FAQ Schema
  const faqSchema = {
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

  // Breadcrumb Schema
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
        "name": "Digital Footprint Scanner",
        "item": "https://footprintiq.app/digital-footprint-scanner"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Username Exposure",
        "item": "https://footprintiq.app/username-exposure"
      }
    ]
  };

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Username Exposure: How Accounts Get Linked Across the Internet",
    "description": "Learn how reused usernames quietly link your accounts across the internet. Understand what OSINT reveals about usernames and how to manage your exposure.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://footprintiq.app/og-image.png"
      }
    },
    "datePublished": "2025-01-17",
    "dateModified": "2025-01-17",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://footprintiq.app/username-exposure"
    }
  };

  return (
    <>
      <Helmet>
        <title>Username Footprint Scan — How Your Online Accounts Get Linked | FootprintIQ</title>
        <meta 
          name="description" 
          content="Understand username footprint scans and how reused usernames link your accounts across social media. Learn what OSINT reveals about personal information and identity theft risks." 
        />
        <meta name="keywords" content="username footprint scan, username exposure, account linking, OSINT usernames, username privacy, digital footprint, social media, personal data, personal information, email addresses, identity theft, public record" />
        <link rel="canonical" href="https://footprintiq.app/username-exposure" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Username Footprint Scan — How Your Online Accounts Get Linked" />
        <meta property="og:description" content="Learn how reused usernames link your social media accounts and expose personal information across the internet." />
        <meta property="og:url" content="https://footprintiq.app/username-exposure" />
        <meta property="og:type" content="article" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Username Footprint Scan: How Accounts Get Linked" />
        <meta name="twitter:description" content="Learn how reused usernames quietly link your accounts across the internet." />
        
        {/* Schemas */}
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-grow">
          {/* Breadcrumb */}
          <div className="bg-muted/30 border-b border-border/50">
            <div className="container mx-auto px-4 py-3">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="h-4 w-4" />
                <Link to="/digital-footprint-scanner" className="hover:text-foreground transition-colors">Digital Footprint Scanner</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Username Footprint Scan</span>
              </nav>
            </div>
          </div>

          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Link2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Educational Guide</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  How Reusing Usernames Connects Your Online Accounts
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  Usernames are public identifiers that travel across social media and the internet. When you use the same handle 
                  on multiple platforms, your accounts become connected—exposing personal information and personal data 
                  without anyone actively tracking you.
                </p>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  This guide explains how username footprint scans work, what they reveal about your email addresses and public record, 
                  and practical steps to reduce identity theft risks.
                </p>
                
                {/* Internal Links - NEW */}
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/usernames" className="text-primary hover:underline flex items-center gap-1">
                    <ArrowRight className="h-4 w-4" />
                    Scan Your Username
                  </Link>
                  <Link to="/username-search-tools" className="text-primary hover:underline flex items-center gap-1">
                    <ArrowRight className="h-4 w-4" />
                    Compare OSINT Tools
                  </Link>
                  <Link to="/digital-footprint-scanner" className="text-primary hover:underline flex items-center gap-1">
                    <ArrowRight className="h-4 w-4" />
                    Full Footprint Analysis
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* How Reused Usernames Create Exposure */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How Reused Usernames Create Exposure
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    A username is like a calling card left at every platform you join. When you use "alex_gamer" 
                    on Twitter, Reddit, GitHub, Discord, and a gaming forum, you've created a visible thread that 
                    connects all five accounts.
                  </p>

                  <p>
                    This exposure isn't about hacking or sophisticated surveillance. It's simply about visibility. 
                    Each platform where your username appears becomes a data point, and together these data points 
                    form a pattern that anyone can observe.
                  </p>

                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 my-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">The Linking Effect</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary mt-1 shrink-0" />
                        <p className="text-muted-foreground">
                          Same username on Twitter + Reddit = connected public presence
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-primary mt-1 shrink-0" />
                        <p className="text-muted-foreground">
                          Gaming handle + professional GitHub = merged identity
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Layers className="h-5 w-5 text-primary mt-1 shrink-0" />
                        <p className="text-muted-foreground">
                          Old forum account + current social media = historical trail
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <Link2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                        <p className="text-muted-foreground">
                          Each new platform = another link in the chain
                        </p>
                      </div>
                    </div>
                  </div>

                  <p>
                    The key insight is that exposure accumulates. Each account you create with the same username 
                    adds another piece to a puzzle that becomes increasingly complete over time.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why Account Linking Happens Quietly */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why Account Linking Happens Quietly
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    There's no notification when your accounts become connected in someone's view. The linking 
                    happens through ordinary, everyday processes that most people never think about.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="bg-background rounded-xl p-6 border border-border/50">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Search Engine Indexing</h3>
                      <p className="text-muted-foreground text-base">
                        Search engines automatically crawl and index public profiles. A simple search for your 
                        username often reveals accounts across multiple platforms on the first page of results.
                      </p>
                    </div>
                    
                    <div className="bg-background rounded-xl p-6 border border-border/50">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Data Aggregation</h3>
                      <p className="text-muted-foreground text-base">
                        Data brokers and aggregators continuously collect public information. They don't need 
                        to target you specifically—they systematically gather data from all publicly accessible sources.
                      </p>
                    </div>
                    
                    <div className="bg-background rounded-xl p-6 border border-border/50">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Web Archives</h3>
                      <p className="text-muted-foreground text-base">
                        Services like the Wayback Machine preserve snapshots of web pages. Old accounts and 
                        profiles can persist in archives long after you've forgotten about them.
                      </p>
                    </div>
                    
                    <div className="bg-background rounded-xl p-6 border border-border/50">
                      <h3 className="text-lg font-semibold text-foreground mb-3">Automated Tools</h3>
                      <p className="text-muted-foreground text-base">
                        Open-source tools can check hundreds of platforms for a username in seconds. Anyone 
                        can use these tools—they require no special access or technical expertise.
                      </p>
                    </div>
                  </div>

                  <p>
                    The quiet nature of this process is why many people are surprised when they discover how 
                    much of their online presence is already connected and visible.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What OSINT Reveals About Usernames */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What OSINT Reveals About Usernames
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    OSINT—Open Source Intelligence—refers to information gathered from publicly available sources. 
                    When applied to usernames, OSINT tools automate what anyone could do manually: searching for 
                    a handle across the internet.
                  </p>

                  <p>
                    Tools like Sherlock, Maigret, and WhatsMyName can check whether a username exists on hundreds 
                    of platforms in a matter of seconds. Here's what these tools typically reveal:
                  </p>

                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 my-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Information OSINT Tools Can Find</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {osintReveals.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 my-8">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Important Clarification</h3>
                    <p className="text-muted-foreground mb-0">
                      These tools only access publicly available data. They cannot see content behind logins, 
                      access private messages, or retrieve information from closed databases. If a profile is 
                      set to private, OSINT tools can only confirm the account exists—not what it contains.
                    </p>
                  </div>

                  <p>
                    Understanding what OSINT can reveal helps you make informed decisions about what you share 
                    publicly and which usernames you use where.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Common Misconceptions */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <AlertCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Common Misconceptions About Username Exposure
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  Several false beliefs lead people to underestimate or misunderstand their username exposure. 
                  Here are the most common misconceptions—and the reality.
                </p>

                <div className="space-y-4">
                  {misconceptions.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-background rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                          <XCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-2">
                            Myth: "{item.myth}"
                          </p>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                            <p className="text-muted-foreground">
                              <span className="font-medium text-foreground">Reality:</span> {item.reality}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* The Quiet Accumulation */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    The Quiet Accumulation of Exposure
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    Digital footprints don't appear suddenly—they accumulate over years of internet use. 
                    The forum account you created in 2012 still exists. The gaming profile from 2015 is 
                    still indexed. The social media handle you used briefly in 2018 remains searchable.
                  </p>

                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 my-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">How Exposure Compounds Over Time</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Years of account creation</p>
                          <p className="text-muted-foreground">Each new platform adds another layer to your visible presence</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Persistent old accounts</p>
                          <p className="text-muted-foreground">Platforms you've forgotten about continue to exist and be indexed</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Context combination</p>
                          <p className="text-muted-foreground">Gaming + professional + social accounts together reveal more than any single account</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">4</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Archive preservation</p>
                          <p className="text-muted-foreground">Web archives and cached pages preserve content even after deletion</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p>
                    Time doesn't erase exposure—it typically expands it. This is why understanding your current 
                    footprint is valuable: it gives you a starting point for making informed decisions going forward.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Practical Guidance */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Practical Guidance for Managing Exposure
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  Managing username exposure doesn't require dramatic action. Here are practical steps that 
                  make a meaningful difference:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {practicalGuidance.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-background rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                          <p className="text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What to Avoid</h3>
                  <div className="space-y-3 text-muted-foreground">
                    <p>
                      <strong className="text-foreground">Don't delete everything overnight.</strong> Rushed 
                      decisions often lead to losing access to accounts you actually need.
                    </p>
                    <p>
                      <strong className="text-foreground">Don't aim for perfect invisibility.</strong> Complete 
                      removal is extremely difficult and usually unnecessary for most people.
                    </p>
                    <p>
                      <strong className="text-foreground">Don't panic.</strong> Exposure exists for almost 
                      everyone who has used the internet. Awareness is the first step to informed management.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Understanding vs Eliminating */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Understanding vs. Eliminating Exposure
                </h2>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    Complete elimination of username exposure is extremely difficult—and for most people, 
                    unnecessary. Some exposure is intentional: professional branding, public portfolios, 
                    and social media presence often serve important purposes.
                  </p>

                  <p>
                    The goal isn't zero footprint. The goal is awareness and informed choice. When you 
                    understand what's visible, you can decide whether it aligns with your personal and 
                    professional goals.
                  </p>

                  <div className="bg-muted/50 rounded-2xl p-8 border border-border/50 my-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Check Your Username Exposure</h3>
                    <p className="text-muted-foreground mb-6">
                      For a comprehensive understanding of where your usernames appear, a{" "}
                      <Link to="/digital-footprint-scanner" className="text-primary hover:underline font-medium">
                        digital footprint scanner
                      </Link>{" "}
                      can search hundreds of platforms automatically and present a clear picture of your 
                      current exposure.
                    </p>
                    <Link 
                      to="/scan"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      Start a Free Scan
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
                  Frequently Asked Questions
                </h2>

                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`faq-${index}`}
                      className="bg-background rounded-xl border border-border/50 px-6"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-5">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>

          {/* Related Resources */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">Related Resources</h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Link 
                    to="/what-is-a-digital-footprint"
                    className="p-5 bg-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      What Is a Digital Footprint?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Understand the basics of digital footprints and how they form
                    </p>
                  </Link>
                  
                  <Link 
                    to="/username-search"
                    className="p-5 bg-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      Username Search Tools
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Learn about tools for checking username visibility
                    </p>
                  </Link>
                  
                  <Link 
                    to="/digital-footprint-scanner"
                    className="p-5 bg-muted/50 rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      Digital Footprint Scanner
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive scanning across hundreds of sources
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default UsernameExposure;
