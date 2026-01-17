import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, HelpCircle, Clock, Database, AlertTriangle, CheckCircle, Search, Lock, Info, RefreshCw } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const OldDataBreaches = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Should I Worry About Old Data Breaches?",
    "description": "Understand whether historical data breaches still matter, why most don't cause problems, and what actually increases risk over time. Calm, factual guidance.",
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
      "@id": `${origin}/old-data-breaches`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Do old breaches still affect me if I changed my password?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "If you changed your password after the breach, the exposed password is no longer useful for accessing that account. However, if you used the same password elsewhere and didn't change it everywhere, those other accounts may still be at risk. The breach itself becomes less relevant once you've updated credentials."
        }
      },
      {
        "@type": "Question",
        "name": "Should I delete accounts from breached services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Deleting accounts you no longer use is generally a sensible practice, but it's not urgent for most people. If the account holds no current value and you've already changed your password, deletion prevents future issues but doesn't address past exposure. Focus on securing active accounts first."
        }
      },
      {
        "@type": "Question",
        "name": "Can old breach data be reused years later?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, breach data remains available indefinitely. However, its usefulness decreases over time as people change passwords and accounts become inactive. The main risk is if you're still using the same credentials years later. Old data combined with unchanged habits creates more risk than old data alone."
        }
      },
      {
        "@type": "Question",
        "name": "Is it normal to be in multiple breaches?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Most adults who have been online for several years appear in multiple breach databases. This is a normal consequence of using internet services over time. Being in multiple breaches is common; it does not mean you will experience identity theft or fraud."
        }
      },
      {
        "@type": "Question",
        "name": "Does everyone exposed in a breach experience identity theft?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The vast majority of people affected by data breaches never experience identity theft as a result. Breaches affect millions of people; identity theft affects a much smaller number. Exposure creates potential risk, not certainty of harm."
        }
      },
      {
        "@type": "Question",
        "name": "What's the most sensible first step?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Secure your primary email account with a strong, unique password and two-factor authentication. Your email controls password resets for most other accounts, making it the highest-impact single action regardless of how many breaches you've been in."
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
        "name": "Should I Worry About Old Data Breaches?",
        "item": `${origin}/old-data-breaches`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Should I Worry About Old Data Breaches? | FootprintIQ</title>
        <meta name="description" content="Understand whether historical data breaches still matter, why most don't cause problems, and what actually increases risk over time. Calm, factual guidance." />
        <link rel="canonical" href={`${origin}/old-data-breaches`} />
        <meta property="og:title" content="Should I Worry About Old Data Breaches?" />
        <meta property="og:description" content="Understand whether historical data breaches still matter, why most don't cause problems, and what actually increases risk." />
        <meta property="og:url" content={`${origin}/old-data-breaches`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Should I Worry About Old Data Breaches?" />
        <meta name="twitter:description" content="Understand whether historical data breaches still matter and what actually increases risk over time." />
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
                <BreadcrumbPage>Should I Worry About Old Data Breaches?</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Should I Worry About Old Data Breaches?
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A calm, practical guide to understanding whether historical breaches still matter—and why most don't cause the problems you might expect.
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
                <strong className="text-foreground">Many people were affected by data breaches that happened years ago. Most of these old breaches do not lead to harm on their own.</strong> Whether an old breach matters depends on what you did afterward—not just on the fact that it happened.
              </p>
              <p className="mb-4">
                If you changed your password after the breach, stopped using the affected account, or never reused those credentials elsewhere, the risk from that breach is significantly reduced. Old breaches become problems primarily when old habits—like password reuse—persist.
              </p>
              <p>
                The age of a breach matters less than what was exposed, whether you've taken action since, and whether your current accounts are protected. Worry is less useful than understanding and proportionate response.
              </p>
            </div>
          </section>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Article</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#what-counts" className="hover:text-primary transition-colors">1. What Counts as an "Old" Data Breach</a></li>
              <li><a href="#why-matter" className="hover:text-primary transition-colors">2. Why Old Breaches Can Still Matter (Sometimes)</a></li>
              <li><a href="#why-most-dont" className="hover:text-primary transition-colors">3. Why Most Old Breaches Don't Cause Problems</a></li>
              <li><a href="#increases-risk" className="hover:text-primary transition-colors">4. What Actually Increases Risk Over Time</a></li>
              <li><a href="#discovering" className="hover:text-primary transition-colors">5. How People Usually Discover Old Breaches</a></li>
              <li><a href="#what-to-do" className="hover:text-primary transition-colors">6. What to Do If You're Concerned</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">7. Frequently Asked Questions</a></li>
            </ul>
          </nav>

          {/* Section 1: What Counts as an Old Breach */}
          <section id="what-counts" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              1. What Counts as an "Old" Data Breach
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                When we talk about old breaches, we generally mean security incidents from several years ago—breaches from 2015, 2017, 2019, or earlier. These are incidents that happened before many people were paying attention to data security, often before breach notification laws required companies to tell you.
              </p>
              <p className="mb-4">
                Many people don't remember these breaches because notification was inconsistent. Some companies took months or years to discover they had been breached. Others quietly notified users in ways that were easy to miss—an email that looked like spam, a banner on a website you no longer visited, or a notice buried in account settings.
              </p>
              <p className="mb-4">
                It's common to discover today that you were affected by a breach that happened five, seven, or even ten years ago. This doesn't mean the information is just now being used against you—it means the information has been available for that long, and you're only now learning about it.
              </p>
              <p>
                The timing of discovery doesn't equal the timing of risk. If a breach happened in 2016 and you're finding out now, the relevant question is what's happened in the years since—not what might happen starting today.
              </p>
            </div>
          </section>

          {/* Section 2: Why Old Breaches Can Still Matter */}
          <section id="why-matter" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              2. Why Old Breaches Can Still Matter (Sometimes)
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p className="mb-4">
                While most old breaches don't cause ongoing problems, there are situations where they remain relevant. Understanding these helps you assess whether a particular breach deserves attention.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Credential Reuse</h3>
                  <p className="text-muted-foreground">
                    If you used the same email and password combination on multiple sites, a breach at one service exposes your credentials everywhere you reused them. Attackers know this and routinely test leaked credentials against popular services. If you're still using passwords from 2015, those passwords may still work—and may still be in circulation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Data Aggregation</h3>
                  <p className="text-muted-foreground">
                    Old breach data can be combined with newer information. Your email address from a 2016 breach, combined with your phone number from a 2020 breach, combined with your address from public records, creates a more complete profile than any single source. This aggregation happens in the background without any dramatic event.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Sensitive Information</h3>
                  <p className="text-muted-foreground">
                    Some data doesn't age. Your social security number from a 2014 breach is still your social security number. Your mother's maiden name—often used as a security question—doesn't change. These persistent identifiers remain useful to bad actors indefinitely, though they still require additional context to exploit.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                The key point is that age alone doesn't determine risk. A breach from 2015 where you've since changed passwords and secured accounts is less concerning than a breach from 2022 where you're still using the same credentials.
              </p>
            </div>
          </section>

          {/* Section 3: Why Most Old Breaches Don't Cause Problems */}
          <section id="why-most-dont" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              3. Why Most Old Breaches Don't Cause Problems
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Despite the alarming numbers—billions of records exposed across thousands of breaches—the vast majority of people affected never experience identity theft or fraud as a direct result. This isn't luck; there are structural reasons why most old breaches don't lead to harm.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Password changes reduce risk dramatically.</strong> If you changed your password after a breach—or even if you've changed it since for other reasons—the exposed password no longer works. Many people naturally update passwords over time, making old credentials useless.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Inactive accounts fade in value.</strong> An account you haven't used in five years is unlikely to contain current payment information, recent activity, or valuable access. Attackers prioritize active, valuable targets over dormant accounts with stale data.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Scale provides anonymity.</strong> When a breach affects 100 million people, you're one record among 100 million. Attackers typically work at scale, using automation rather than targeting individuals. Being one person in a massive dataset provides a form of protection through obscurity.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Most harm happens close to breach time.</strong> The highest risk period is typically the weeks and months immediately following a breach, when data is fresh and credentials are most likely to still work. Years later, the data's value has diminished significantly.
              </p>

              <p>
                <strong className="text-foreground">Services have improved.</strong> Many services now use better security practices—two-factor authentication, breach detection, suspicious login alerts. Even if old credentials are tested, modern protections often catch and block the attempt.
              </p>
            </div>
          </section>

          {/* Section 4: What Increases Risk Over Time */}
          <section id="increases-risk" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <RefreshCw className="h-6 w-6 text-primary" />
              4. What Actually Increases Risk Over Time
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                If most old breaches don't cause problems, what does create ongoing risk? The answer is behavior, not events. Breaches happen to everyone; risk accumulates for those who don't adapt.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Reusing the Same Email/Password Combinations</h3>
                <p className="text-muted-foreground">
                  This is the single biggest risk factor. If you use the same password across multiple services, one breach exposes them all. The more breaches that contain your email, the more likely your reused password appears in leaked databases. Each breach amplifies the risk of the others.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Using the Same Username Everywhere</h3>
                <p className="text-muted-foreground">
                  A consistent username makes it easy to find all your accounts across the internet. This aids attackers in building a complete picture of your online presence and identifying which accounts might share credentials.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Leaving Core Accounts Unsecured</h3>
                <p className="text-muted-foreground">
                  Your email account controls password resets for most other services. If your email is unsecured—using an old, possibly breached password without two-factor authentication—it becomes a single point of failure that unlocks everything else.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Never Checking What's Exposed</h3>
                <p className="text-muted-foreground">
                  Ignorance isn't protection. Understanding what information about you exists in breach databases and public sources allows you to prioritize which accounts need attention. Without this awareness, you may be securing the wrong things.
                </p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                The good news: these are all behaviors you can change. Unlike breaches—which happen to you—your security practices are within your control. For practical steps, see our guide on{" "}
                <Link to="/reduce-digital-footprint" className="text-primary hover:underline">how to reduce your digital footprint</Link>.
              </p>
            </div>
          </section>

          {/* Section 5: How People Discover Old Breaches */}
          <section id="discovering" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              5. How People Usually Discover Old Breaches
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground mb-6">
              <p>
                Many people discover they were affected by breaches years after the incident occurred. This is normal—breach discovery often lags behind breach occurrence.
              </p>
            </div>

            <div className="space-y-4 my-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Breach Notification Services</h3>
                  <p className="text-muted-foreground">
                    Services that aggregate breach data can tell you which breaches include your email address. These services scan public and semi-public breach databases to provide awareness of your exposure history.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Media Coverage</h3>
                  <p className="text-muted-foreground">
                    Major breaches often receive news coverage, prompting people to check whether they were affected. A story about a company you used to have an account with might trigger you to investigate.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Ethical OSINT Scans</h3>
                  <p className="text-muted-foreground">
                    A{" "}
                    <Link to="/digital-footprint-scanner" className="text-primary hover:underline">digital footprint scanner</Link>{" "}
                    can systematically check where your information appears, including breach databases. This provides a structured view of your historical exposure.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Account Alerts</h3>
                  <p className="text-muted-foreground">
                    Some services notify you if your credentials appear in known breaches or if someone attempts to log in from an unusual location. These alerts may prompt you to investigate your broader exposure history.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 6: What to Do If Concerned */}
          <section id="what-to-do" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              6. What to Do If You're Concerned
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Discovering old breaches can feel unsettling, but the appropriate response is calm, prioritized action—not panic or exhaustive cleanup of every old account.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Secure important accounts first.</strong> Your primary email, banking, and any accounts with financial access should have strong, unique passwords and two-factor authentication enabled. These are the accounts that matter most, regardless of how many breaches you've been in.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Reduce reuse going forward.</strong> You cannot undo past password reuse, but you can stop it now. Use a password manager to generate and store unique passwords for each account. This single change prevents future breaches from having cascading effects.
              </p>

              <p className="mb-4">
                <strong className="text-foreground">Focus on prevention, not chasing the past.</strong> Spending hours trying to delete every old account or remove every piece of exposed data is often less valuable than ensuring your current, active accounts are properly secured. Prevention outweighs remediation.
              </p>

              <p>
                The goal is not to eliminate all historical exposure—that's impossible—but to ensure that old breaches can't become current problems.
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
                  Do old breaches still affect me if I changed my password?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If you changed your password after the breach, the exposed password is no longer useful for accessing that specific account. However, if you used the same password elsewhere and didn't change it everywhere, those other accounts may still be at risk. The breach of one service becomes less relevant once you've updated credentials and stopped reusing them.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">
                  Should I delete accounts from breached services?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Deleting accounts you no longer use is generally a sensible practice, but it's not urgent for most people. If the account holds no current value and you've already changed your password, deletion prevents potential future issues but doesn't address past exposure. Focus on securing active accounts first; old account cleanup can happen over time.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">
                  Can old breach data be reused years later?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, breach data remains available indefinitely once it's leaked. However, its usefulness decreases over time as people change passwords and accounts become inactive. The main risk is if you're still using the same credentials years later. Old data combined with unchanged habits creates more risk than old data alone.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">
                  Is it normal to be in multiple breaches?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Most adults who have been online for several years appear in multiple breach databases. This is a normal consequence of using internet services over time—services get breached, and if you had an account, your data was included. Being in multiple breaches is common; it does not mean you will experience identity theft or fraud.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">
                  Does everyone exposed in a breach experience identity theft?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. The vast majority of people affected by data breaches never experience identity theft as a direct result. Breaches affect millions or billions of people collectively; identity theft affects a much smaller number. Exposure creates potential risk, not certainty of harm. Most breached data is never actually used against the people it belongs to.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left">
                  What's the most sensible first step?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Secure your primary email account with a strong, unique password and two-factor authentication. Your email controls password resets for most other accounts, making it the highest-impact single action regardless of how many breaches you've been in. If you do nothing else, do this. Everything else is secondary.
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
                Old data breaches are a normal part of having used the internet for any length of time. Most people appear in multiple breach databases, and most of those breaches never cause direct harm. The age of a breach matters less than what was exposed and what you've done since.
              </p>
              <p className="mb-4">
                Context and behavior matter more than the breach itself. Credential reuse, unchanged passwords, and unsecured core accounts create ongoing risk. These are things you can change. The breach already happened; your response is what you control.
              </p>
              <p>
                Small, sensible steps—securing your email, using unique passwords, understanding your exposure—reduce risk significantly. Perfect protection isn't possible, but proportionate protection is achievable and sustainable. Understanding your digital footprint is the foundation for any meaningful response.
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/digital-footprint-scanner" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Digital Footprint Scanner</h3>
                <p className="text-sm text-muted-foreground">Check your online exposure.</p>
              </Link>
              <Link to="/reduce-digital-footprint" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Reduce Your Digital Footprint</h3>
                <p className="text-sm text-muted-foreground">Practical steps to lower visibility.</p>
              </Link>
              <Link to="/is-my-data-exposed" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Is My Data Already Exposed?</h3>
                <p className="text-sm text-muted-foreground">What exposure really means.</p>
              </Link>
              <Link to="/how-identity-theft-starts" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">How Identity Theft Starts</h3>
                <p className="text-sm text-muted-foreground">Why it's rarely a dramatic hack.</p>
              </Link>
              <Link to="/digital-privacy-glossary" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Digital Privacy Glossary</h3>
                <p className="text-sm text-muted-foreground">Key terms and definitions.</p>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default OldDataBreaches;
