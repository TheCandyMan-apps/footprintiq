import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Phone, Shield, AlertTriangle, CheckCircle2, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { StructuredData } from "@/components/StructuredData";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function PhoneNumberPrivacy() {
  const heroImage = getBlogHeroImage("phone-number-privacy");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Phone Number Privacy" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Phone Number Privacy: Complete Protection Guide 2024",
    description: "Learn how to protect your phone number from spam, scams, and data brokers. Comprehensive guide with actionable privacy strategies.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <Helmet>
        <title>Phone Number Privacy Guide 2024 | Stop Spam & Protect Your Number</title>
        <meta name="description" content="Protect your phone number from spam calls, scams, and data brokers. Learn strategies for securing your mobile privacy with virtual numbers and call blocking." />
        <link rel="canonical" href="https://footprintiq.app/blog/phone-number-privacy" />
      </Helmet>

      <StructuredData breadcrumbs={breadcrumbSchema} custom={articleSchema} />

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
                  alt="Phone number privacy and security illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Phone Number Privacy: Complete Protection Guide 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>11 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Your phone number is a direct line to you—and to scammers, spammers, and data brokers. Learn how to protect your number and maintain your privacy in 2024.
              </p>

              <BlogCallout type="warning" title="Spam Call Epidemic">
                Americans received 55.8 billion spam calls in 2023—an average of 14 calls per person per month. Your number is likely already in dozens of databases.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Why Phone Number Privacy Matters
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        SIM Swapping
                      </h3>
                      <p className="text-muted-foreground">
                        Attackers can hijack your number to bypass 2FA and gain access to your accounts.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Ban className="h-5 w-5 text-primary" />
                        Spam & Scams
                      </h3>
                      <p className="text-muted-foreground">
                        Robocalls, phishing attempts, and SMS scams target your number constantly.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Data Broker Sales
                      </h3>
                      <p className="text-muted-foreground">
                        Your number is sold to marketing databases and appears on people-search sites.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        Location Tracking
                      </h3>
                      <p className="text-muted-foreground">
                        Phone numbers can be used to track your location and movements.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="FTC Consumer Sentinel">
                Phone-based scams resulted in $2.6 billion in losses in 2023, with the average victim losing $1,400. Your number is your vulnerability.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">How Your Phone Number Gets Exposed</h2>
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Data breaches:</strong> Companies you've done business with get hacked</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Social media:</strong> Public profiles and friend connections leak numbers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Public records:</strong> Voter registration, property records, court filings</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Marketing lists:</strong> Sold between companies and data brokers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Mobile apps:</strong> Apps you install harvest your contact list</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Protection Strategies
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">1. Use Virtual Phone Numbers</h3>
                      <p className="mb-3">
                        Virtual numbers act as a shield for your real number. Recommended services:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Google Voice (Free):</strong> Free US number with call forwarding and SMS</li>
                        <li>• <strong>Hushed ($5/month):</strong> Multiple numbers, burn after use</li>
                        <li>• <strong>MySudo ($1-15/month):</strong> Complete digital identity separation</li>
                        <li>• <strong>Burner ($5/month):</strong> Disposable numbers for temporary use</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">2. Enable Call Blocking</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>iPhone:</strong> Settings → Phone → Silence Unknown Callers</li>
                        <li>• <strong>Android:</strong> Phone app → Settings → Blocked numbers</li>
                        <li>• <strong>Carrier services:</strong> AT&T Call Protect, T-Mobile Scam Shield, Verizon Call Filter</li>
                        <li>• <strong>Third-party apps:</strong> Truecaller, RoboKiller, Nomorobo</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">3. Register on Do Not Call Lists</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>US:</strong> Register at donotcall.gov (FTC National Do Not Call Registry)</li>
                        <li>• <strong>Canada:</strong> lnnte-dncl.gc.ca</li>
                        <li>• <strong>UK:</strong> tpsonline.org.uk</li>
                        <li>• Note: Only stops legal telemarketers, not scammers</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">4. Remove from Data Broker Sites</h3>
                      <p className="mb-3">
                        Major people-search sites to opt out from:
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• Whitepages.com → Privacy → Remove yourself</li>
                        <li>• Spokeo.com → Search your name → Opt out</li>
                        <li>• BeenVerified.com → Opt out form</li>
                        <li>• TruthFinder.com → Opt out request</li>
                        <li>• Consider automated services like DeleteMe or OneRep</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Two-Number Strategy">
                Use one number for trusted contacts (family, important accounts) and a virtual number for everything else (online shopping, apps, signups). This compartmentalization limits exposure.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Protect Against SIM Swapping</h2>
                <p className="mb-4">
                  SIM swapping is when attackers convince your carrier to transfer your number to their device. Prevention:
                </p>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Carrier PIN:</strong> Set up a unique PIN with your carrier for account changes</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Port freeze:</strong> Request a port freeze to prevent number transfers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Authentication apps:</strong> Use authenticator apps instead of SMS 2FA when possible</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Monitor account:</strong> Enable alerts for all account changes</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                Your phone number is more than contact info—it's a key to your digital identity. Treat it like a password and guard it accordingly.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Best Practices for Phone Privacy</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Never Share Your Number Publicly</h3>
                      <p className="text-muted-foreground">
                        Avoid posting your number on social media, forums, or public websites. Once it's online, it's permanent.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Use Email for Account Recovery</h3>
                      <p className="text-muted-foreground">
                        When possible, set email as your primary recovery method instead of SMS.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Screen Unknown Calls</h3>
                      <p className="text-muted-foreground">
                        Let unknown numbers go to voicemail. Legitimate callers will leave messages.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Review App Permissions</h3>
                      <p className="text-muted-foreground">
                        Regularly audit which apps have access to your contacts and phone functions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="Text Message Scams">
                SMS phishing (smishing) is rising. Never click links in unexpected texts, even if they appear to be from banks or government agencies. Always verify by contacting the organization directly.
              </BlogCallout>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Check Your Phone Number Exposure</h2>
                <p className="text-lg mb-6">
                  FootprintIQ scans data broker sites to see where your phone number appears online.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Scan Your Number</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/remove-data-brokers" className="text-primary hover:underline">
                          Remove Data from Data Brokers
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Step-by-step guide to removing your information
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/identity-theft-response" className="text-primary hover:underline">
                          Identity Theft Response Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        What to do if your information is compromised
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
