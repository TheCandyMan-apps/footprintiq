import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Globe, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  MapPin,
  Image,
  ShoppingCart,
  FileText,
  Database
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const WhatIsDigitalFootprintEducational = () => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a digital footprint in simple terms?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A digital footprint is the trail of data you leave behind when you use the internet. This includes everything from social media posts and online purchases to websites you visit and emails you send. Think of it as your online shadow—it follows you everywhere you go on the web."
        }
      },
      {
        "@type": "Question",
        "name": "What are examples of digital footprints?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Examples include social media profiles and posts, online shopping accounts, email accounts, forum comments, blog posts, search history, website cookies, data broker profiles, and records from data breaches. Both intentional actions (posting photos) and passive data collection (browser cookies) contribute to your footprint."
        }
      },
      {
        "@type": "Question",
        "name": "Is having a digital footprint bad?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Not necessarily. A digital footprint is simply a fact of using the internet. However, an unmanaged footprint can increase risks like identity theft, targeted phishing, and unwanted exposure of personal information. The goal is awareness and management, not complete elimination."
        }
      },
      {
        "@type": "Question",
        "name": "Can I delete my digital footprint?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Complete deletion is extremely difficult because data is often copied, cached, and stored by third parties. However, you can significantly reduce your footprint by deleting unused accounts, opting out of data broker listings, adjusting privacy settings, and being more mindful about what you share online."
        }
      },
      {
        "@type": "Question",
        "name": "What's the difference between active and passive footprints?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "An active footprint consists of data you intentionally share, like social media posts or forum comments. A passive footprint is data collected without your direct action, such as browsing history, IP addresses, cookies, and information gathered by data brokers. Both contribute to your overall digital presence."
        }
      },
      {
        "@type": "Question",
        "name": "How can I check my digital footprint for free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can start by searching your name and usernames in search engines, checking breach databases for your email, and reviewing your social media privacy settings. For a more comprehensive view, digital footprint scanning tools can search across hundreds of sources to show where your information appears online."
        }
      }
    ]
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
        "name": "Digital Footprint Scanner",
        "item": "https://footprintiq.app/digital-footprint-scanner"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "What Is a Digital Footprint?",
        "item": "https://footprintiq.app/what-is-a-digital-footprint"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is a Digital Footprint? Examples, Risks, and How to Check Yours",
    "description": "Learn what a digital footprint is, the difference between active and passive footprints, real-world examples, why exposure grows over time, and how to check your own digital presence.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": "https://footprintiq.app/logo.png"
      }
    },
    "datePublished": "2025-01-17",
    "dateModified": "2025-01-17",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://footprintiq.app/what-is-a-digital-footprint"
    }
  };

  const activeExamples = [
    { icon: MessageSquare, text: "Social media posts and comments" },
    { icon: User, text: "Creating online profiles and accounts" },
    { icon: FileText, text: "Forum discussions and blog posts" },
    { icon: Image, text: "Uploading photos and videos" },
    { icon: Mail, text: "Sending emails and messages" },
    { icon: ShoppingCart, text: "Online reviews and ratings" }
  ];

  const passiveExamples = [
    { icon: Globe, text: "Browsing history and website visits" },
    { icon: MapPin, text: "IP address and location data" },
    { icon: Database, text: "Data broker profile compilation" },
    { icon: AlertTriangle, text: "Records from data breaches" },
    { icon: Eye, text: "Tracking cookies and pixels" },
    { icon: Clock, text: "Device and session metadata" }
  ];

  const realWorldExamples = [
    {
      title: "Creating a social media account",
      description: "Your name, email, photos, and connections become part of your footprint."
    },
    {
      title: "Signing up for newsletters",
      description: "Your email gets added to marketing databases and may be shared."
    },
    {
      title: "Posting photos with location data",
      description: "Image metadata can reveal where and when photos were taken."
    },
    {
      title: "Using the same username everywhere",
      description: "Makes it easy to link your accounts across different platforms."
    },
    {
      title: "Having your email in a data breach",
      description: "Breached data persists in databases and forums indefinitely."
    },
    {
      title: "Old forum posts from years ago",
      description: "Archived content remains searchable even after you forget it exists."
    },
    {
      title: "Online shopping accounts",
      description: "Purchase history, addresses, and payment details are stored."
    },
    {
      title: "Public records and registrations",
      description: "Voter records, property data, and legal documents are often public."
    }
  ];

  const growthReasons = [
    {
      icon: Clock,
      title: "Accounts accumulate over years",
      description: "Most people create dozens of accounts throughout their internet use, many forgotten."
    },
    {
      icon: Database,
      title: "Old data doesn't disappear",
      description: "Deleted content is often cached, archived, or stored by third parties."
    },
    {
      icon: Globe,
      title: "Data brokers aggregate continuously",
      description: "Companies compile information from multiple sources into detailed profiles."
    },
    {
      icon: AlertTriangle,
      title: "Breach databases grow constantly",
      description: "Each new data breach adds more exposed records to existing collections."
    }
  ];

  const risks = [
    {
      icon: AlertTriangle,
      title: "Identity theft",
      description: "More available data makes it easier for criminals to impersonate you."
    },
    {
      icon: Mail,
      title: "Targeted phishing",
      description: "Personal details enable more convincing and personalized scam attempts."
    },
    {
      icon: User,
      title: "Reputation impact",
      description: "Old or forgotten content can resurface and affect personal or professional life."
    },
    {
      icon: Eye,
      title: "Doxxing risks",
      description: "Public-facing individuals may have private information exposed maliciously."
    }
  ];

  const reductionTips = [
    "Delete unused accounts and old profiles",
    "Use unique, strong passwords for each service",
    "Review privacy settings on social media regularly",
    "Be mindful of what you share publicly online",
    "Consider using aliases for non-essential sign-ups",
    "Opt out of data broker listings where possible",
    "Use privacy-focused browsers and search engines",
    "Limit app permissions on your devices"
  ];

  return (
    <>
      <Helmet>
        <title>What Is a Digital Footprint? Examples, Risks & How to Check Yours | FootprintIQ</title>
        <meta 
          name="description" 
          content="Learn what a digital footprint is, the difference between active and passive footprints, real-world examples, and how to check and reduce your online exposure." 
        />
        <meta 
          name="keywords" 
          content="digital footprint, what is digital footprint, active footprint, passive footprint, online presence, digital exposure, internet privacy, data privacy" 
        />
        <link rel="canonical" href="https://footprintiq.app/what-is-a-digital-footprint" />
        <meta property="og:title" content="What Is a Digital Footprint? Examples, Risks & How to Check" />
        <meta property="og:description" content="Understand your digital footprint: what it is, how it grows, and what you can do about it." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://footprintiq.app/what-is-a-digital-footprint" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="border-b border-border/40">
          <div className="container mx-auto px-4 py-3">
            <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li>/</li>
                <li><Link to="/digital-footprint-scanner" className="hover:text-primary transition-colors">Digital Footprint Scanner</Link></li>
                <li>/</li>
                <li className="text-foreground">What Is a Digital Footprint?</li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                What Is a Digital Footprint?
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Examples, Risks, and How to Check Yours
              </p>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Every time you use the internet, you leave behind traces of data. This guide explains 
                what a digital footprint is, how it grows, and what you can do to understand and manage yours.
              </p>
            </div>
          </div>
        </section>

        {/* What Is a Digital Footprint */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">What Is a Digital Footprint?</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  A digital footprint is the trail of data you create while using the internet. It includes 
                  everything from social media posts and online purchases to the websites you visit and the 
                  emails you send.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  Think of it as your online shadow—it follows you everywhere you go on the web. Some of this 
                  data you create intentionally, while other data is collected about you without your direct 
                  involvement.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Your digital footprint exists whether you're aware of it or not. Understanding what 
                  contributes to it is the first step toward managing your online presence effectively.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Active vs Passive Footprints */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-center">Active vs Passive Footprints</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
                Your digital footprint consists of two types: data you intentionally share and data 
                that's collected about you automatically.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Active Footprint */}
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold">Active Footprint</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Data you intentionally create and share online. You have direct control over this.
                    </p>
                    <ul className="space-y-3">
                      {activeExamples.map((example, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <example.icon className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-foreground">{example.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Passive Footprint */}
                <Card className="border-2 border-muted">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-full bg-muted">
                        <EyeOff className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-2xl font-semibold">Passive Footprint</h3>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Data collected about you without your direct action. Often invisible to you.
                    </p>
                    <ul className="space-y-3">
                      {passiveExamples.map((example, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <example.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{example.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Real-World Examples */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-center">Real-World Examples of Digital Footprints</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
                Digital footprints form through everyday online activities. Here are common examples 
                of how your online presence builds up over time.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {realWorldExamples.map((example, index) => (
                  <Card key={index} className="h-full">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{example.title}</h3>
                      <p className="text-sm text-muted-foreground">{example.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Footprint Grows */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-center">Why Your Digital Footprint Grows Over Time</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
                Even if you're careful about what you share, your digital footprint tends to expand. 
                Here's why exposure accumulates rather than diminishes.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {growthReasons.map((reason, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 flex gap-4">
                      <div className="p-3 rounded-full bg-primary/10 h-fit">
                        <reason.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
                        <p className="text-muted-foreground">{reason.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>Key insight:</strong> Your digital footprint is cumulative. Every account created, 
                  every post made, and every breach that includes your data adds to your overall exposure. 
                  This is why periodic checks of your online presence are valuable—what you find might 
                  surprise you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Risks Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-center">The Risks of an Unmanaged Digital Footprint</h2>
              <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
                An extensive digital footprint isn't inherently dangerous, but awareness helps you make 
                informed decisions about your online presence.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {risks.map((risk, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
                        <risk.icon className="h-6 w-6 text-destructive" />
                      </div>
                      <h3 className="font-semibold mb-2">{risk.title}</h3>
                      <p className="text-sm text-muted-foreground">{risk.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 p-6 bg-background rounded-lg border">
                <p className="text-muted-foreground">
                  <strong>Note:</strong> The goal isn't to create fear about your digital presence. 
                  Rather, understanding these risks helps you make conscious choices about what you share 
                  and how you protect your information online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Check */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">How to Check Your Digital Footprint</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Understanding your current exposure is the first step toward managing it. Here are 
                practical ways to assess your digital footprint.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">1</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Search your name and usernames</h3>
                    <p className="text-muted-foreground">Use search engines to see what public information is associated with your name and common usernames.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">2</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Check for email breaches</h3>
                    <p className="text-muted-foreground">Look up your email addresses in breach databases to see if your credentials have been exposed. <Link to="/email-breach-check" className="text-primary hover:underline">Check your email for breaches</Link></p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">3</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Review social media privacy settings</h3>
                    <p className="text-muted-foreground">Check what information is publicly visible on your social accounts and adjust settings as needed.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">4</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Search your usernames across platforms</h3>
                    <p className="text-muted-foreground">See where your usernames appear online. <Link to="/username-search" className="text-primary hover:underline">Use a username search tool</Link></p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">5</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Use a comprehensive scanner</h3>
                    <p className="text-muted-foreground">For a more thorough assessment, a <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scanner</Link> can search hundreds of sources automatically to reveal where your information appears online.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Reducing */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Tips for Reducing Your Footprint</h2>
              <p className="text-lg text-muted-foreground mb-8">
                While complete elimination is impractical, you can take meaningful steps to reduce 
                your digital exposure.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {reductionTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg border">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <h3 className="font-semibold text-lg mb-2">What is a digital footprint in simple terms?</h3>
                  <p className="text-muted-foreground">
                    A digital footprint is the trail of data you leave behind when you use the internet. 
                    This includes everything from social media posts and online purchases to websites you 
                    visit and emails you send. Think of it as your online shadow—it follows you everywhere 
                    you go on the web.
                  </p>
                </div>

                <div className="border-b border-border pb-6">
                  <h3 className="font-semibold text-lg mb-2">What are examples of digital footprints?</h3>
                  <p className="text-muted-foreground">
                    Examples include social media profiles and posts, online shopping accounts, email 
                    accounts, forum comments, blog posts, search history, website cookies, data broker 
                    profiles, and records from data breaches. Both intentional actions (posting photos) 
                    and passive data collection (browser cookies) contribute to your footprint.
                  </p>
                </div>

                <div className="border-b border-border pb-6">
                  <h3 className="font-semibold text-lg mb-2">Is having a digital footprint bad?</h3>
                  <p className="text-muted-foreground">
                    Not necessarily. A digital footprint is simply a fact of using the internet. However, 
                    an unmanaged footprint can increase risks like identity theft, targeted phishing, and 
                    unwanted exposure of personal information. The goal is awareness and management, not 
                    complete elimination.
                  </p>
                </div>

                <div className="border-b border-border pb-6">
                  <h3 className="font-semibold text-lg mb-2">Can I delete my digital footprint?</h3>
                  <p className="text-muted-foreground">
                    Complete deletion is extremely difficult because data is often copied, cached, and 
                    stored by third parties. However, you can significantly reduce your footprint by 
                    deleting unused accounts, opting out of data broker listings, adjusting privacy 
                    settings, and being more mindful about what you share online.
                  </p>
                </div>

                <div className="border-b border-border pb-6">
                  <h3 className="font-semibold text-lg mb-2">What's the difference between active and passive footprints?</h3>
                  <p className="text-muted-foreground">
                    An active footprint consists of data you intentionally share, like social media posts 
                    or forum comments. A passive footprint is data collected without your direct action, 
                    such as browsing history, IP addresses, cookies, and information gathered by data 
                    brokers. Both contribute to your overall digital presence.
                  </p>
                </div>

                <div className="pb-6">
                  <h3 className="font-semibold text-lg mb-2">How can I check my digital footprint for free?</h3>
                  <p className="text-muted-foreground">
                    You can start by searching your name and usernames in search engines, checking breach 
                    databases for your email, and reviewing your social media privacy settings. For a more 
                    comprehensive view, <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scanning tools</Link> can 
                    search across hundreds of sources to show where your information appears online.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Summary & CTA */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4">Take Control of Your Digital Presence</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Understanding your digital footprint is the first step toward managing it. Whether you're 
                concerned about privacy, security, or simply curious about your online presence, 
                knowing where your information appears is valuable knowledge.
              </p>
              <Button asChild size="lg">
                <Link to="/digital-footprint-scanner">
                  Check Your Digital Footprint
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default WhatIsDigitalFootprintEducational;
