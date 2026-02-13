import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronRight, Shield, Lock, Key, Mail, UserX, Settings, AlertTriangle, Eye, CheckCircle, HelpCircle } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const ReduceDigitalFootprint = () => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://footprintiq.app";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "How to Reduce Your Digital Footprint: A Practical, Ethical Guide",
    "description": "Learn practical, ethical ways to reduce your digital footprint. Covers high-impact actions, account security, and realistic expectations without fear-mongering.",
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
      "@id": `${origin}/reduce-digital-footprint`
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Can I completely erase my digital footprint?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Complete erasure is not realistic. Data exists in archives, backups, third-party databases, and systems you cannot access. The goal is reduction and risk management, not perfection."
        }
      },
      {
        "@type": "Question",
        "name": "Does reducing my footprint stop identity theft?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "It reduces risk but does not eliminate it. Identity theft can occur through many vectors, including breaches at companies you have no control over. Footprint reduction is one layer of protection among many."
        }
      },
      {
        "@type": "Question",
        "name": "Are data removal services worth it?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "They can help with specific data broker listings, but they have limitations. They cannot remove data from all sources, and removed data may reappear. They are a tool, not a complete solution."
        }
      },
      {
        "@type": "Question",
        "name": "How often should I review my exposure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Once or twice a year is sufficient for most people. More frequent checks rarely reveal meaningful changes and can increase anxiety without benefit."
        }
      },
      {
        "@type": "Question",
        "name": "Is OSINT legal for personal use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Using publicly available information to understand your own digital exposure is legal in most jurisdictions. OSINT becomes problematic when used for harassment, stalking, or accessing protected information."
        }
      },
      {
        "@type": "Question",
        "name": "What matters most if I do nothing else?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Secure your primary email account with a strong, unique password and two-factor authentication. Your email is the recovery point for most other accounts, making it the highest-impact single action."
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
        "name": "How to Reduce Your Digital Footprint",
        "item": `${origin}/reduce-digital-footprint`
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>How to Reduce Your Digital Footprint - Practical, Ethical Guide | FootprintIQ</title>
        <meta name="description" content="Learn practical, ethical ways to reduce your digital footprint. Covers high-impact actions, account security, and realistic expectations. No fear-mongering." />
        <link rel="canonical" href={`${origin}/reduce-digital-footprint`} />
        <meta property="og:title" content="How to Reduce Your Digital Footprint - Practical, Ethical Guide" />
        <meta property="og:description" content="Learn practical, ethical ways to reduce your digital footprint. Covers high-impact actions, account security, and realistic expectations." />
        <meta property="og:url" content={`${origin}/reduce-digital-footprint`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Reduce Your Digital Footprint - Practical, Ethical Guide" />
        <meta name="twitter:description" content="Learn practical, ethical ways to reduce your digital footprint. Covers high-impact actions, account security, and realistic expectations." />
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
                <BreadcrumbPage>How to Reduce Your Digital Footprint</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Hero Section */}
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Practical Steps to Minimise Your Online Exposure
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              A practical, ethical guide to lowering your online visibility and managing digital exposure—without fear-mongering or unrealistic promises.
            </p>
          </header>

          {/* Table of Contents */}
          <nav className="mb-12 p-6 bg-muted/50 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">In This Guide</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#expectations" className="hover:text-primary transition-colors">1. Setting Realistic Expectations</a></li>
              <li><a href="#what-it-means" className="hover:text-primary transition-colors">2. What "Reducing Your Digital Footprint" Actually Means</a></li>
              <li><a href="#high-impact" className="hover:text-primary transition-colors">3. High-Impact Actions</a></li>
              <li><a href="#medium-impact" className="hover:text-primary transition-colors">4. Medium-Impact Actions</a></li>
              <li><a href="#myths" className="hover:text-primary transition-colors">5. Low-Impact or Overhyped Actions</a></li>
              <li><a href="#financial" className="hover:text-primary transition-colors">6. Credit, Financial, and Identity Protections</a></li>
              <li><a href="#osint" className="hover:text-primary transition-colors">7. How OSINT Fits Into Reduction</a></li>
              <li><a href="#when-to-stop" className="hover:text-primary transition-colors">8. When to Stop</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">9. Frequently Asked Questions</a></li>
            </ul>
          </nav>

          {/* Section 1: Setting Realistic Expectations */}
          <section id="expectations" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              1. Setting Realistic Expectations
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Before taking any action, it helps to understand what is and is not possible. You cannot erase your digital footprint completely. Data about you exists in places you cannot access—archives, backups, third-party databases, and systems operated by organizations you have never interacted with directly.
              </p>
              <p className="mb-4">
                Reduction is not about achieving invisibility. It is about lowering risk, limiting future exposure, and making it harder for your information to be aggregated or misused. These are achievable goals.
              </p>
              <p>
                Small changes compound over time. A single action may seem insignificant, but the cumulative effect of many small improvements is meaningful. There is no need for dramatic measures or immediate results. Progress is gradual, and that is fine.
              </p>
            </div>
          </section>

          {/* Section 2: What It Actually Means */}
          <section id="what-it-means" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              2. What "Reducing Your Digital Footprint" Actually Means
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                The phrase "digital footprint" refers to the trail of data you leave behind when using the internet. This includes information you actively share, such as social media posts, and information collected passively, such as browsing history or purchase records.
              </p>
              <p className="mb-4">
                Reducing your digital footprint is not about deleting everything. It involves four practical objectives:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Limiting future exposure</strong> — Being more intentional about what you share going forward.</li>
                <li><strong>Securing high-impact accounts</strong> — Protecting the accounts that matter most, especially email and financial services.</li>
                <li><strong>Understanding which data matters</strong> — Not all exposure is equally risky. Some data is noise; some creates real vulnerability.</li>
                <li><strong>Preventing reuse and aggregation</strong> — Making it harder for separate pieces of information to be combined into a detailed profile.</li>
              </ul>
              <p>
                This is a practical framework, not a technical checklist. The specific actions you take will depend on your situation and priorities.
              </p>
            </div>
          </section>

          {/* Section 3: High-Impact Actions */}
          <section id="high-impact" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              3. High-Impact Actions
            </h2>
            <p className="text-muted-foreground mb-6">
              These actions provide the greatest return on effort. They address the most common and most exploitable vulnerabilities.
            </p>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">1. Secure your primary email accounts</h3>
                      <p className="text-muted-foreground">
                        Your email is the recovery point for most other accounts. If someone gains access to your email, they can reset passwords and access connected services. Use a strong, unique password and enable two-factor authentication. This single action protects dozens of downstream accounts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">2. Use unique passwords and a password manager</h3>
                      <p className="text-muted-foreground">
                        Password reuse is one of the most common security failures. When a service is breached, attackers test those credentials on other sites. A password manager generates and stores unique passwords for each account, eliminating this vulnerability without requiring you to remember anything.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">3. Enable two-factor authentication on critical services</h3>
                      <p className="text-muted-foreground">
                        Two-factor authentication (2FA) requires a second verification step beyond your password. Even if your password is compromised, the attacker cannot access the account without this second factor. Prioritize email, banking, and any service that stores sensitive information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <UserX className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">4. Reduce username and email reuse going forward</h3>
                      <p className="text-muted-foreground">
                        Using the same username or email across many services makes it easy to link your accounts together. For new accounts, consider using variations or separate email addresses. This limits what can be learned by searching for a single identifier.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">5. Clean up old or unused accounts</h3>
                      <p className="text-muted-foreground">
                        Old accounts are liabilities. They may contain outdated information, weak passwords, or connected services you have forgotten. Where possible, delete accounts you no longer use. Where deletion is not available, update passwords and remove personal information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 4: Medium-Impact Actions */}
          <section id="medium-impact" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              4. Medium-Impact Actions
            </h2>
            <p className="text-muted-foreground mb-6">
              These actions are helpful but not essential. They provide incremental improvements and are worth considering once high-impact items are addressed.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Review privacy settings on major platforms</h3>
                  <p className="text-muted-foreground text-sm">
                    Social media platforms and other services offer privacy controls. Review who can see your information, what is shared publicly, and what data is collected. Defaults are often permissive.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Be selective with new account sign-ups</h3>
                  <p className="text-muted-foreground text-sm">
                    Every new account creates exposure. Before signing up for a service, consider whether you genuinely need it. Fewer accounts mean fewer potential breach points.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Avoid unnecessary data sharing</h3>
                  <p className="text-muted-foreground text-sm">
                    Many forms and sign-ups ask for information they do not need. You are not obligated to provide your real phone number, birthday, or address unless necessary for the service.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-foreground mb-2">Understand breach notifications</h3>
                  <p className="text-muted-foreground text-sm">
                    When you receive a breach notification, take it seriously. Change the affected password immediately, and check if you have used that password elsewhere. This limits the damage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section 5: Myths */}
          <section id="myths" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-primary" />
              5. Low-Impact or Overhyped Actions
            </h2>
            <p className="text-muted-foreground mb-6">
              Some commonly recommended actions are less effective than they appear. Understanding their limitations helps you allocate effort appropriately.
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Data "scrubbing" services have limits</h3>
                <p className="text-muted-foreground">
                  Services that remove your data from people-search sites can be helpful for specific listings, but they cannot access all sources. Data may reappear after removal. These services are a tool, not a comprehensive solution.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Removing every mention of your name is not realistic</h3>
                <p className="text-muted-foreground">
                  Your name appears in many places: public records, news articles, forum posts, and archived pages. Most of these cannot be removed. Focus on controlling what you can and accepting what you cannot.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">One-time actions do not permanently solve exposure</h3>
                <p className="text-muted-foreground">
                  A single cleanup effort is valuable, but exposure accumulates over time. Sustainable habits matter more than intensive one-time efforts.
                </p>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border">
                <h3 className="font-semibold text-foreground mb-2">Panic responses often do not help</h3>
                <p className="text-muted-foreground">
                  After discovering exposure, the impulse to delete everything immediately can lead to mistakes. A calm, methodical approach is more effective and less likely to create new problems.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Financial Protections */}
          <section id="financial" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              6. Credit, Financial, and Identity Protections
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Beyond digital footprint reduction, certain financial protections can limit identity theft risk. These are separate from online privacy but often complementary.
              </p>
              <p className="mb-4">
                <strong>Credit freezes</strong> prevent new credit accounts from being opened in your name without your authorization. In countries where credit bureaus offer this option, a freeze is one of the most effective protections against financial identity theft. Availability and implementation vary by jurisdiction.
              </p>
              <p className="mb-4">
                <strong>Fraud alerts</strong> notify lenders to take additional verification steps before extending credit. They are less restrictive than freezes but provide some protection.
              </p>
              <p>
                These protections address specific risks and are worth considering alongside digital footprint management. They do not replace good security practices but add an additional layer of defense.
              </p>
              <p className="text-sm italic mt-4">
                Note: This information is educational, not legal or financial advice. Consult appropriate professionals for guidance specific to your situation and jurisdiction.
              </p>
            </div>
          </section>

          {/* Section 7: OSINT */}
          <section id="osint" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" />
              7. How OSINT Fits Into Reduction
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                OSINT (Open-Source Intelligence) refers to the collection and analysis of publicly available information. In the context of personal privacy, OSINT techniques help you understand what information about you is publicly accessible.
              </p>
              <p className="mb-4">
                This awareness is valuable because it allows you to prioritize actions. Knowing where your information appears helps you decide what to address first. You cannot fix what you do not know exists.
              </p>
              <p className="mb-4">
                Ethical OSINT uses only public data. It does not involve accessing private systems, scraping behind logins, or monitoring individuals without consent. When used for self-assessment, OSINT is simply looking at what anyone could find about you.
              </p>
              <p>
                A digital footprint scan is one application of OSINT techniques—searching public sources to identify where your information appears. This provides a starting point for reduction efforts.
              </p>
            </div>
          </section>

          {/* Section 8: When to Stop */}
          <section id="when-to-stop" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              8. When to Stop
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                There is a point where further reduction has diminishing returns. Once you have addressed high-impact items and established reasonable habits, additional effort may not meaningfully reduce risk.
              </p>
              <p className="mb-4">
                Constant monitoring of your digital footprint can increase anxiety without providing corresponding benefit. Checking once or twice a year is usually sufficient for most people. More frequent reviews rarely reveal meaningful changes.
              </p>
              <p className="mb-4">
                "Good enough" is often the right goal. Perfect privacy is not achievable, and pursuing it can become counterproductive. The objective is reasonable protection, not elimination of all risk.
              </p>
              <p>
                If you have secured your critical accounts, reduced unnecessary exposure, and established sustainable habits, you have likely accomplished what matters most. Ongoing vigilance is appropriate; ongoing anxiety is not.
              </p>
            </div>
          </section>

          {/* Section 9: FAQ */}
          <section id="faq" className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-primary" />
              9. Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="erase">
                <AccordionTrigger className="text-left">
                  Can I completely erase my digital footprint?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. Complete erasure is not realistic. Data exists in archives, backups, third-party databases, and systems you cannot access. The goal is reduction and risk management, not perfection.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="identity-theft">
                <AccordionTrigger className="text-left">
                  Does reducing my footprint stop identity theft?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  It reduces risk but does not eliminate it. Identity theft can occur through many vectors, including breaches at companies you have no control over. Footprint reduction is one layer of protection among many.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="removal-services">
                <AccordionTrigger className="text-left">
                  Are data removal services worth it?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  They can help with specific data broker listings, but they have limitations. They cannot remove data from all sources, and removed data may reappear. They are a tool, not a complete solution.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="frequency">
                <AccordionTrigger className="text-left">
                  How often should I review my exposure?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Once or twice a year is sufficient for most people. More frequent checks rarely reveal meaningful changes and can increase anxiety without benefit.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="osint-legal">
                <AccordionTrigger className="text-left">
                  Is OSINT legal for personal use?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Using publicly available information to understand your own digital exposure is legal in most jurisdictions. OSINT becomes problematic when used for harassment, stalking, or accessing protected information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="priority">
                <AccordionTrigger className="text-left">
                  What matters most if I do nothing else?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Secure your primary email account with a strong, unique password and two-factor authentication. Your email is the recovery point for most other accounts, making it the highest-impact single action.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Closing Summary */}
          <section className="mb-12 p-8 bg-primary/5 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Summary</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Reducing your digital footprint is about awareness over fear, control over perfection, and long-term habits over one-time fixes.
              </p>
              <p className="mb-4">
                You cannot erase everything, and you do not need to. By securing critical accounts, reducing future exposure, and understanding where your information appears, you achieve meaningful protection without pursuing an impossible standard.
              </p>
              <p>
                Start with what matters most. Build sustainable habits. Accept imperfection. This approach is more effective—and more sustainable—than any dramatic cleanup effort.
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
              <Link to="/what-is-a-digital-footprint" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">What Is a Digital Footprint?</h3>
                <p className="text-sm text-muted-foreground">Understand the basics of digital exposure.</p>
              </Link>
              <Link to="/is-my-data-exposed" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Is My Data Already Exposed?</h3>
                <p className="text-sm text-muted-foreground">Calm, factual answers about data exposure.</p>
              </Link>
              <Link to="/digital-privacy-glossary" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">Digital Privacy Glossary</h3>
                <p className="text-sm text-muted-foreground">Key terms and definitions explained.</p>
              </Link>
              <Link to="/what-is-osint" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                <h3 className="font-medium text-foreground mb-1">What Is OSINT?</h3>
                <p className="text-sm text-muted-foreground">Introduction to open-source intelligence.</p>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ReduceDigitalFootprint;
