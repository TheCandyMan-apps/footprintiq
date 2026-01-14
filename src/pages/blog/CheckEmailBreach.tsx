import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO, organizationSchema } from "@/components/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, AlertTriangle, Shield, Lock, Search, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";

export default function CheckEmailBreach() {
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
        name: "How to Check If Your Email Was Breached"
      }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: "How to Check If Your Email Was Breached",
    description: "Complete guide to checking if your email was exposed in data breaches, what to do if compromised, and prevention strategies.",
    image: "https://footprintiq.app/blog-images/email-breach.webp",
    datePublished: "2025-01-12T09:00:00Z",
    dateModified: "2025-01-12T09:00:00Z",
    author: {
      "@type": "Organization",
      name: "FootprintIQ"
    },
    publisher: organizationSchema,
    keywords: "email breach, data breach, password security, cybersecurity, identity theft"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="How to Check If Your Email Was Breached | FootprintIQ"
        description="Complete guide to checking if your email was exposed in data breaches, what to do if compromised, and prevention strategies."
        canonical="https://footprintiq.app/blog/check-email-breach"
        ogImage="https://footprintiq.app/blog-images/email-breach.webp"
        article={{
          publishedTime: "2025-01-12T09:00:00Z",
          modifiedTime: "2025-01-12T09:00:00Z",
          author: "FootprintIQ",
          tags: ["Security", "Data Breach", "Email Security"]
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
                <Badge>Security</Badge>
                <Badge variant="outline">Breach Detection</Badge>
                <span className="text-sm text-muted-foreground">6 min read</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How to Check If Your Email Was Breached
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <time dateTime="2025-01-12">January 12, 2025</time>
                <span>•</span>
                <span>By FootprintIQ Security Team</span>
              </div>
            </div>

            <div className="mb-12 rounded-lg overflow-hidden">
              <img 
                src="/blog-images/email-breach.webp" 
                alt="Email breach detection and security"
                className="w-full h-auto"
              />
            </div>

            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-xl leading-relaxed text-muted-foreground">
                Data breaches expose millions of email addresses and passwords every year. If your email was involved 
                in a breach, your personal information may be available to hackers on the dark web.
              </p>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                  <h2 className="text-3xl font-bold">What Happens in a Data Breach?</h2>
                </div>
                <Card className="p-6">
                  <p className="text-lg mb-4">
                    When companies experience security breaches, attackers often steal databases containing sensitive 
                    user information. This data typically includes:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Mail className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Email addresses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Lock className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Hashed or plaintext passwords</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Phone numbers</span>
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Physical addresses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Credit card information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Social security numbers</span>
                      </li>
                    </ul>
                  </div>
                </Card>
              </section>

              <BlogCallout type="warning" title="Critical Statistic">
                <p>
                  Over 15 billion credentials have been exposed in data breaches. On average, each email address 
                  appears in 4-5 different breaches.
                </p>
              </BlogCallout>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">How to Check for Breaches</h2>
                </div>
                <div className="space-y-6">
                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Use Have I Been Pwned</h3>
                        <p className="text-muted-foreground">
                          The most trusted free service for checking if your email was exposed in known breaches. Simply 
                          enter your email address to see if it appears in their database of over 11 billion compromised accounts.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Run OSINT Scans</h3>
                        <p className="text-muted-foreground mb-4">
                          Tools like FootprintIQ aggregate data from multiple breach databases to give you comprehensive 
                          results, showing not just breaches but also where your email appears in public forums and paste sites.
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
                        3
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Check Dark Web Monitoring</h3>
                        <p className="text-muted-foreground">
                          Premium services monitor underground forums and marketplaces for your data, providing alerts 
                          when new exposures are detected.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                The average time between a breach occurring and being publicly disclosed is 6-9 months. Your data could be compromised right now without you knowing.
              </BlogPullQuote>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">What to Do If You're Compromised</h2>
                </div>
                <div className="grid md:grid-cols-1 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Immediate Actions
                    </h3>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">1.</span>
                        <span><strong>Change Your Passwords Immediately</strong> - Update passwords on all affected 
                        accounts. Don't reuse the same password.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">2.</span>
                        <span><strong>Enable Two-Factor Authentication</strong> - Add an extra layer of security to 
                        prevent unauthorized access even if passwords leak.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">3.</span>
                        <span><strong>Monitor Your Accounts</strong> - Watch for suspicious activity on financial and 
                        important accounts for the next few months.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">4.</span>
                        <span><strong>Consider Identity Theft Protection</strong> - Services that monitor credit reports 
                        and financial activity can catch fraud early.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-semibold text-primary">5.</span>
                        <span><strong>Use Unique Passwords</strong> - Never reuse passwords across different services. 
                        Use a password manager to generate and store strong, unique passwords.</span>
                      </li>
                    </ol>
                  </Card>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-bold">Prevention Strategies</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Use a Password Manager</h3>
                    <p className="text-muted-foreground">
                      Password managers generate and store unique, strong passwords for each account, making it 
                      impossible to reuse passwords and easy to change them if compromised.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Enable 2FA Everywhere</h3>
                    <p className="text-muted-foreground">
                      Two-factor authentication adds a second verification step beyond passwords, significantly reducing 
                      the risk of account takeover even if credentials are stolen.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Use Temporary Emails</h3>
                    <p className="text-muted-foreground">
                      For untrusted sites, use disposable email addresses. Services like SimpleLogin or AnonAddy create 
                      aliases that forward to your real email.
                    </p>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Regular Breach Monitoring</h3>
                    <p className="text-muted-foreground">
                      Set up automated alerts through services like FootprintIQ to be notified immediately when new 
                      breaches affecting your email are discovered.
                    </p>
                  </Card>
                </div>
              </section>

              <section className="border-t pt-8">
                <h2 className="text-3xl font-bold mb-6">Understanding Breach Severity</h2>
                <Card className="p-8 bg-primary/5">
                  <p className="text-lg mb-4">Not all breaches are equal. Consider these factors:</p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Data Sensitivity:</strong> What type of information was exposed? Financial data is 
                      more critical than email addresses alone.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Password Protection:</strong> Were passwords hashed, salted, or plaintext? Plaintext 
                      passwords pose immediate danger.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Breach Date:</strong> Recent breaches pose higher immediate risk as attackers actively 
                      exploit fresh data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Company Response:</strong> How quickly was the breach disclosed and patched? Delayed 
                      disclosure increases risk.</span>
                    </li>
                  </ul>
                  <p className="text-lg">
                    Stay proactive about your email security by running regular breach checks and updating your security 
                    practices accordingly.
                  </p>
                </Card>
              </section>

              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link to="/blog/dark-web-monitoring-explained">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <Badge className="mb-3">Next Article</Badge>
                      <h3 className="text-xl font-semibold mb-2">Dark Web Monitoring Explained</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how dark web monitoring protects you from credential theft and data exposure.
                      </p>
                    </Card>
                  </Link>
                  <Link to="/blog/username-security">
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-xl font-semibold mb-2">Username Security Best Practices</h3>
                      <p className="text-sm text-muted-foreground">
                        Discover why username reuse is dangerous and how to protect your online identity.
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
