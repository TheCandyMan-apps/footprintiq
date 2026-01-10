import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function WhatIsOsintRisk() {
  const breadcrumbs = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: "https://footprintiq.app"
      },
      {
        "@type": "ListItem" as const,
        position: 2,
        name: "Blog",
        item: "https://footprintiq.app/blog"
      },
      {
        "@type": "ListItem" as const,
        position: 3,
        name: "What is OSINT Risk?"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "What is OSINT Risk? Understanding Your Digital Exposure",
    description: "Learn what OSINT risk means for your business, how threat actors use open-source intelligence, and practical steps to reduce your digital attack surface.",
    image: "https://footprintiq.app/blog-images/osint.webp",
    datePublished: "2025-01-31T09:00:00Z",
    dateModified: "2025-01-31T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "OSINT risk, open source intelligence, cybersecurity, digital footprint, threat intelligence"
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <SEO 
        title="What is OSINT Risk? Understanding Your Digital Exposure | FootprintIQ"
        description="Learn what OSINT risk means for your business, how threat actors use open-source intelligence, and practical steps to reduce your digital attack surface."
        canonical="https://footprintiq.app/blog/what-is-osint-risk"
        ogImage="https://footprintiq.app/blog-images/osint.webp"
        article={{
          publishedTime: "2025-01-31T09:00:00Z",
          modifiedTime: "2025-01-31T09:00:00Z",
          author: "FootprintIQ",
          tags: ["OSINT", "Cybersecurity", "Threat Intelligence"]
        }}
      />
      <StructuredData 
        organization={organizationSchema}
        breadcrumbs={breadcrumbs}
        custom={articleSchema}
      />
      <Header />
      
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-6 py-12">
          {/* Back Link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>

          {/* Header Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Cybersecurity</Badge>
            <Badge variant="outline">OSINT</Badge>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              January 31, 2025
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            What is OSINT Risk? Understanding Your Digital Exposure
          </h1>

          {/* Gradient Divider */}
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Featured Image */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-2 border-border/50">
            <img 
              src="/blog-images/osint.webp" 
              alt="OSINT Risk Visualization - Digital footprint analysis"
              className="w-full h-auto object-cover"
              loading="eager"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:my-4
            prose-ul:my-6 prose-ol:my-6
            prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-primary prose-a:no-underline prose-a:font-medium hover:prose-a:underline">
            
            <p className="text-xl leading-relaxed !text-foreground/80 !my-8">
              In today's interconnected digital landscape, information about your organization, employees, 
              and infrastructure is more accessible than ever. This accessibility creates what security 
              professionals call <strong>"OSINT risk"</strong> — the potential for threat actors to exploit publicly 
              available information to compromise your security posture.
            </p>

            <h2>Understanding Open-Source Intelligence</h2>
            
            <p>
              <strong>OSINT (Open-Source Intelligence)</strong> refers to information collected from publicly 
              available sources. Unlike classified intelligence or private data breaches, OSINT is entirely legal 
              and accessible to anyone with internet access. This democratization of information is a double-edged sword.
            </p>
            
            <p>Common OSINT sources that threat actors leverage include:</p>
            
            <ul>
              <li><strong>Social Media Platforms:</strong> LinkedIn profiles, Twitter posts, Facebook check-ins, and Instagram stories</li>
              <li><strong>Corporate Websites:</strong> About pages, team directories, press releases, and job postings</li>
              <li><strong>Public Databases:</strong> Business registries, court records, property records, and SEC filings</li>
              <li><strong>Technical Resources:</strong> GitHub repositories, Stack Overflow questions, and technical forums</li>
              <li><strong>Domain Records:</strong> WHOIS information, DNS records, and SSL certificate data</li>
              <li><strong>Breach Databases:</strong> Exposed credentials, leaked documents, and paste site contents</li>
              <li><strong>News and Media:</strong> Press coverage, interviews, conference presentations, and podcasts</li>
            </ul>

            <h2>Why OSINT Poses a Security Risk</h2>
            
            <p>
              The danger of OSINT isn't in any single piece of information — it's in how these fragments combine 
              to create a comprehensive attack blueprint. Here's how threat actors weaponize publicly available data:
            </p>

            <h3>Reconnaissance for Targeted Attacks</h3>
            <p>
              Attackers use OSINT to build detailed profiles of organizations and individuals. A single 
              LinkedIn job posting can reveal your technology stack, making it easier to craft targeted phishing 
              campaigns or identify known vulnerabilities in your infrastructure. When combined with employee 
              social media posts about projects or frustrations, attackers gain unprecedented insight into your 
              organization's inner workings.
            </p>

            <h3>Digital Footprint Accumulation</h3>
            <p>
              Every online interaction leaves a trace. Over years, these traces combine to create a 
              comprehensive picture of your organization's operations, personnel, and potential weaknesses. 
              Old employee social media posts, archived websites via the Wayback Machine, and forgotten 
              accounts all contribute to an ever-growing attack surface that most organizations don't even 
              know exists.
            </p>

            <h3>Credential Exposure and Reuse</h3>
            <p>
              Data breaches expose millions of credentials annually. When employees reuse passwords across 
              personal and work accounts, one breach becomes a gateway to your entire infrastructure. OSINT 
              researchers can easily find these exposed credentials in public breach databases, and automated 
              tools make credential stuffing attacks trivially simple.
            </p>

            <h2>Real-World OSINT Attack Scenarios</h2>
            
            <p>
              Understanding how attackers weaponize OSINT helps organizations prepare defenses. Here are 
              three common attack patterns:
            </p>

            <h3>Scenario 1: Spear Phishing Campaign</h3>
            <p>
              An attacker finds your company's org chart on LinkedIn, identifies the CFO, discovers they 
              recently attended a fintech conference (from a tweet), and sends a convincing email about 
              an "urgent wire transfer" using this context. The email references the specific conference, 
              mentions colleagues by name, and uses language patterns observed from the CFO's public posts. 
              Success rate for sophisticated spear phishing: <strong>45% according to recent studies</strong>.
            </p>

            <h3>Scenario 2: Supply Chain Compromise</h3>
            <p>
              Through GitHub repositories and job postings, attackers identify your third-party vendors 
              and their technologies. They compromise a less-secure vendor by finding exposed credentials 
              in a breach database, then pivot into your network using legitimate vendor access. The 
              SolarWinds attack demonstrated how devastating this vector can be at scale.
            </p>

            <h3>Scenario 3: Social Engineering via Help Desk</h3>
            <p>
              An attacker calls your help desk pretending to be an employee. Using information from social 
              media — the manager's name, recent projects, office location, the employee's pet's name — they 
              convince support to reset a "forgotten" password. With valid credentials in hand, they have 
              immediate network access without triggering security alerts.
            </p>

            <h2>Reducing Your OSINT Risk Exposure</h2>
            
            <p>
              Effective OSINT risk management isn't about disappearing from the internet — that's impossible 
              in today's business environment. Instead, focus on understanding your exposure and making 
              informed decisions about what information is truly necessary to share publicly.
            </p>

            <h3>1. Conduct Regular OSINT Audits</h3>
            <p>
              Assess what information is publicly available about your organization before attackers do. 
              Use comprehensive scanning tools to discover your digital footprint across social media, 
              breach databases, dark web forums, and technical resources. Regular audits should be part 
              of your security calendar, not a one-time activity.
            </p>

            <h3>2. Implement Security Awareness Training</h3>
            <p>
              Educate employees about the risks of oversharing on social media, especially regarding work 
              details, technology stacks, and internal projects. Create clear social media policies that 
              balance personal expression with operational security. Most employees don't realize their 
              innocent posts about "finally fixing that Apache vulnerability" are intelligence gold.
            </p>

            <h3>3. Monitor Breach Databases Continuously</h3>
            <p>
              Don't wait for attackers to find your exposed credentials first. Continuously monitor breach 
              databases for your organization's domains and key personnel. Force password resets immediately 
              when exposure is detected. Set up automated alerts so you learn about breaches in hours, not months.
            </p>

            <h3>4. Sanitize Public Job Postings</h3>
            <p>
              Avoid listing specific technologies, versions, and internal tools in job descriptions. 
              "Experience with enterprise networking" is safer than "Experience with Cisco ASA 5505 
              running 9.12.4." Focus on skills and experience rather than revealing your exact technology stack.
            </p>

            <h3>5. Secure Legacy Digital Assets</h3>
            <p>
              Archive or remove old websites, dormant social accounts, and profiles of former employees. 
              Use archive.org removal requests for sensitive cached content. These forgotten assets often 
              contain outdated but still-useful intelligence for attackers.
            </p>

            <h3>6. Enforce Multi-Factor Authentication</h3>
            <p>
              Even if credentials are exposed via OSINT, MFA provides a critical second layer of defense. 
              Require it for all employee accounts and sensitive systems. Prioritize phishing-resistant 
              methods like hardware security keys for high-value targets.
            </p>

            <h2>The Bottom Line</h2>
            
            <p>
              OSINT risk isn't about hiding from the internet — it's about <strong>understanding your exposure</strong> and 
              <strong>reducing your attack surface</strong> through informed decisions. Organizations that proactively 
              manage their OSINT footprint significantly reduce the likelihood of successful attacks.
            </p>
            
            <p>
              The first step is knowing what information is out there. Most organizations are surprised — 
              and often alarmed — by what a comprehensive OSINT audit reveals. From exposed employee credentials 
              to detailed infrastructure maps pieced together from job postings and GitHub commits, the attack 
              surface is almost always larger than expected.
            </p>
            
            <p>
              Take control of your digital exposure before threat actors do. Understanding your OSINT risk 
              is the foundation of modern security posture management.
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-3">Discover Your OSINT Exposure</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Run a comprehensive scan to see what information attackers can find about your organization.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/scan">Start Free Scan</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/enterprise">Enterprise Solutions</Link>
              </Button>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/dark-web-monitoring-explained" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">Next Article</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Dark Web Monitoring Explained</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how dark web monitoring protects your organization from credential theft and data exposure.
                  </p>
                </Card>
              </Link>
              <Link to="/blog" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">View All Articles</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore our complete library of cybersecurity and OSINT resources.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}