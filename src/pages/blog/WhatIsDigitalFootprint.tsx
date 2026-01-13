import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, Shield, UserX, Search, Trash2, Settings, Bell, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";

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
        name: "What Is a Digital Footprint"
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
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

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
                <span>By FootprintIQ Security Team</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/digital-footprint.webp" 
                alt="Digital footprint visualization showing online data trail"
                className="w-full h-auto"
                loading="eager"
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
              {/* Section 1: Types of Digital Footprints */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Eye className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Types of Digital Footprints</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Understanding the different types of digital footprints is essential for managing your online 
                  presence effectively. Your digital trail can be categorized into two main types.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Eye className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold">Active Digital Footprint</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Information you <strong>deliberately share online</strong>, such as social media posts, blog comments, 
                      emails, and form submissions.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Social media posts and comments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Email communications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Online forms and registrations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Forum contributions and discussions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Reviews, ratings, and testimonials</span>
                      </li>
                    </ul>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <EyeOff className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-semibold">Passive Digital Footprint</h3>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Data collected about you <strong>without your direct input</strong>, including IP addresses, browsing 
                      history, and device information.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>IP addresses and geolocation data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Browsing history and cookies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Device fingerprinting</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>App usage patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Search engine queries</span>
                      </li>
                    </ul>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                Your digital footprint is like a shadow — it follows you everywhere online, often without you 
                realizing it's there.
              </BlogPullQuote>

              {/* Section 2: Why Your Digital Footprint Matters */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Why Your Digital Footprint Matters</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Your digital footprint has far-reaching implications for your privacy, security, and reputation. 
                  Understanding these risks is the first step toward protecting yourself.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <UserX className="h-5 w-5 text-primary" />
                      Privacy Risks
                    </h3>
                    <p className="text-muted-foreground">
                      Personal information can be exposed to data brokers, advertisers, and malicious actors. Once 
                      your data is out there, you have limited control over who sees it.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Search className="h-5 w-5 text-primary" />
                      Reputation Impact
                    </h3>
                    <p className="text-muted-foreground">
                      Online content can affect job prospects, relationships, and professional opportunities. 
                      <strong> 85% of employers</strong> routinely search for candidates online before hiring.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Security Threats
                    </h3>
                    <p className="text-muted-foreground">
                      Exposed data can be used for identity theft, phishing, and social engineering attacks. The more 
                      information available about you, the easier it is for attackers to target you.
                    </p>
                  </Card>

                  <Card className="p-6 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Financial Implications
                    </h3>
                    <p className="text-muted-foreground">
                      Data brokers sell your information to third parties without your consent. Your data is worth 
                      hundreds of dollars per year to advertisers.
                    </p>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="Important Reality Check">
                According to recent studies, the average person has personal information listed on over 
                <strong> 200 data broker websites</strong>. Most people are completely unaware of this exposure.
              </BlogCallout>

              {/* Section 3: How to Manage Your Digital Footprint */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Settings className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">How to Manage Your Digital Footprint</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Taking control of your digital footprint requires a systematic approach. Follow these steps 
                  to reduce your exposure and protect your privacy.
                </p>
                <div className="space-y-6">
                  <Card className="p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Audit Your Online Presence</h3>
                        <p className="text-muted-foreground">
                          Use OSINT tools like FootprintIQ to scan what information is publicly available about you. 
                          Search for your name, email addresses, phone numbers, and usernames across multiple platforms.
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
                        <h3 className="text-xl font-semibold mb-2">Remove Old Accounts</h3>
                        <p className="text-muted-foreground">
                          Delete unused social media profiles and accounts you no longer need. Old accounts are security 
                          vulnerabilities and continue to expose your data even when inactive.
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
                        <h3 className="text-xl font-semibold mb-2">Adjust Privacy Settings</h3>
                        <p className="text-muted-foreground">
                          Review and tighten privacy controls on all your active accounts. Most platforms default to 
                          maximum data sharing — you need to manually restrict what's visible.
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
                        <h3 className="text-xl font-semibold mb-2">Use Data Removal Services</h3>
                        <p className="text-muted-foreground">
                          Employ automated tools to request removal from data broker sites. Manual removal takes 
                          <strong> 40-60+ hours</strong> and needs to be repeated regularly.
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
                        <h3 className="text-xl font-semibold mb-2">Monitor Regularly</h3>
                        <p className="text-muted-foreground">
                          Set up continuous monitoring to catch new exposures early. Your digital footprint changes 
                          constantly as new data appears online.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              {/* Section 4: Tools and Services */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Trash2 className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Tools and Services</h2>
                </div>
                <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="p-0">
                    <p className="text-lg mb-6">
                      FootprintIQ provides comprehensive digital footprint scanning using trusted OSINT sources to 
                      help you understand and manage your online exposure.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Have I Been Pwned:</strong> Email breach detection across billions of records</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Shodan:</strong> IP and device exposure scanning for technical vulnerabilities</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>VirusTotal:</strong> Domain and file reputation checks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>100+ data broker removal services:</strong> Automated opt-out requests</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                The key is to be proactive rather than reactive. Don't wait for a security incident or embarrassing 
                discovery to take your digital footprint seriously.
              </BlogPullQuote>

              {/* CTA Section */}
              <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Discover Your Digital Footprint</h2>
                <p className="text-muted-foreground mb-6 text-lg">
                  Run a comprehensive scan to see what information is publicly available about you online.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <Link to="/scan">Scan Your Digital Footprint</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/blog">More Privacy Guides</Link>
                  </Button>
                </div>
              </section>

              {/* Related Articles */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/remove-data-brokers" className="group">
                    <Card className="p-6 h-full transition-all hover:shadow-lg hover:border-primary/30">
                      <Badge className="mb-3">Next Article</Badge>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        Remove Your Info from Data Brokers
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step guide to removing your personal information from data broker websites.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog/osint-beginners-guide" className="group">
                    <Card className="p-6 h-full transition-all hover:shadow-lg hover:border-primary/30">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        OSINT for Beginners
                      </h3>
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
