import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Shield, AlertCircle, Database, Bell, Lock, CheckCircle, Search, Users, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";

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
        name: "What is OSINT Risk"
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: [
      {
        "@type": "Question" as const,
        name: "What is OSINT risk?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "OSINT risk refers to the potential for threat actors to exploit publicly available information to compromise your security posture. This includes data from social media, corporate websites, public databases, and technical resources."
        }
      },
      {
        "@type": "Question" as const,
        name: "How do attackers use OSINT?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Attackers use OSINT for reconnaissance to build detailed profiles of organizations and individuals. They combine information from multiple sources to craft targeted phishing campaigns, identify vulnerabilities, and plan social engineering attacks."
        }
      },
      {
        "@type": "Question" as const,
        name: "How can organizations reduce OSINT risk?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Organizations can reduce OSINT risk by conducting regular audits, implementing security awareness training, monitoring breach databases, sanitizing job postings, securing legacy digital assets, and enforcing multi-factor authentication."
        }
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
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="OSINT Industries Digital Footprint Risk — Understanding Your Exposure | FootprintIQ"
        description="Learn about OSINT industries and digital footprint risk. Understand how real time monitoring of email and phone number exposure, online presence, API access, and user base analysis reveals your attack surface."
        canonical="https://footprintiq.app/blog/what-is-osint-risk"
        ogImage="https://footprintiq.app/blog-images/osint.webp"
        article={{
          publishedTime: "2025-01-31T09:00:00Z",
          modifiedTime: "2025-01-31T09:00:00Z",
          author: "FootprintIQ",
          tags: ["OSINT", "Cybersecurity", "Threat Intelligence", "OSINT Industries", "Digital Footprint"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          faq: faqSchema,
          custom: articleSchema
        }}
      />
      <Header />
      
      <main className="flex-1">
        <article className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge>Cybersecurity</Badge>
                <Badge variant="outline">OSINT Industries</Badge>
                <span className="text-sm text-muted-foreground">8 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                OSINT Industries & Digital Footprint Risk Explained
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2025-01-31">January 31, 2025</time>
                <span>•</span>
                <span>By FootprintIQ Security Team</span>
              </div>
            </div>
            
            {/* Internal Links Section - NEW */}
            <div className="bg-muted/30 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Related Resources</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/digital-footprint-scanner" className="flex items-center gap-2 text-primary hover:underline">
                  <ArrowRight className="h-4 w-4" />
                  Scan Your Digital Footprint
                </Link>
                <Link to="/usernames" className="flex items-center gap-2 text-primary hover:underline">
                  <ArrowRight className="h-4 w-4" />
                  Username Search
                </Link>
                <Link to="/email-breach-check" className="flex items-center gap-2 text-primary hover:underline">
                  <ArrowRight className="h-4 w-4" />
                  Email Breach Check
                </Link>
                <Link to="/blog/remove-data-brokers" className="flex items-center gap-2 text-primary hover:underline">
                  <ArrowRight className="h-4 w-4" />
                  Remove Data from Brokers
                </Link>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/osint.webp" 
                alt="OSINT Industries Digital Footprint Risk - Online presence analysis"
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                In today's interconnected digital landscape, the OSINT industries have grown rapidly as information about 
                your organization, employees, and infrastructure becomes more accessible. Your digital footprint—including 
                email and phone number exposure, online presence, and API access patterns—creates what security 
                professionals call <strong>"OSINT risk"</strong>. Threat actors use real time monitoring to exploit publicly 
                available information and compromise your security posture, growing their user base of targets continuously.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1: Understanding OSINT */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Understanding Open-Source Intelligence</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <p className="text-lg">
                    <strong>OSINT (Open-Source Intelligence)</strong> refers to information collected from publicly 
                    available sources. Unlike classified intelligence or private data breaches, OSINT is entirely legal 
                    and accessible to anyone with internet access. This democratization of information is a double-edged sword.
                  </p>
                  <h3 className="text-xl font-semibold pt-4">Common OSINT Sources</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Social Media:</strong> LinkedIn profiles, Twitter posts, Facebook check-ins, Instagram stories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Corporate Websites:</strong> About pages, team directories, press releases, job postings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Public Databases:</strong> Business registries, court records, property records, SEC filings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Technical Resources:</strong> GitHub repositories, Stack Overflow, technical forums</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Domain Records:</strong> WHOIS information, DNS records, SSL certificate data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                      <span><strong>Breach Databases:</strong> Exposed credentials, leaked documents, paste site contents</span>
                    </li>
                  </ul>
                </Card>
              </section>

              {/* Section 2: Why OSINT Poses a Security Risk */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why OSINT Poses a Security Risk</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  The danger of OSINT isn't in any single piece of information — it's in how these fragments combine 
                  to create a comprehensive attack blueprint.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold">Reconnaissance</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Attackers build detailed profiles from LinkedIn posts, job listings, and social media to craft 
                      targeted phishing campaigns.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold">Footprint Accumulation</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Every interaction leaves traces. Old posts, archived sites, and forgotten accounts combine into 
                      an ever-growing attack surface.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Key className="w-6 h-6 text-primary" />
                      <h3 className="text-lg font-semibold">Credential Exposure</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      When employees reuse passwords, one breach becomes a gateway to your entire infrastructure 
                      through credential stuffing.
                    </p>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="Critical Statistic">
                <strong>45% of sophisticated spear phishing attacks succeed</strong> when attackers use OSINT to 
                personalize their messages with conference details, colleague names, and language patterns.
              </BlogCallout>

              {/* Section 3: Real-World Attack Scenarios */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Real-World OSINT Attack Scenarios</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Spear Phishing Campaign</h3>
                        <p className="text-muted-foreground">
                          An attacker finds your company's org chart on LinkedIn, identifies the CFO, discovers they 
                          recently attended a fintech conference (from a tweet), and sends a convincing email about 
                          an "urgent wire transfer" using this context. The email references the specific conference 
                          and mentions colleagues by name.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Supply Chain Compromise</h3>
                        <p className="text-muted-foreground">
                          Through GitHub repositories and job postings, attackers identify your third-party vendors 
                          and their technologies. They compromise a less-secure vendor by finding exposed credentials 
                          in a breach database, then pivot into your network using legitimate vendor access.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-destructive bg-gradient-to-r from-destructive/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Social Engineering via Help Desk</h3>
                        <p className="text-muted-foreground">
                          An attacker calls your help desk pretending to be an employee. Using information from social 
                          media — the manager's name, recent projects, office location — they convince support to reset 
                          a "forgotten" password and gain immediate network access.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                OSINT risk isn't about hiding from the internet — it's about understanding your exposure and 
                reducing your attack surface through informed decisions.
              </BlogPullQuote>

              {/* Section 4: Reducing Your OSINT Risk */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Reducing Your OSINT Risk Exposure</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Effective OSINT risk management isn't about disappearing from the internet — that's impossible 
                  in today's business environment. Instead, focus on understanding your exposure and making 
                  informed decisions about what information is truly necessary to share publicly.
                </p>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Conduct Regular OSINT Audits</h3>
                        <p className="text-muted-foreground">
                          Assess what information is publicly available about your organization before attackers do. 
                          Use comprehensive scanning tools to discover your digital footprint across social media, 
                          breach databases, and technical resources.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Implement Security Awareness Training</h3>
                        <p className="text-muted-foreground">
                          Educate employees about the risks of oversharing on social media, especially regarding work 
                          details, technology stacks, and internal projects. Most employees don't realize their posts 
                          about "finally fixing that vulnerability" are intelligence gold.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Monitor Breach Databases Continuously</h3>
                        <p className="text-muted-foreground">
                          Don't wait for attackers to find your exposed credentials first. Continuously monitor breach 
                          databases for your organization's domains and key personnel. Force password resets immediately 
                          when exposure is detected.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Sanitize Public Job Postings</h3>
                        <p className="text-muted-foreground">
                          Avoid listing specific technologies, versions, and internal tools in job descriptions. 
                          "Experience with enterprise networking" is safer than "Experience with Cisco ASA 5505 
                          running 9.12.4."
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        5
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Secure Legacy Digital Assets</h3>
                        <p className="text-muted-foreground">
                          Archive or remove old websites, dormant social accounts, and profiles of former employees. 
                          These forgotten assets often contain outdated but still-useful intelligence for attackers.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        6
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Enforce Multi-Factor Authentication</h3>
                        <p className="text-muted-foreground">
                          Even if credentials are exposed via OSINT, MFA provides a critical second layer of defense. 
                          Require it for all employee accounts and prioritize phishing-resistant methods for high-value targets.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="The Bottom Line">
                Organizations that proactively manage their OSINT footprint significantly reduce the likelihood of 
                successful attacks. The first step is knowing what information is out there — most organizations are 
                surprised by what a comprehensive audit reveals.
              </BlogCallout>

              {/* CTA Section */}
              <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Discover Your OSINT Exposure</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  Run a comprehensive scan to see what information attackers can find about your organization.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">Start Free Scan</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/enterprise">Enterprise Solutions</Link>
                  </Button>
                </div>
              </section>

              {/* Related Articles */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/dark-web-monitoring-explained" className="group">
                    <Card className="p-6 h-full transition-all hover:shadow-lg hover:border-primary/30">
                      <Badge className="mb-3">Next Article</Badge>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        Dark Web Monitoring Explained
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how dark web monitoring protects your organization from credential theft and data exposure.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog" className="group">
                    <Card className="p-6 h-full transition-all hover:shadow-lg hover:border-primary/30">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        View All Articles
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Explore our complete library of cybersecurity and OSINT resources.
                      </p>
                    </Card>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </div>
  );
}
