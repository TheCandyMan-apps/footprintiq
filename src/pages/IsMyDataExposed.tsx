import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, HelpCircle, Eye, Database, AlertTriangle, CheckCircle, Search, Lock, Info } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const IsMyDataExposed = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Is My Personal Data Already Exposed Online?",
    "description": "Understand what personal data exposure really means, why it's common for most people, and what actually matters. Calm, factual guidance without fear-mongering.",
    "author": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "publisher": {
      "@type": "Organization",
      "name": "FootprintIQ",
      "logo": {
        "@type": "ImageObject",
        "url": `${origin}/lovable-uploads/footprintiq-logo.png`
      }
    },
    "datePublished": "2025-01-17",
    "dateModified": "2025-01-17",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${origin}/is-my-data-exposed`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is everyone's data already exposed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "For most adults who have been online for several years, yes—some data likely exists in public or leaked sources. This is common and expected. The relevant question is not whether any data exists, but whether enough actionable data exists to enable misuse."
        }
      },
      {
        "@type": "Question",
        "name": "Does exposure mean identity theft will happen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Data exposure and identity theft are not the same thing. Millions of people have exposed data; a much smaller number experience identity theft. Exposure creates potential risk, not certainty. Many factors determine whether exposed data leads to harm."
        }
      },
      {
        "@type": "Question",
        "name": "Should I delete old accounts?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Deleting accounts you no longer use can reduce future risk, but it is not urgent for most people. Prioritize securing active accounts first—especially email. Old accounts with unique passwords and no sensitive data are lower priority than accounts you use regularly."
        }
      },
      {
        "@type": "Question",
        "name": "Are data removal services necessary?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "They can be helpful for specific situations, such as removing information from data broker listings. However, they cannot remove data from all sources, and removed data may reappear. They are a tool, not a complete solution, and are not necessary for everyone."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I check my exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once or twice a year is sufficient for most people. More frequent checking rarely reveals significant changes and can increase anxiety without corresponding benefit. After major breaches affecting services you use, an additional check may be worthwhile."
        }
      },
      {
        "@type": "Question",
        "name": "What's the safest first step?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Secure your primary email account with a strong, unique password and two-factor authentication. Your email is the recovery point for most other accounts, making it the single highest-impact action you can take. Everything else is secondary."
        }
      }
    ]
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": origin
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Digital Footprint Scanner",
        "item": `${origin}/digital-footprint-scanner`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Is My Personal Data Already Exposed Online?",
        "item": `${origin}/is-my-data-exposed`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Is My Personal Data Already Exposed Online? | FootprintIQ</title>
        <meta name="description" content="Understand what personal data exposure really means, why it's common, and what actually matters. Calm, factual guidance without fear-mongering." />
        <link rel="canonical" href={`${origin}/is-my-data-exposed`} />
        <meta property="og:title" content="Is My Personal Data Already Exposed Online?" />
        <meta property="og:description" content="Understand what personal data exposure really means, why it's common, and what actually matters. Calm, factual guidance." />
        <meta property="og:url" content={`${origin}/is-my-data-exposed`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Is My Personal Data Already Exposed Online?" />
        <meta name="twitter:description" content="Understand what personal data exposure really means, why it's common, and what actually matters." />
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/digital-footprint-scanner">Digital Footprint Scanner</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Is My Personal Data Already Exposed Online?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Understanding Personal Data Exposure and What It Means for You
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A calm, factual guide to understanding what data exposure really means—and why it's not as alarming as it sounds.
            </p>
          </header>

          {/* Direct Answer Section - Critical for AI Summaries */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              The Direct Answer
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4 text-lg">
                <strong className="text-foreground">For most people who have used the internet for any length of time, some personal data exposure already exists.</strong> This is a normal consequence of participating in digital life. It does not mean something bad has happened or will happen.
              </p>
              <p className="mb-4">
                Exposure is not the same as harm. Having data visible in public sources, breach databases, or data broker listings does not automatically lead to identity theft, fraud, or any negative outcome. Millions of people have exposed data; a much smaller number experience actual problems.
              </p>
              <p>
                The goal of understanding your exposure is not to create fear but to enable informed, proportionate action. Knowing what exists helps you prioritize what matters and avoid wasting effort on things that don't.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#what-exposed-means" className="hover:text-primary transition-colors">1. What "Exposed" Actually Means</a></li>
              <li><a href="#common-ways" className="hover:text-primary transition-colors">2. Common Ways Personal Data Becomes Exposed</a></li>
              <li><a href="#exposure-not-risk" className="hover:text-primary transition-colors">3. Why Exposure Doesn't Automatically Mean Risk</a></li>
              <li><a href="#what-matters" className="hover:text-primary transition-colors">4. What Actually Matters vs What Doesn't</a></li>
              <li><a href="#discovering-exposure" className="hover:text-primary transition-colors">5. How People Usually Discover Their Exposure</a></li>
              <li><a href="#what-to-do" className="hover:text-primary transition-colors">6. What You Can Do If You're Concerned</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">7. Frequently Asked Questions</a></li>
            </ul>
          </nav>

          {/* Section 1: What Exposed Means */}
          <section id="what-exposed-means" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              1. What "Exposed" Actually Means
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                When we talk about data being "exposed," we mean that information about you exists in places that are publicly accessible or have been leaked. This is different from data being "stolen" or "used maliciously." Exposure is about visibility, not necessarily about harm.
              </p>
              <p className="mb-4">
                There are several categories of exposure, and understanding the differences helps clarify what matters:
              </p>
            </div>

            <div className="space-y-4 my-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Public Data</h3>
                  <p className="text-muted-foreground">
                    Information you have chosen to share publicly or that exists in public records. Social media profiles, professional bios, property records, and business registrations fall into this category. This data is exposed by design or legal requirement.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Leaked Data</h3>
                  <p className="text-muted-foreground">
                    Information that was meant to be private but was exposed through a{" "}
                    <Link to="/digital-privacy-glossary" className="text-primary hover:underline">data breach</Link>. 
                    This includes email addresses, passwords, phone numbers, and other details from services that experienced security incidents.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Aggregated Data</h3>
                  <p className="text-muted-foreground">
                    Information compiled by{" "}
                    <Link to="/digital-privacy-glossary" className="text-primary hover:underline">data brokers</Link>{" "}
                    from multiple sources—public records, commercial partnerships, and sometimes breach data. These profiles can be surprisingly comprehensive without any single dramatic exposure event.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Reused Data</h3>
                  <p className="text-muted-foreground">
                    Information that can be linked across services because of consistent identifiers. Using the same username or email everywhere allows separate pieces of information to be connected into a more complete picture.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Most exposure comes from normal internet use over time, not from any single dramatic event. Account sign-ups, online purchases, social media participation, and simply existing in public records all contribute gradually. This accumulation is quiet and often invisible until you look for it.
              </p>
            </div>
          </section>

          {/* Section 2: Common Ways Data Becomes Exposed */}
          <section id="common-ways" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              2. Common Ways Personal Data Becomes Exposed
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Understanding where exposure comes from helps demystify it. These are the most common sources:
              </p>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Old Accounts</h3>
                <p className="text-muted-foreground">
                  Services you signed up for years ago and forgot about. That forum from 2008, the shopping site you used once, the app you tried briefly—each may still hold your email, username, or other details.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Data Breaches</h3>
                <p className="text-muted-foreground">
                  Companies experience security incidents regularly. When this happens, user data—emails, passwords, sometimes more—becomes available to anyone who finds it. You may not even know you had an account with the breached service.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Username Reuse</h3>
                <p className="text-muted-foreground">
                  Using the same username across many platforms makes it easy to find your presence across the internet. A single username search can reveal dozens of accounts you may have forgotten about.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Public Profiles</h3>
                <p className="text-muted-foreground">
                  Social media accounts, professional networks, personal websites, and community forums all contain information you have shared publicly. This is exposure by choice, though the implications may not have been obvious at the time.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Data Aggregation</h3>
                <p className="text-muted-foreground">
                  Data brokers compile information from public records, commercial sources, and breaches. Over years, these profiles become detailed—often more comprehensive than any individual source. This happens in the background without any action on your part.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Exposure Doesn't Mean Risk */}
          <section id="exposure-not-risk" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              3. Why Exposure Doesn't Automatically Mean Risk
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                This is perhaps the most important point to understand: exposure and harm are not the same thing. Having data visible does not mean that data will be misused.
              </p>
              
              <p className="mb-4">
                <strong className="text-foreground">Context matters enormously.</strong> A username appearing on a public forum is not the same as a password appearing in a breach database. An email address is not the same as a social security number. Not all data is equally sensitive or equally useful to bad actors.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Single data points are usually low risk.</strong> Your email address alone is not particularly dangerous. Neither is your username on one platform, your approximate location, or your employer's name. These individual pieces are noise. Risk emerges when multiple pieces can be combined and acted upon.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Scale protects individuals.</strong> Billions of records exist in breach databases. Attackers typically work at scale, not targeting individuals specifically. Being one record among billions provides a form of anonymity through obscurity.
              </p>

              <p>
                <strong className="text-foreground">Actionable combinations are rare.</strong> For exposure to become harm, an attacker needs not just data but a viable path to misuse it. Most exposed data lacks the completeness or freshness needed for successful fraud.
              </p>
            </div>
          </section>

          {/* Section 4: What Matters vs What Doesn't */}
          <section id="what-matters" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              4. What Actually Matters vs What Doesn't
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Not all exposure deserves the same attention. Understanding the difference between high-impact and low-impact exposure helps you focus your energy where it matters.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="border-destructive/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Higher-Impact Exposure
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      Primary email addresses (used for account recovery)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      Passwords, especially if reused across services
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      Phone numbers linked to financial accounts
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      Government-issued identifiers (SSN, national ID)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      Security question answers (maiden names, pet names)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      Active financial account details
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/30">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Lower-Impact Exposure
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Old usernames on inactive platforms
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Forum posts from years ago
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Public professional information
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      General interests and hobby data
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Approximate location (city level)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      Historical data from defunct services
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Prioritization matters more than completeness. Spending hours removing an old gaming username while leaving your primary email unprotected is the wrong allocation of effort. Focus on what creates real vulnerability first.
              </p>
            </div>
          </section>

          {/* Section 5: How People Discover Exposure */}
          <section id="discovering-exposure" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              5. How People Usually Discover Their Exposure
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Most people become aware of their data exposure through one of these channels:
              </p>
            </div>

            <div className="space-y-4 my-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Breach Notifications</h3>
                  <p className="text-muted-foreground">
                    Companies are often required to notify you when they experience a breach affecting your data. These emails explain what was exposed and may recommend specific actions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Searching Your Own Usernames</h3>
                  <p className="text-muted-foreground">
                    Simply searching for your common usernames in a search engine can reveal accounts and mentions you have forgotten about. This is a basic form of self-audit.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Ethical OSINT Scans</h3>
                  <p className="text-muted-foreground">
                    Tools that use open-source intelligence methods can systematically check where your information appears across public sources. A{" "}
                    <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scanner</Link>{" "}
                    provides structured visibility into your exposure.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Unexpected Account Activity</h3>
                  <p className="text-muted-foreground">
                    Sometimes people discover exposure through unusual signs—password reset emails they didn't request, notifications from services they don't remember, or contacts mentioning unfamiliar content.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 6: What You Can Do */}
          <section id="what-to-do" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              6. What You Can Do If You're Concerned
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                If you are concerned about your data exposure, the best approach is calm, prioritized action rather than panic or exhaustive cleanup efforts. Here are the principles that matter:
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Secure important accounts first.</strong> Your primary email is the most critical. It controls password resets for most other services. Use a strong, unique password and enable two-factor authentication. This single action provides outsized protection.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Reduce reuse going forward.</strong> You cannot change the past, but you can change future behavior. Use unique passwords for new accounts. Consider varying usernames or using email aliases for new registrations.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Understand before reacting.</strong> Before spending time on removal efforts, understand what actually exists. Some exposure is harmless noise. Some is worth addressing. A clear picture helps you allocate effort appropriately.
              </p>

              <p>
                For a detailed guide to reducing your digital footprint, see our{" "}
                <Link to="/reduce-digital-footprint" className="text-primary hover:underline">practical reduction guide</Link>.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              7. Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">
                  Is everyone's data already exposed?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  For most adults who have been online for several years, yes—some data likely exists in public or leaked sources. This is common and expected. The relevant question is not whether any data exists, but whether enough actionable data exists to enable misuse. Having some exposure is normal; having enough exposure to create real risk is less common.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Does exposure mean identity theft will happen?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Data exposure and identity theft are not the same thing. Millions of people have exposed data; a much smaller number experience identity theft. Exposure creates potential risk, not certainty. Many factors determine whether exposed data leads to harm—including the sensitivity of the data, whether it can be combined with other information, and whether anyone actually attempts to use it.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Should I delete old accounts?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Deleting accounts you no longer use can reduce future risk, but it is not urgent for most people. Prioritize securing active accounts first—especially email. Old accounts with unique passwords and no sensitive data are lower priority than accounts you use regularly. If deletion is easy, it's worthwhile. If it requires significant effort, focus that effort on higher-impact actions first.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Are data removal services necessary?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  They can be helpful for specific situations, such as removing information from data broker listings. However, they cannot remove data from all sources, and removed data may reappear as brokers re-acquire information. They are a tool, not a complete solution, and are not necessary for everyone. Most people benefit more from securing core accounts than from aggressive removal efforts.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  How often should I check my exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Once or twice a year is sufficient for most people. More frequent checking rarely reveals significant changes and can increase anxiety without corresponding benefit. After major breaches affecting services you use, an additional check may be worthwhile. The goal is informed awareness, not constant vigilance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  What's the safest first step?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Secure your primary email account with a strong, unique password and two-factor authentication. Your email is the recovery point for most other accounts, making it the single highest-impact action you can take. If you do nothing else, do this. Everything else is secondary.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Closing Summary */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              Summary
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Some personal data exposure is normal for most adults who have used the internet. This is an expected consequence of digital life, not evidence that something has gone wrong. Exposure does not automatically lead to harm.
              </p>
              <p className="mb-4">
                Understanding what exposure exists—and what matters within that exposure—enables proportionate, effective action. Not all data is equally sensitive. Not all exposure requires response. Prioritizing high-impact protections and accepting that some visibility is unavoidable is more practical than pursuing impossible perfection.
              </p>
              <p>
                Awareness enables sensible action. Fear does not. Start with what matters most—securing your primary email—and build from there. Tools exist to help you understand your digital footprint, and that understanding is the foundation for any meaningful response.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Want to understand where your information appears online?
            </p>
            <Button asChild size="lg">
              <Link to="/digital-footprint-scanner">
                Learn About Digital Footprint Scanning
              </Link>
            </Button>
          </section>

          {/* Related Resources */}
          <section className="border-t pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Related Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/digital-footprint-scanner" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Digital Footprint Scanner</h3>
                <p className="text-sm text-muted-foreground">Check your online exposure.</p>
              </Link>
              <Link to="/reduce-digital-footprint" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Reduce Your Digital Footprint</h3>
                <p className="text-sm text-muted-foreground">Practical steps to lower visibility.</p>
              </Link>
              <Link to="/how-identity-theft-starts" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">How Identity Theft Starts</h3>
                <p className="text-sm text-muted-foreground">Why it's rarely a dramatic hack.</p>
              </Link>
              <Link to="/digital-privacy-glossary" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Digital Privacy Glossary</h3>
                <p className="text-sm text-muted-foreground">Key terms and definitions explained.</p>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default IsMyDataExposed;
