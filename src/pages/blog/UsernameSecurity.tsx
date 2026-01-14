import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Shield, Search, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function UsernameSecurity() {
  const heroImage = getBlogHeroImage("username-security");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Username Security" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: "Username Security: Protect Your Online Identity in 2024",
    description: "Complete guide to securing your usernames across platforms. Learn best practices for unique identifiers and privacy protection.",
    author: { "@type": "Organization" as const, name: "FootprintIQ" },
    publisher: { "@type": "Organization" as const, name: "FootprintIQ", logo: { "@type": "ImageObject" as const, url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <SEO
        title="Username Security Guide 2024 | Protect Your Online Identity"
        description="Learn how to create secure usernames that protect your privacy. Best practices for unique identifiers, OSINT protection, and account security."
        canonical="https://footprintiq.app/blog/username-security"
        ogImage={heroImage}
        article={{ publishedTime: "2024-01-15", modifiedTime: "2024-01-15", author: "FootprintIQ" }}
        schema={{
          article: articleSchema,
          breadcrumbs: breadcrumbSchema,
          organization: organizationSchema
        }}
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
        <Header />
        
        <main className="flex-1">
          <article className="container mx-auto px-4 py-12 max-w-4xl">
            <Link to="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Blog
            </Link>

            {heroImage && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Username security and online identity protection"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Username Security: Protect Your Online Identity in 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>10 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Your username is more than just a login identifier—it's a digital fingerprint that can reveal your entire online presence. Learn how to choose and protect usernames strategically.
              </p>

              <BlogCallout type="warning" title="The Username Problem">
                Using the same username across multiple platforms creates a map of your digital life. OSINT researchers can connect your accounts, revealing your interests, locations, and relationships.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Why Username Security Matters
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        OSINT Tracking
                      </h3>
                      <p className="text-muted-foreground">
                        Unique usernames let researchers build comprehensive profiles across platforms.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Identity Correlation
                      </h3>
                      <p className="text-muted-foreground">
                        Same username = connecting your professional and personal accounts.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Data Aggregation
                      </h3>
                      <p className="text-muted-foreground">
                        Tools like Sherlock and WhatsMyName.app find your accounts instantly.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Account Security
                      </h3>
                      <p className="text-muted-foreground">
                        Predictable usernames make targeted phishing and social engineering easier.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="OSINT Research Study">
                87% of people use the same username on at least 3 different platforms, making it trivial to connect their online identities and build comprehensive profiles.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Common Username Mistakes</h2>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Using Your Real Name
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        "john.smith" or "johnsmith85" immediately reveals your identity.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Use pseudonyms or randomly generated usernames unrelated to your identity.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Same Username Everywhere
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Using "cryptoking42" on Reddit, Twitter, Discord creates an easy trail.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Use different usernames for different platform categories.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Including Birth Year
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        "sarah1994" reveals your approximate age and makes you predictable.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Avoid any personal information in usernames.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Location-Based Usernames
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        "nycjoe" or "londontech" discloses where you live or work.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Keep location information private unless necessary.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Best Practices for Secure Usernames
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">1. Use Compartmentalized Identities</h3>
                      <p className="mb-3">
                        Create separate username strategies for different contexts:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Professional:</strong> LinkedIn, work email (can use real name)</li>
                        <li>• <strong>Social:</strong> Facebook, Instagram (pseudonym or variation)</li>
                        <li>• <strong>Anonymous:</strong> Reddit, forums (completely unrelated)</li>
                        <li>• <strong>Gaming:</strong> Steam, Discord (separate from other identities)</li>
                        <li>• <strong>Financial:</strong> Banking, crypto (unique, never reused)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">2. Generate Random Usernames</h3>
                      <p className="mb-3">
                        Tools for creating secure, unique usernames:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Bitwarden:</strong> Built-in username generator (random words or strings)</li>
                        <li>• <strong>1Password:</strong> Username generator with email aliasing</li>
                        <li>• <strong>Jimpix Username Generator:</strong> Combines random words</li>
                        <li>• <strong>SpinXO:</strong> Generates creative usernames with themes</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">3. Check Username Availability Across Platforms</h3>
                      <p className="mb-3">
                        Before settling on a username, verify it's not already associated with you:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Namechk.com:</strong> Search username across 100+ platforms</li>
                        <li>• <strong>KnowEm.com:</strong> Check 500+ social networks</li>
                        <li>• <strong>Sherlock:</strong> Command-line tool for username OSINT</li>
                        <li>• <strong>WhatsMyName.app:</strong> Find where username is registered</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">4. Document Your Usernames Securely</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Store usernames in a password manager</li>
                        <li>• Tag entries by category (professional, personal, anonymous)</li>
                        <li>• Include notes on which email is associated</li>
                        <li>• Never share username lists publicly</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Pro Tip: Email Aliasing">
                Combine unique usernames with email aliasing (Gmail's +alias feature or SimpleLogin) to completely isolate your accounts. This prevents both username and email correlation.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">OSINT Tools That Track Usernames</h2>
                <p className="mb-4">
                  Be aware of tools that researchers use to find your accounts:
                </p>
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Sherlock:</strong> Searches 350+ websites for username matches</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Namechk:</strong> Username checker across social platforms</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Social Searcher:</strong> Real-time social media monitoring</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Pipl:</strong> People search engine linking usernames to profiles</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                The best username is one that can't be connected to any other aspect of your identity. Think of each account as a separate digital persona.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Migrating to Secure Usernames</h2>
                <p className="mb-4">
                  If you already use predictable usernames, here's how to transition:
                </p>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 1:</strong> Audit current usernames across all accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 2:</strong> Generate new, unrelated usernames for each category</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 3:</strong> Change usernames on platforms that allow it</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 4:</strong> For platforms that don't allow changes, create new accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 5:</strong> Delete old accounts after migrating connections/data</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 6:</strong> Monitor for old username mentions with alerts</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogCallout type="warning" title="Platform Limitations">
                Some platforms (Twitter, Instagram) don't permanently delete old usernames—they may remain searchable even after you change them. Consider this when choosing platforms for sensitive discussions.
              </BlogCallout>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Discover Your Username Exposure</h2>
                <p className="text-lg mb-6">
                  FootprintIQ tracks where your usernames appear online and shows you potential correlations.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Scan Your Usernames</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/osint-beginners-guide" className="text-primary hover:underline">
                          OSINT Beginner's Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how researchers track digital identities
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/social-media-privacy" className="text-primary hover:underline">
                          Social Media Privacy Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Secure your social platform accounts
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    </>
  );
}
