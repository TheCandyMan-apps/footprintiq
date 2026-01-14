import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Database, Globe, Code, Shield, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";

export default function OsintBeginnersGuide() {
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
        name: "OSINT for Beginners"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "OSINT for Beginners: Open-Source Intelligence Explained",
    description: "Complete beginner's guide to OSINT - what it is, how it works, popular tools, legal considerations, and how to protect yourself.",
    image: "https://footprintiq.app/blog-images/osint.webp",
    datePublished: "2025-01-10T09:00:00Z",
    dateModified: "2025-01-10T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "OSINT, open source intelligence, cybersecurity, digital investigation, privacy"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="OSINT for Beginners: Open-Source Intelligence Explained | FootprintIQ"
        description="Complete beginner's guide to OSINT - what it is, how it works, popular tools, legal considerations, and how to protect yourself."
        canonical="https://footprintiq.app/blog/osint-beginners-guide"
        ogImage="https://footprintiq.app/blog-images/osint.webp"
        article={{
          publishedTime: "2025-01-10T09:00:00Z",
          modifiedTime: "2025-01-10T09:00:00Z",
          author: "FootprintIQ",
          tags: ["OSINT", "Cybersecurity", "Privacy"]
        }}
        schema={{
          organization: organizationSchema,
          breadcrumbs: breadcrumbs,
          custom: articleSchema
        }}
      />
      <Header />
      
      <main className="flex-1">
        <article className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge>OSINT</Badge>
                <Badge variant="outline">Beginner Friendly</Badge>
                <span className="text-sm text-muted-foreground">10 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                OSINT for Beginners: Open-Source Intelligence Explained
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2025-01-10">January 10, 2025</time>
                <span>•</span>
                <span>By FootprintIQ Research Team</span>
              </div>
            </div>

            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/osint.webp" 
                alt="OSINT tools and techniques for beginners"
                className="w-full h-auto"
              />
            </div>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                OSINT (Open-Source Intelligence) refers to the collection and analysis of publicly available information. 
                Originally a practice used by intelligence agencies, OSINT has become essential for cybersecurity professionals, 
                journalists, researchers, and individuals concerned about their privacy.
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What Counts as Open-Source Intelligence?</h2>
                </div>
                <Card className="p-6">
                  <p className="text-lg mb-4">OSINT encompasses data from multiple public sources:</p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Public Records
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Court documents</li>
                        <li>• Property records</li>
                        <li>• Business registrations</li>
                        <li>• Professional licenses</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Social Media
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Posts and photos</li>
                        <li>• Connections and networks</li>
                        <li>• Location check-ins</li>
                        <li>• Metadata from images</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Code className="w-5 h-5 text-primary" />
                        Technical Sources
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• DNS records</li>
                        <li>• WHOIS data</li>
                        <li>• IP addresses</li>
                        <li>• Open ports</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Breach Databases
                      </h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Exposed credentials</li>
                        <li>• Compromised emails</li>
                        <li>• Leaked passwords</li>
                        <li>• Personal information</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </section>

              <BlogPullQuote>
                The difference between OSINT and hacking is simple: OSINT only uses publicly available information. No unauthorized access required.
              </BlogPullQuote>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Common OSINT Use Cases</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3">1. Personal Privacy Protection</h3>
                    <p className="text-muted-foreground">
                      Discovering what information about you is publicly accessible and taking steps to remove it. This is 
                      often called "self-OSINT" and is the first step in protecting your digital footprint.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3">2. Cybersecurity</h3>
                    <p className="text-muted-foreground">
                      Identifying vulnerabilities in networks and systems before attackers do. Security teams use OSINT to 
                      understand their organization's external attack surface.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3">3. Investigation</h3>
                    <p className="text-muted-foreground">
                      Researching companies, individuals, or suspicious activities. Journalists use OSINT for investigative 
                      reporting, while law enforcement uses it for criminal investigations.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3">4. Brand Protection</h3>
                    <p className="text-muted-foreground">
                      Monitoring mentions, impersonation attempts, and reputation threats. Companies use OSINT to detect 
                      phishing domains, fake social media accounts, and unauthorized use of their brand.
                    </p>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">Popular OSINT Tools</h2>
                <div className="grid md:grid-cols-1 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">For Email Intelligence</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>Have I Been Pwned</strong> - Breach detection across 11+ billion accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>Hunter.io</strong> - Email discovery and verification for domains</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>EmailRep</strong> - Reputation scoring based on online presence</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong><Link to="/email-breach-check" className="text-primary hover:underline">FootprintIQ Email Breach Check</Link></strong> - Check if your email was exposed in breaches</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">For Domain/IP Research</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>Shodan</strong> - Internet-connected device search engine</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>VirusTotal</strong> - File and URL analysis with 70+ antivirus engines</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>WHOIS</strong> - Domain registration information</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">For Social Media & Usernames</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>Social-Searcher</strong> - Cross-platform monitoring and alerts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>Sherlock</strong> - Username search across 300+ platforms</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong>IntelTechniques</strong> - Comprehensive social media tools</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong><Link to="/username-search" className="text-primary hover:underline">FootprintIQ Username Search</Link></strong> - Find where your handles appear online</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">•</span>
                        <span><strong><Link to="/username-search-tools" className="text-primary hover:underline">Username Tools Comparison</Link></strong> - Pros & cons of Sherlock, Maigret, and more</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Pro Tip for Beginners">
                <p>
                  Start by performing OSINT on yourself. This "self-OSINT" exercise will help you understand what 
                  information is publicly available about you and give you hands-on experience with common tools.
                </p>
              </BlogCallout>

              <section>
                <h2 className="text-3xl font-bold mb-6">OSINT Methodology</h2>
                <div className="space-y-6">
                  {[
                    {
                      num: 1,
                      title: "Define Objectives",
                      desc: "What information are you looking for? Be specific about your goals to avoid getting overwhelmed by data."
                    },
                    {
                      num: 2,
                      title: "Collect Data",
                      desc: "Gather information from multiple sources using the appropriate tools for each data type."
                    },
                    {
                      num: 3,
                      title: "Process and Analyze",
                      desc: "Filter, correlate, and validate findings. Look for patterns and connections between data points."
                    },
                    {
                      num: 4,
                      title: "Verify Information",
                      desc: "Cross-reference data to ensure accuracy. Never rely on a single source for critical information."
                    },
                    {
                      num: 5,
                      title: "Report Findings",
                      desc: "Document results and actionable insights in a clear, structured format."
                    }
                  ].map((step) => (
                    <Card key={step.num} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                          {step.num}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">Legal and Ethical Considerations</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-green-500/20 bg-green-500/5">
                    <h3 className="text-xl font-semibold mb-4 text-green-700 dark:text-green-300">
                      ✓ What's Legal
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Accessing publicly available information</li>
                      <li>• Using search engines and public databases</li>
                      <li>• Analyzing your own digital footprint</li>
                      <li>• Reading public social media profiles</li>
                      <li>• Checking domain registrations</li>
                    </ul>
                  </Card>

                  <Card className="p-6 border-red-500/20 bg-red-500/5">
                    <h3 className="text-xl font-semibold mb-4 text-red-700 dark:text-red-300">
                      ✗ What's Not Legal
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Hacking or unauthorized system access</li>
                      <li>• Using stolen credentials illegally</li>
                      <li>• Harassment or stalking individuals</li>
                      <li>• Violating terms of service</li>
                      <li>• Bypassing authentication systems</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-bold mb-6">How FootprintIQ Uses OSINT</h2>
                <Card className="p-6">
                  <p className="text-lg mb-4">
                    FootprintIQ aggregates data from trusted OSINT sources to provide comprehensive digital footprint scanning:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h3 className="font-semibold mb-2">Email Scans</h3>
                      <p className="text-sm text-muted-foreground">
                        Check for breaches and identify associated accounts across multiple platforms
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Username Searches</h3>
                      <p className="text-sm text-muted-foreground">
                        Find profiles across major platforms and discover forgotten accounts
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Domain Intelligence</h3>
                      <p className="text-sm text-muted-foreground">
                        Analyze reputation, tech stack, and DNS history for domains
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">IP Exposure</h3>
                      <p className="text-sm text-muted-foreground">
                        Identify open ports and vulnerable services using Shodan data
                      </p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link to="/scan" className="text-primary hover:underline">
                      Start your free OSINT scan →
                    </Link>
                  </div>
                </Card>
              </section>

              <section className="border-t pt-8">
                <h2 className="text-3xl font-bold mb-6">Getting Started with OSINT</h2>
                <Card className="p-8 bg-primary/5">
                  <p className="text-lg mb-6">
                    Begin by running an OSINT scan on yourself using FootprintIQ. This will show you exactly what 
                    information is publicly available and help you understand the power and scope of open-source intelligence.
                  </p>
                  <p className="text-lg mb-6">
                    Remember: The same tools that help protect your privacy can be used against you. Understanding OSINT 
                    is the first step in securing your digital footprint.
                  </p>
                  <div className="flex gap-4">
                    <Link to="/scan">
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Run Your First OSINT Scan
                      </button>
                    </Link>
                    <Link to="/blog/what-is-osint-risk">
                      <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                        Learn About OSINT Risk
                      </button>
                    </Link>
                  </div>
                </Card>
              </section>

              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/what-is-osint-risk">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <Badge className="mb-3">Next Article</Badge>
                      <h3 className="text-xl font-semibold mb-2">Understanding OSINT Risk</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how threat actors use OSINT and how to reduce your digital attack surface.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog/what-is-digital-footprint">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold mb-2">What Is a Digital Footprint?</h3>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive guide to understanding and managing your digital footprint.
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
