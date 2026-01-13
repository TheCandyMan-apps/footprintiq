import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
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
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Privacy Basics</Badge>
            <Badge variant="outline">Essential Reading</Badge>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              January 15, 2025
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            What Is a Digital Footprint? Complete Guide 2025
          </h1>

          {/* Gradient Divider */}
          <div className="h-1 w-24 bg-gradient-to-r from-primary via-primary-glow to-accent rounded-full mb-8"></div>

          {/* Featured Image */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border-2 border-border/50">
            <img 
              src="/blog-images/digital-footprint.webp" 
              alt="Digital footprint visualization showing online data trail"
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
              A digital footprint is the trail of data you leave behind while using the internet. Every time you 
              browse websites, post on social media, shop online, or use apps, you're creating digital traces that 
              can be tracked, collected, and analyzed.
            </p>

            <h2>Types of Digital Footprints</h2>
            
            <p>
              Understanding the different types of digital footprints is essential for managing your online 
              presence effectively. Your digital trail can be categorized into two main types.
            </p>

            <h3>Active Digital Footprint</h3>
            <p>
              Information you <strong>deliberately share online</strong>, such as social media posts, blog comments, 
              emails, and form submissions. This is data you knowingly provide to websites and platforms.
            </p>
            <ul>
              <li>Social media posts and comments</li>
              <li>Email communications</li>
              <li>Online forms and registrations</li>
              <li>Forum contributions and discussions</li>
              <li>Reviews, ratings, and testimonials</li>
            </ul>

            <h3>Passive Digital Footprint</h3>
            <p>
              Data collected about you <strong>without your direct input</strong>, including IP addresses, browsing 
              history, cookies, and device information. This happens automatically in the background as you 
              navigate the web.
            </p>
            <ul>
              <li>IP addresses and geolocation data</li>
              <li>Browsing history and cookies</li>
              <li>Device fingerprinting</li>
              <li>App usage patterns</li>
              <li>Search engine queries</li>
            </ul>

            <blockquote className="border-l-4 border-primary pl-6 my-8 italic text-lg">
              Your digital footprint is like a shadow — it follows you everywhere online, often without you 
              realizing it's there.
            </blockquote>

            <h2>Why Your Digital Footprint Matters</h2>
            
            <p>
              Your digital footprint has far-reaching implications for your privacy, security, and reputation. 
              Understanding these risks is the first step toward protecting yourself.
            </p>

            <h3>Privacy Risks</h3>
            <p>
              Personal information can be exposed to data brokers, advertisers, and malicious actors. Once 
              your data is out there, you have limited control over who sees it. Data brokers aggregate 
              information from hundreds of sources to build detailed profiles that are sold to third parties.
            </p>

            <h3>Reputation Impact</h3>
            <p>
              Online content can affect job prospects, relationships, and professional opportunities. 
              <strong>85% of employers</strong> routinely search for candidates online before making hiring 
              decisions. A single embarrassing post from years ago can resurface at the worst possible moment.
            </p>

            <h3>Security Threats</h3>
            <p>
              Exposed data can be used for identity theft, phishing, and social engineering attacks. The more 
              information available about you, the easier it is for attackers to impersonate you or craft 
              convincing targeted attacks.
            </p>

            <h3>Financial Implications</h3>
            <p>
              Data brokers sell your information to third parties without your consent, profiting from your 
              personal data while you receive nothing in return. Some estimates suggest your data is worth 
              hundreds of dollars per year to advertisers.
            </p>

            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 my-8">
              <p className="!text-destructive font-semibold !my-0">
                ⚠️ Important Reality Check
              </p>
              <p className="!my-2">
                According to recent studies, the average person has personal information listed on over 
                <strong> 200 data broker websites</strong>. Most people are completely unaware of this exposure.
              </p>
            </div>

            <h2>How to Manage Your Digital Footprint</h2>
            
            <p>
              Taking control of your digital footprint requires a systematic approach. Follow these steps 
              to reduce your exposure and protect your privacy.
            </p>

            <h3>1. Audit Your Online Presence</h3>
            <p>
              Use OSINT tools like FootprintIQ to scan what information is publicly available about you. 
              Understanding your exposure is the first step to reducing it. Search for your name, email 
              addresses, phone numbers, and usernames across multiple platforms.
            </p>

            <h3>2. Remove Old Accounts</h3>
            <p>
              Delete unused social media profiles and accounts you no longer need. Old accounts are security 
              vulnerabilities and continue to expose your data even when inactive. Use services like 
              JustDelete.me to find deletion links for common platforms.
            </p>

            <h3>3. Adjust Privacy Settings</h3>
            <p>
              Review and tighten privacy controls on all your active accounts. Most platforms default to 
              maximum data sharing — you need to manually restrict what's visible. Check privacy settings 
              quarterly as platforms frequently update their options.
            </p>

            <h3>4. Use Data Removal Services</h3>
            <p>
              Employ automated tools to request removal from data broker sites. Manual removal takes 
              <strong> 40-60+ hours</strong> and needs to be repeated regularly as your information gets 
              re-listed. Automated services can handle this ongoing maintenance for you.
            </p>

            <h3>5. Monitor Regularly</h3>
            <p>
              Set up continuous monitoring to catch new exposures early. Your digital footprint changes 
              constantly as new data appears online. Set up Google Alerts for your name and use breach 
              notification services like Have I Been Pwned.
            </p>

            <h2>Tools and Services</h2>
            
            <p>
              FootprintIQ provides comprehensive digital footprint scanning using trusted OSINT sources to 
              help you understand and manage your online exposure.
            </p>

            <ul>
              <li><strong>Have I Been Pwned:</strong> Email breach detection across billions of records</li>
              <li><strong>Shodan:</strong> IP and device exposure scanning for technical vulnerabilities</li>
              <li><strong>VirusTotal:</strong> Domain and file reputation checks</li>
              <li><strong>100+ data broker removal services:</strong> Automated opt-out requests</li>
            </ul>

            <h2>Taking Action Today</h2>
            
            <p>
              Start by running a free scan to see what information is currently exposed about you online. 
              Once you understand your digital footprint, you can take concrete steps to reduce your exposure 
              and protect your privacy.
            </p>
            
            <p>
              The key is to <strong>be proactive rather than reactive</strong>. Don't wait for a security 
              incident or embarrassing discovery to take your digital footprint seriously. The information 
              is already out there — the question is whether you'll take control of it.
            </p>
          </div>

          {/* CTA Section */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5 rounded-3xl border-2 border-primary/20">
            <h3 className="text-2xl font-bold mb-3">Discover Your Digital Footprint</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Run a comprehensive scan to see what information is publicly available about you online.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link to="/scan">Scan Your Digital Footprint</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold">
                <Link to="/blog">More Privacy Guides</Link>
              </Button>
            </div>
          </div>

          {/* Related Articles */}
          <div className="mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/blog/remove-data-brokers" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <Badge className="mb-3 bg-primary/10 text-primary">Next Article</Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">Remove Your Info from Data Brokers</h3>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step guide to removing your personal information from data broker websites.
                  </p>
                </Card>
              </Link>
              <Link to="/blog/osint-beginners-guide" className="group">
                <Card className="p-6 hover:shadow-lg hover:border-primary/30 transition-all h-full">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">OSINT for Beginners</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how open-source intelligence works and how it affects your privacy.
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
