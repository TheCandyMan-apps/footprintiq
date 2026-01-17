import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { 
  Search, 
  Eye, 
  Shield, 
  Scale, 
  Users, 
  BookOpen,
  ChevronRight,
  Globe,
  Lock,
  CheckCircle2,
  XCircle,
  Building2,
  UserCheck,
  AlertTriangle,
  FileSearch,
  Lightbulb
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WhatIsOsint = () => {
  const faqs = [
    {
      question: "What does OSINT stand for?",
      answer: "OSINT stands for Open-Source Intelligence. It refers to the collection, analysis, and use of information from publicly available sources. 'Open-source' in this context means the information is accessible to anyone—not to be confused with open-source software, which is a separate concept."
    },
    {
      question: "Is OSINT legal?",
      answer: "Yes, OSINT is legal when conducted properly. By definition, OSINT only uses publicly available information that anyone could access. It doesn't involve hacking, bypassing security measures, or accessing private data without authorization. However, how the information is used after collection may be subject to various laws depending on jurisdiction and purpose."
    },
    {
      question: "How is OSINT different from hacking?",
      answer: "OSINT and hacking are fundamentally different. OSINT collects only publicly accessible information—data that's already visible to anyone. Hacking involves unauthorized access to systems, bypassing security controls, or exploiting vulnerabilities. OSINT practitioners never break into accounts, intercept communications, or access private databases."
    },
    {
      question: "Who uses OSINT?",
      answer: "OSINT is used by a wide range of professionals and individuals: journalists investigating stories, security researchers assessing threats, HR professionals verifying candidates, individuals checking their own digital exposure, law enforcement (with proper protocols), corporate security teams, and academic researchers studying online phenomena."
    },
    {
      question: "Can I use OSINT to check my own digital footprint?",
      answer: "Absolutely. One of the most common and beneficial uses of OSINT is self-assessment. By understanding what information about you is publicly visible, you can make informed decisions about your privacy, identify old accounts to delete, and understand your exposure level. This is a responsible use of OSINT that helps individuals take control of their digital presence."
    },
    {
      question: "What makes OSINT ethical?",
      answer: "Ethical OSINT is defined by transparency, legality, and purpose. It only uses publicly available data, never attempts unauthorized access, respects privacy boundaries, and is conducted for legitimate purposes such as self-protection, security research, journalism, or authorized investigations. The intent and methods matter as much as the information gathered."
    }
  ];

  const osintVsSurveillance = [
    {
      aspect: "Data Sources",
      osint: "Publicly available information only",
      surveillance: "May include private data, intercepted communications",
      icon: Globe
    },
    {
      aspect: "Access Method",
      osint: "No bypassing of security or authentication",
      surveillance: "May involve unauthorized access or monitoring",
      icon: Lock
    },
    {
      aspect: "Transparency",
      osint: "Methods could be disclosed without legal issue",
      surveillance: "Often conducted covertly with legal restrictions",
      icon: Eye
    },
    {
      aspect: "Legal Status",
      osint: "Legal by definition (public information)",
      surveillance: "Requires authorization, warrants, or legal basis",
      icon: Scale
    },
    {
      aspect: "Target Awareness",
      osint: "Information was already public—no expectation of privacy",
      surveillance: "Monitors activities subjects expect to be private",
      icon: Users
    }
  ];

  const ethicalPrinciples = [
    {
      title: "Public Data Only",
      description: "Never access information behind logins, paywalls, or security measures",
      icon: Globe
    },
    {
      title: "No Unauthorized Access",
      description: "No hacking, social engineering, or bypassing authentication",
      icon: Lock
    },
    {
      title: "Legitimate Purpose",
      description: "Self-protection, security research, journalism, or authorized investigation",
      icon: FileSearch
    },
    {
      title: "Proportional Collection",
      description: "Gather only what's necessary—avoid excessive data hoarding",
      icon: Scale
    },
    {
      title: "Responsible Handling",
      description: "Protect collected data and don't enable harassment or harm",
      icon: Shield
    },
    {
      title: "Transparency",
      description: "Methods should be explainable and legally defensible",
      icon: Lightbulb
    }
  ];

  const responsibleUsers = [
    {
      title: "Individuals",
      description: "Check your own digital footprint, understand your exposure, and make informed privacy decisions",
      icon: UserCheck
    },
    {
      title: "Security Professionals",
      description: "Assess organizational threat surfaces, identify vulnerabilities, and protect clients ethically",
      icon: Shield
    },
    {
      title: "Journalists & Researchers",
      description: "Verify information, investigate public interest matters, and fact-check responsibly",
      icon: BookOpen
    },
    {
      title: "HR & Background Screening",
      description: "Verify publicly available professional information with candidate awareness",
      icon: Building2
    },
    {
      title: "Legal Professionals",
      description: "Gather evidence from public sources for authorized legal proceedings",
      icon: Scale
    },
    {
      title: "Fraud Prevention Teams",
      description: "Identify potential risks and protect organizations from public-facing threats",
      icon: AlertTriangle
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
        "name": "What Is OSINT?",
        "item": "https://footprintiq.app/what-is-osint"
      }
    ]
  };

  // Article Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "What Is OSINT? Ethical Open-Source Intelligence Explained",
    "description": "Learn what OSINT means, how ethical open-source intelligence works, and the difference between OSINT and surveillance. Understand why OSINT is legal and who should use it responsibly.",
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
      "@id": "https://footprintiq.app/what-is-osint"
    }
  };

  return (
    <>
      <Helmet>
        <title>What Is OSINT? Ethical Open-Source Intelligence Explained | FootprintIQ</title>
        <meta 
          name="description" 
          content="Learn what OSINT means, how ethical open-source intelligence works, and the difference between OSINT and surveillance. Understand why OSINT is legal and who should use it responsibly." 
        />
        <meta name="keywords" content="OSINT, open source intelligence, ethical OSINT, OSINT meaning, OSINT definition, OSINT vs surveillance, legal OSINT, digital investigation" />
        <link rel="canonical" href="https://footprintiq.app/what-is-osint" />
        
        {/* Open Graph */}
        <meta property="og:title" content="What Is OSINT? Ethical Open-Source Intelligence Explained" />
        <meta property="og:description" content="Learn what OSINT means and how ethical open-source intelligence differs from surveillance." />
        <meta property="og:url" content="https://footprintiq.app/what-is-osint" />
        <meta property="og:type" content="article" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="What Is OSINT? Ethical Open-Source Intelligence Explained" />
        <meta name="twitter:description" content="Learn what OSINT means and how ethical open-source intelligence works." />
        
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
                <span className="text-foreground">What Is OSINT?</span>
              </nav>
            </div>
          </div>

          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                  <Search className="h-4 w-4" />
                  <span className="text-sm font-medium">Educational Guide</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                  What Is OSINT? Ethical Open-Source Intelligence Explained
                </h1>
                
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                  OSINT—Open-Source Intelligence—is the practice of gathering and analyzing information 
                  from publicly available sources. When conducted ethically, it's a legal, transparent, 
                  and valuable discipline used by security professionals, researchers, journalists, and 
                  individuals worldwide.
                </p>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  This guide explains what OSINT means, how it differs from surveillance, and the 
                  principles that distinguish ethical intelligence gathering from invasive practices.
                </p>
              </div>
            </div>
          </section>

          {/* What OSINT Means */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    What OSINT Means
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    <strong className="text-foreground">OSINT</strong> stands for <strong className="text-foreground">Open-Source Intelligence</strong>. 
                    It refers to the collection and analysis of information from sources that are publicly 
                    available to anyone.
                  </p>

                  <p>
                    The term "open-source" in this context doesn't refer to software—it means the 
                    information sources are open to the public. Anyone with an internet connection 
                    could access the same data.
                  </p>

                  <div className="bg-muted/50 rounded-2xl p-6 border border-border/50 my-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Common OSINT Sources</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Social media profiles and public posts</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Public records and government databases</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>News articles and publications</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Court records and legal filings</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Academic papers and research</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Company websites and registrations</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Forum posts and online communities</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                          <span>Publicly disclosed breach databases</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p>
                    OSINT has its roots in government intelligence agencies, which have long recognized 
                    that valuable intelligence can be gathered from newspapers, radio broadcasts, and 
                    public documents. Today, the internet has vastly expanded both the volume of public 
                    information and the tools available to analyze it.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How Ethical OSINT Works */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    How Ethical OSINT Works
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  Ethical OSINT is defined not just by what information is gathered, but by 
                  how it's gathered and why. Here are the core principles:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {ethicalPrinciples.map((principle, index) => (
                    <div 
                      key={index}
                      className="bg-background rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <principle.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{principle.title}</h3>
                          <p className="text-muted-foreground text-sm">{principle.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p>
                    The ethical OSINT process typically involves: defining a clear purpose, identifying 
                    relevant public sources, collecting data without bypassing any access controls, 
                    analyzing the information in context, and handling results responsibly.
                  </p>

                  <p>
                    Crucially, ethical OSINT practitioners are transparent about their methods. If 
                    asked, they could explain exactly how they gathered information—because none of 
                    it required deception, unauthorized access, or violation of terms of service.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* OSINT vs Surveillance */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    OSINT vs. Surveillance: Key Differences
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  OSINT and surveillance are fundamentally different practices, though they're 
                  sometimes confused. Understanding the distinction is crucial for responsible use.
                </p>

                <div className="space-y-4 mb-10">
                  {osintVsSurveillance.map((item, index) => (
                    <div 
                      key={index}
                      className="bg-muted/50 rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-3">{item.aspect}</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-green-600 uppercase">OSINT</span>
                                <p className="text-muted-foreground text-sm">{item.osint}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <XCircle className="h-4 w-4 text-destructive mt-1 shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-destructive uppercase">Surveillance</span>
                                <p className="text-muted-foreground text-sm">{item.surveillance}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-3">The Core Distinction</h3>
                  <p className="text-muted-foreground">
                    OSINT collects information that was already public—information the subject 
                    chose to share or that exists in public records. Surveillance monitors 
                    activities that subjects reasonably expect to be private. This distinction 
                    is why OSINT is legal by definition, while surveillance typically requires 
                    specific legal authority.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Why OSINT Is Legal and Transparent */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Why OSINT Is Legal and Transparent
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    OSINT is legal precisely because it only uses publicly available information. 
                    There's no law against reading a public social media profile, searching court 
                    records, or looking up a company's registration details—these are actions 
                    anyone can perform.
                  </p>

                  <div className="bg-background rounded-2xl p-6 border border-border/50 my-8">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Legal Foundations of OSINT</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">No Expectation of Privacy</p>
                          <p className="text-muted-foreground">Information posted publicly—on social media, in forums, or in public records—carries no legal expectation of privacy.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">No Unauthorized Access</p>
                          <p className="text-muted-foreground">OSINT never bypasses authentication, hacks systems, or accesses restricted areas—all access is through normal, public means.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                          <span className="text-sm font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Transparency of Methods</p>
                          <p className="text-muted-foreground">Ethical OSINT practitioners can fully disclose their methods—there's nothing to hide because nothing illegal occurred.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p>
                    That said, how OSINT information is <em>used</em> after collection may be 
                    subject to various regulations. Using gathered information for harassment, 
                    fraud, or discrimination would be illegal regardless of how the data was 
                    obtained. The legality of OSINT collection doesn't exempt users from laws 
                    governing subsequent actions.
                  </p>

                  <p>
                    Transparency is a hallmark of ethical OSINT. Unlike covert surveillance, 
                    OSINT methods can be openly discussed. Tools, techniques, and sources can 
                    all be explained because nothing about the process violates laws or ethical 
                    boundaries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Who Should Use OSINT Responsibly */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Who Should Use OSINT Responsibly
                  </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-8">
                  OSINT serves many legitimate purposes across various fields. Here are common 
                  use cases where ethical OSINT provides value:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-10">
                  {responsibleUsers.map((user, index) => (
                    <div 
                      key={index}
                      className="bg-muted/50 rounded-xl p-6 border border-border/50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          <user.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{user.title}</h3>
                          <p className="text-muted-foreground text-sm">{user.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20">
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    When OSINT Crosses Ethical Lines
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    OSINT becomes unethical when it's used for:
                  </p>
                  <div className="grid md:grid-cols-2 gap-3 text-muted-foreground text-sm">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span>Harassment, stalking, or intimidation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span>Discrimination in hiring or services</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span>Doxxing or exposing individuals to harm</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span>Unauthorized commercial exploitation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ethical OSINT in Practice */}
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Ethical OSINT in Practice
                  </h2>
                </div>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p>
                    FootprintIQ is an example of how ethical OSINT principles can be applied 
                    to help individuals understand their digital exposure. The platform 
                    demonstrates several key ethical practices:
                  </p>

                  <div className="bg-background rounded-2xl p-6 border border-border/50 my-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Public Data Only</p>
                          <p className="text-muted-foreground">Scans only publicly accessible sources—no hacking, no bypassing logins, no private database access.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Self-Assessment Focus</p>
                          <p className="text-muted-foreground">Designed primarily for individuals to check their own digital footprint—understanding their own exposure.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Transparent Methods</p>
                          <p className="text-muted-foreground">Uses open-source tools and documented techniques—nothing covert or proprietary.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Empowering Users</p>
                          <p className="text-muted-foreground">Helps users take control of their privacy rather than exposing others—protective, not invasive.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p>
                    This approach represents how OSINT tools can serve legitimate privacy and 
                    security needs while respecting ethical boundaries. The goal is awareness 
                    and empowerment—helping people understand and manage their own digital 
                    presence.
                  </p>
                </div>

                <div className="bg-muted/50 rounded-2xl p-8 border border-border/50 mt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Explore Your Digital Footprint</h3>
                  <p className="text-muted-foreground mb-6">
                    For a practical example of ethical OSINT in action, a{" "}
                    <Link to="/digital-footprint-scanner" className="text-primary hover:underline font-medium">
                      digital footprint scanner
                    </Link>{" "}
                    can show you what information about you is publicly visible across 
                    hundreds of sources—using only the same public data anyone could access.
                  </p>
                  <Link 
                    to="/scan"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Check Your Exposure
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 md:py-20">
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
                      className="bg-muted/50 rounded-xl border border-border/50 px-6"
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
          <section className="py-16 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-foreground mb-6">Related Resources</h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Link 
                    to="/what-is-a-digital-footprint"
                    className="p-5 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      What Is a Digital Footprint?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Understand the basics of digital footprints and how they form
                    </p>
                  </Link>
                  
                  <Link 
                    to="/username-exposure"
                    className="p-5 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
                  >
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                      Username Exposure
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      How accounts get linked across the internet
                    </p>
                  </Link>
                  
                  <Link 
                    to="/digital-footprint-scanner"
                    className="p-5 bg-background rounded-xl border border-border/50 hover:border-primary/50 transition-colors group"
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

export default WhatIsOsint;
