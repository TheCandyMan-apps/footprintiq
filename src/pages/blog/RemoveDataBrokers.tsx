import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Shield, Search, Ban, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function RemoveDataBrokers() {
  const heroImage = getBlogHeroImage("remove-data-brokers");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Remove Data from Data Brokers" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "How to Remove Your Data from Data Brokers: Complete 2024 Guide",
    description: "Step-by-step guide to remove your personal information from data broker sites and protect your privacy online.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <SEO
        title="Free Data Broker Removal Guide — Remove Personal Information Online | FootprintIQ"
        description="Free data broker removal guide to remove personal information from data broker sites. Protect family members from identity theft with automated data removal services."
        canonical="https://footprintiq.app/blog/remove-data-brokers"
        article={{
          publishedTime: "2024-01-15",
          modifiedTime: "2024-01-15",
          author: "FootprintIQ",
          tags: ["Privacy", "Data Brokers", "Security", "Free Data Broker Removal", "Personal Data", "Identity Theft"]
        }}
        schema={{
          breadcrumbs: breadcrumbSchema,
          custom: articleSchema
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
                  alt="Free data broker removal concept illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Free Data Broker Removal: Complete Guide
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>12 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Data brokers collect and sell your personal information and personal data without your knowledge, contributing significantly to your overall <Link to="/ai/digital-exposure" className="text-primary hover:underline">digital exposure</Link>. This comprehensive free data broker removal guide shows you exactly how to find and remove your data from these companies, protecting your email addresses and family members from identity theft.
              </p>
              
              {/* Internal Links Section - NEW */}
              <div className="bg-muted/30 rounded-lg p-6 mb-8 not-prose">
                <h2 className="text-lg font-semibold mb-4">Related Resources</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link to="/digital-footprint-scanner" className="flex items-center gap-2 text-primary hover:underline">
                    <ArrowRight className="h-4 w-4" />
                    Scan Your Digital Footprint
                  </Link>
                  <Link to="/email-breach-check" className="flex items-center gap-2 text-primary hover:underline">
                    <ArrowRight className="h-4 w-4" />
                    Check Email Breaches
                  </Link>
                  <Link to="/blog/what-is-osint-risk" className="flex items-center gap-2 text-primary hover:underline">
                    <ArrowRight className="h-4 w-4" />
                    Understanding OSINT Risk
                  </Link>
                </div>
              </div>

              <BlogCallout type="warning" title="The Data Broker Problem">
                Over 4,000 data broker companies operate in the US alone, collecting and selling personal information about billions of people worldwide. Your personal data is likely on dozens of these sites right now. Many offer removal services, but automated data removal is often more effective.</BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Search className="h-8 w-8 text-primary" />
                  What Are Data Brokers?
                </h2>
                <p className="mb-6">
                  Data brokers are companies that collect, aggregate, and sell personal information about consumers. They gather data from:
                </p>
                <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Public records:</strong> Property ownership, court records, voter registration</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Online activity:</strong> Social media, browsing history, purchases</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Commercial sources:</strong> Loyalty programs, surveys, apps</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Other brokers:</strong> Trading and sharing data between companies</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote author="Privacy Rights Clearinghouse">
                The average American's personal data appears on 200+ data broker websites, including names, addresses, phone numbers, and family relationships.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Why You Should Remove Your Data
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Identity Theft Protection
                      </h3>
                      <p className="text-muted-foreground">
                        Exposed data makes you vulnerable to identity theft, fraud, and account takeovers.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Ban className="h-5 w-5 text-primary" />
                        Stalking Prevention
                      </h3>
                      <p className="text-muted-foreground">
                        Your address and contact details can be used for harassment or physical threats.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Price Discrimination
                      </h3>
                      <p className="text-muted-foreground">
                        Companies use your data to charge different prices based on your profile.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Privacy Control
                      </h3>
                      <p className="text-muted-foreground">
                        Regain control over who has access to your personal information.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Major Data Brokers to Target First</h2>
                <BlogCallout type="info" title="Priority List">
                  Start with these high-profile data brokers that have the most comprehensive profiles:
                </BlogCallout>
                <Card className="mb-6 border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <ol className="space-y-4">
                      <li><strong>Spokeo</strong> - People search engine with social media aggregation</li>
                      <li><strong>Whitepages</strong> - Contact information and address history</li>
                      <li><strong>BeenVerified</strong> - Background checks and public records</li>
                      <li><strong>Intelius</strong> - Comprehensive people search platform</li>
                      <li><strong>PeopleFinders</strong> - Phone numbers and relatives</li>
                      <li><strong>TruthFinder</strong> - Criminal records and social profiles</li>
                      <li><strong>MyLife</strong> - Reputation scores and reviews</li>
                      <li><strong>Radaris</strong> - Public records aggregator</li>
                    </ol>
                  </CardContent>
                </Card>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  Step-by-Step Removal Process
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 1: Find Your Records</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Search each data broker site using your name, email, and phone</li>
                        <li>• Run a <Link to="/username-search" className="text-primary hover:underline">username search</Link> to find accounts you may have forgotten</li>
                        <li>• Check your <Link to="/email-breach-check" className="text-primary hover:underline">email for breaches</Link> that may have exposed your data to brokers</li>
                        <li>• Take screenshots of all records found</li>
                        <li>• Document profile URLs for each listing</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 2: Submit Opt-Out Requests</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Locate the opt-out or privacy page on each site</li>
                        <li>• Complete removal forms with required information</li>
                        <li>• Verify your identity (some sites require ID)</li>
                        <li>• Keep confirmation emails and request numbers</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 3: Follow Up</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Wait the stated processing time (usually 30-60 days)</li>
                        <li>• Search again to confirm removal</li>
                        <li>• Send follow-up emails if data still appears</li>
                        <li>• File complaints with FTC if necessary</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 4: Ongoing Monitoring</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Set calendar reminders to check quarterly</li>
                        <li>• Data can reappear from public records</li>
                        <li>• Submit new opt-outs as needed</li>
                        <li>• Consider using automated removal services</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Pro Tip: Automation Tools">
                Services like DeleteMe, PrivacyDuck, and OneRep can automate the removal process across hundreds of data brokers. While they cost $100-200/year, they save significant time and provide ongoing monitoring.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Common Challenges & Solutions</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Challenge: ID Verification Required</h3>
                      <p className="text-muted-foreground mb-2">
                        Some brokers require government ID to remove data.
                      </p>
                      <p className="text-sm">
                        <strong>Solution:</strong> Use a service like Abine Blur to create virtual IDs, or send redacted copies showing only necessary info.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Challenge: Data Reappears</h3>
                      <p className="text-muted-foreground mb-2">
                        Profiles return after successful removal.
                      </p>
                      <p className="text-sm">
                        <strong>Solution:</strong> Set up quarterly monitoring. Public records are continuously harvested, requiring repeated opt-outs.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Challenge: No Response to Requests</h3>
                      <p className="text-muted-foreground mb-2">
                        Broker ignores your opt-out submission.
                      </p>
                      <p className="text-sm">
                        <strong>Solution:</strong> File complaint with FTC and state attorney general. California residents can invoke CCPA rights.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Legal Rights & Protections</h2>
                <p className="mb-4">
                  Your rights vary by location:
                </p>
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li>
                        <strong>California (CCPA):</strong> Right to know what data is collected, right to deletion, right to opt-out of sale
                      </li>
                      <li>
                        <strong>Virginia (VCDPA):</strong> Access, correction, deletion, and opt-out rights
                      </li>
                      <li>
                        <strong>Colorado (CPA):</strong> Similar protections with additional portability rights
                      </li>
                      <li>
                        <strong>EU/UK (GDPR):</strong> Comprehensive data protection with strict broker obligations
                      </li>
                      <li>
                        <strong>Federal (US):</strong> Limited protections; mostly industry self-regulation
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                Removing your data from brokers isn't a one-time task—it requires ongoing vigilance. But the privacy and security benefits are worth the effort.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Prevention: Stop Future Exposure</h2>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Opt out of marketing lists at DirectMail.com and OptOutPrescreen.com</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Use privacy-focused services and avoid loyalty programs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Read privacy policies before sharing information</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Use alias emails and phone numbers for online accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Minimize social media exposure and public sharing</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Take Control of Your Data</h2>
                <p className="text-lg mb-6">
                  FootprintIQ helps you discover and monitor your exposure across data broker sites automatically.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Start Free Scan</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/what-is-digital-footprint" className="text-primary hover:underline">
                          What is a Digital Footprint?
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Understanding your online presence and digital trail
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
                        Protect your information on social platforms
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
