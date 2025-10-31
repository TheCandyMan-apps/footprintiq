import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Eye, Shield, Search, Globe, Lock } from "lucide-react";
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
    <div className="min-h-screen flex flex-col">
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
        <article className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge>Cybersecurity</Badge>
                <Badge variant="outline">OSINT</Badge>
                <span className="text-sm text-muted-foreground">8 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                What is OSINT Risk? Understanding Your Digital Exposure
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2025-01-31">January 31, 2025</time>
                <span>•</span>
                <span>By FootprintIQ Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/osint.webp" 
                alt="OSINT Risk Visualization - Digital footprint analysis"
                className="w-full h-auto"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                In today's interconnected digital landscape, information about your organization, employees, 
                and infrastructure is more accessible than ever. This accessibility creates what security 
                professionals call "OSINT risk" - the potential for threat actors to exploit publicly 
                available information.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Understanding OSINT</h2>
                </div>
                <Card className="p-6">
                  <p className="text-lg mb-4">
                    <strong>OSINT (Open-Source Intelligence)</strong> refers to information collected from publicly 
                    available sources. Unlike classified intelligence or private data breaches, OSINT is entirely legal 
                    and accessible to anyone with internet access.
                  </p>
                  <p className="text-lg mb-4">
                    Common OSINT sources include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Social media profiles and posts</li>
                    <li>Company websites and job postings</li>
                    <li>Public databases and business registries</li>
                    <li>Technical forums and code repositories (GitHub)</li>
                    <li>News articles and press releases</li>
                    <li>Domain registration records (WHOIS)</li>
                    <li>Breach databases and paste sites</li>
                  </ul>
                </Card>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <h2 className="text-3xl font-bold">What Makes OSINT Risky?</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Reconnaissance for Targeted Attacks
                    </h3>
                    <p className="text-muted-foreground">
                      Attackers use OSINT to build detailed profiles of organizations and individuals. A single 
                      LinkedIn job posting can reveal your tech stack, making it easier to craft targeted phishing 
                      campaigns or exploit known vulnerabilities.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Digital Footprint Accumulation
                    </h3>
                    <p className="text-muted-foreground">
                      Every online interaction leaves a trace. Over years, these traces combine to create a 
                      comprehensive picture of your organization's operations, personnel, and potential weaknesses. 
                      Old employee social media posts, archived websites, and forgotten accounts all contribute.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Credential Exposure
                    </h3>
                    <p className="text-muted-foreground">
                      Data breaches expose millions of credentials annually. When employees reuse passwords across 
                      personal and work accounts, one breach becomes a gateway to your entire infrastructure. OSINT 
                      researchers can easily find these exposed credentials in public breach databases.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Real-World OSINT Attack Scenarios</h2>
                </div>
                <Card className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Scenario 1: Spear Phishing Campaign</h3>
                    <p className="text-muted-foreground">
                      An attacker finds your company's org chart on LinkedIn, identifies the CFO, discovers they 
                      recently attended a fintech conference (from a tweet), and sends a convincing email about 
                      "urgent wire transfer" using this context. Success rate: 45% according to recent studies.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Scenario 2: Supply Chain Compromise</h3>
                    <p className="text-muted-foreground">
                      Through GitHub repositories and job postings, attackers identify your third-party vendors 
                      and their technologies. They compromise a less-secure vendor, then pivot into your network 
                      using legitimate vendor credentials found in a previous breach.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Scenario 3: Social Engineering</h3>
                    <p className="text-muted-foreground">
                      An attacker calls your help desk pretending to be an employee. Using information from social 
                      media (manager's name, recent projects, office location), they convince support to reset their 
                      "forgotten" password, gaining immediate network access.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-3xl font-bold mb-6">Reducing Your OSINT Risk</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">1. Conduct Regular OSINT Audits</h3>
                    <p className="text-muted-foreground mb-4">
                      Assess what information is publicly available about your organization. Use tools like 
                      FootprintIQ to discover your digital footprint before attackers do.
                    </p>
                    <Link to="/scan" className="text-primary hover:underline">
                      Start a free scan →
                    </Link>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">2. Implement Security Awareness Training</h3>
                    <p className="text-muted-foreground">
                      Educate employees about oversharing on social media, especially regarding work details, 
                      technology stacks, and internal projects. Create clear social media policies.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">3. Monitor Breach Databases</h3>
                    <p className="text-muted-foreground">
                      Continuously check if employee credentials appear in data breaches. Force password resets 
                      immediately when exposure is detected. Set up automated alerts for your domain.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">4. Sanitize Job Postings</h3>
                    <p className="text-muted-foreground">
                      Avoid listing specific technologies, versions, and internal tools in job descriptions. 
                      Focus on skills and experience rather than your exact tech stack.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">5. Secure Old Digital Assets</h3>
                    <p className="text-muted-foreground">
                      Archive or remove old websites, social accounts, and employee profiles that no longer serve 
                      a purpose. Use archive.org removal requests when appropriate.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">6. Enable Multi-Factor Authentication</h3>
                    <p className="text-muted-foreground">
                      Even if credentials are exposed via OSINT, MFA provides a critical second layer of defense. 
                      Require it for all employee accounts and sensitive systems.
                    </p>
                  </Card>
                </div>
              </section>

              {/* Conclusion */}
              <section className="border-t pt-8">
                <h2 className="text-3xl font-bold mb-6">The Bottom Line</h2>
                <Card className="p-8 bg-primary/5">
                  <p className="text-lg mb-4">
                    OSINT risk isn't about hiding from the internet - that's impossible in today's business environment. 
                    Instead, it's about <strong>understanding your exposure</strong> and <strong>reducing your attack 
                    surface</strong> through informed decisions.
                  </p>
                  <p className="text-lg mb-6">
                    Organizations that proactively manage their OSINT footprint significantly reduce the likelihood 
                    of successful attacks. The first step is knowing what information is out there.
                  </p>
                  <div className="flex gap-4">
                    <Link to="/scan">
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Scan Your Digital Footprint
                      </button>
                    </Link>
                    <Link to="/enterprise">
                      <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                        Enterprise Solutions
                      </button>
                    </Link>
                  </div>
                </Card>
              </section>

              {/* Related Articles */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/dark-web-monitoring-explained">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <Badge className="mb-3">Next Article</Badge>
                      <h3 className="text-xl font-semibold mb-2">Dark Web Monitoring Explained</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how dark web monitoring protects your organization from credential theft and data exposure.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold mb-2">View All Articles</h3>
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