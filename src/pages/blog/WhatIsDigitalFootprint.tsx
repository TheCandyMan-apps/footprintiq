import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Shield, Search, UserX, Trash2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";

export default function WhatIsDigitalFootprint() {
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
        name: "What Is a Digital Footprint?"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "What Is a Digital Footprint? Complete Guide 2025",
    description: "Comprehensive guide to understanding your digital footprint, why it matters, and practical steps to manage and reduce your online exposure.",
    image: "https://footprintiq.app/blog-images/digital-footprint.webp",
    datePublished: "2025-01-15T09:00:00Z",
    dateModified: "2025-01-15T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "digital footprint, online privacy, internet security, personal data, OSINT"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="What Is a Digital Footprint? Complete Guide 2025 | FootprintIQ"
        description="Comprehensive guide to understanding your digital footprint, why it matters, and practical steps to manage and reduce your online exposure."
        canonical="https://footprintiq.app/blog/what-is-digital-footprint"
        ogImage="https://footprintiq.app/blog-images/digital-footprint.webp"
        article={{
          publishedTime: "2025-01-15T09:00:00Z",
          modifiedTime: "2025-01-15T09:00:00Z",
          author: "FootprintIQ",
          tags: ["Privacy", "Digital Footprint", "Online Security"]
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
                <Badge>Privacy Basics</Badge>
                <Badge variant="outline">Essential Reading</Badge>
                <span className="text-sm text-muted-foreground">8 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                What Is a Digital Footprint? Complete Guide 2025
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2025-01-15">January 15, 2025</time>
                <span>•</span>
                <span>By FootprintIQ Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/digital-footprint.webp" 
                alt="Digital footprint visualization showing online data trail"
                className="w-full h-auto"
              />
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                A digital footprint is the trail of data you leave behind while using the internet. Every time you 
                browse websites, post on social media, shop online, or use apps, you're creating digital traces that 
                can be tracked, collected, and analyzed.
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Types of Digital Footprints</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3">Active Digital Footprint</h3>
                    <p className="text-muted-foreground mb-4">
                      Information you deliberately share online, such as social media posts, blog comments, emails, 
                      and form submissions. This is data you knowingly provide.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                      <li>Social media posts and comments</li>
                      <li>Email communications</li>
                      <li>Online forms and registrations</li>
                      <li>Forum contributions</li>
                      <li>Reviews and ratings</li>
                    </ul>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-3">Passive Digital Footprint</h3>
                    <p className="text-muted-foreground mb-4">
                      Data collected about you without your direct input, including IP addresses, browsing history, 
                      cookies, and device information. This happens automatically in the background.
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                      <li>IP addresses and geolocation data</li>
                      <li>Browsing history and cookies</li>
                      <li>Device fingerprinting</li>
                      <li>App usage patterns</li>
                      <li>Search engine queries</li>
                    </ul>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                Your digital footprint is like a shadow - it follows you everywhere online, often without you realizing it's there.
              </BlogPullQuote>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-destructive" />
                  <h2 className="text-3xl font-bold">Why Your Digital Footprint Matters</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <UserX className="w-5 h-5 text-destructive" />
                      Privacy Risks
                    </h3>
                    <p className="text-muted-foreground">
                      Personal information can be exposed to data brokers, advertisers, and malicious actors. Once 
                      your data is out there, you have limited control over who sees it.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Reputation Impact</h3>
                    <p className="text-muted-foreground">
                      Online content can affect job prospects, relationships, and professional opportunities. Employers 
                      routinely search for candidates online before making hiring decisions.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Security Threats</h3>
                    <p className="text-muted-foreground">
                      Exposed data can be used for identity theft, phishing, and social engineering attacks. The more 
                      information available, the easier it is for attackers to impersonate you.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Financial Implications</h3>
                    <p className="text-muted-foreground">
                      Data brokers sell your information to third parties without your consent, profiting from your 
                      personal data while you receive nothing in return.
                    </p>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="Important Reality Check">
                <p>
                  According to recent studies, the average person has personal information listed on over 200 data 
                  broker websites. Most people are completely unaware of this exposure.
                </p>
              </BlogCallout>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">How to Manage Your Digital Footprint</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Audit Your Online Presence</h3>
                        <p className="text-muted-foreground mb-4">
                          Use OSINT tools like FootprintIQ to scan what information is publicly available about you. 
                          Understanding your exposure is the first step to reducing it.
                        </p>
                        <Link to="/scan" className="text-primary hover:underline">
                          Start a free scan →
                        </Link>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Remove Old Accounts</h3>
                        <p className="text-muted-foreground">
                          Delete unused social media profiles and accounts you no longer need. Old accounts are security 
                          vulnerabilities and continue to expose your data even when inactive.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Adjust Privacy Settings</h3>
                        <p className="text-muted-foreground">
                          Review and tighten privacy controls on all your active accounts. Most platforms default to 
                          maximum data sharing - you need to manually restrict what's visible.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Use Data Removal Services</h3>
                        <p className="text-muted-foreground">
                          Employ automated tools to request removal from data broker sites. Manual removal takes 
                          40-60+ hours and needs to be repeated regularly.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        5
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Monitor Regularly</h3>
                        <p className="text-muted-foreground">
                          Set up continuous monitoring to catch new exposures early. Your digital footprint changes 
                          constantly as new data appears online.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Tools and Services</h2>
                </div>
                <Card className="p-6">
                  <p className="text-lg mb-4">
                    FootprintIQ provides comprehensive digital footprint scanning using trusted OSINT sources including:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Have I Been Pwned</strong> - Email breach detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Shodan</strong> - IP and device exposure scanning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>VirusTotal</strong> - Domain and file reputation checks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>100+ data broker removal services</strong></span>
                    </li>
                  </ul>
                </Card>
              </section>

              {/* Conclusion */}
              <section className="border-t pt-8">
                <h2 className="text-3xl font-bold mb-6">Taking Action Today</h2>
                <Card className="p-8 bg-primary/5">
                  <p className="text-lg mb-6">
                    Start by running a free scan to see what information is currently exposed about you online. Once you 
                    understand your digital footprint, you can take concrete steps to reduce your exposure and protect 
                    your privacy.
                  </p>
                  <div className="flex gap-4">
                    <Link to="/scan">
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Scan Your Digital Footprint
                      </button>
                    </Link>
                    <Link to="/blog">
                      <button className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors">
                        More Privacy Guides
                      </button>
                    </Link>
                  </div>
                </Card>
              </section>

              {/* Related Articles */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/remove-data-brokers">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <Badge className="mb-3">Next Article</Badge>
                      <h3 className="text-xl font-semibold mb-2">Remove Your Info from Data Brokers</h3>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step guide to removing your personal information from data broker websites.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog/osint-beginners-guide">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold mb-2">OSINT for Beginners</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how open-source intelligence works and how it affects your privacy.
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
