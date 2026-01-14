import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2, FileText, Phone, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function IdentityTheftResponse() {
  const heroImage = getBlogHeroImage("identity-theft-response");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Identity Theft Response" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: "Identity Theft Response: Complete Recovery Guide 2024",
    description: "Step-by-step guide to responding to identity theft. Learn how to freeze credit, report fraud, and recover your stolen identity.",
    author: { "@type": "Organization" as const, name: "FootprintIQ" },
    publisher: { "@type": "Organization" as const, name: "FootprintIQ", logo: { "@type": "ImageObject" as const, url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <SEO
        title="Identity Theft Response Guide 2024 | Recovery Steps & Prevention"
        description="Victim of identity theft? Follow this complete recovery guide with immediate actions, credit freezes, fraud reports, and long-term protection strategies."
        canonical="https://footprintiq.app/blog/identity-theft-response"
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
                  alt="Identity theft response and recovery illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Identity Theft Response: Complete Recovery Guide 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>14 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Discovering you're a victim of identity theft is alarming. This comprehensive guide walks you through immediate actions, reporting procedures, and long-term recovery steps.
              </p>

              <BlogCallout type="warning" title="Act Fast">
                Time is critical in identity theft cases. Every hour counts in limiting damage. Follow these steps immediately, even if you're only suspicious of fraud.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Signs of Identity Theft
                </h2>
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Unexpected charges or withdrawals from your accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Credit card bills for accounts you didn't open</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Denied credit despite good credit history</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Collection calls for debts you don't recognize</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Medical bills for services you didn't receive</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Tax return rejected (someone filed using your SSN)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>Missing mail or unexpected address changes</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote author="FTC Consumer Sentinel">
                In 2023, Americans lost $10 billion to identity theft and fraud. The average victim spends 200 hours and $1,400 recovering their identity. Early action dramatically reduces both.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Immediate Actions (First 24 Hours)
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 1: Place Fraud Alerts (15 minutes)</h3>
                      <p className="mb-3">
                        Contact ONE of the three credit bureaus to place a fraud alert. They're required to notify the other two.
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Equifax:</strong> 1-800-525-6285 or equifax.com/personal/credit-report-services</li>
                        <li>• <strong>Experian:</strong> 1-888-397-3742 or experian.com/fraud</li>
                        <li>• <strong>TransUnion:</strong> 1-800-680-7289 or transunion.com/fraud</li>
                        <li>• Fraud alert lasts 1 year (free) and makes creditors verify your identity</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 2: Get Credit Reports (30 minutes)</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Visit AnnualCreditReport.com (official free site)</li>
                        <li>• Request reports from all three bureaus</li>
                        <li>• Review every account, inquiry, and personal information</li>
                        <li>• Document suspicious items with screenshots</li>
                        <li>• Look for accounts you didn't open and inquiries you didn't authorize</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 3: File FTC Report (20 minutes)</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Go to IdentityTheft.gov (official FTC site)</li>
                        <li>• Create detailed report of what happened</li>
                        <li>• Print your Identity Theft Report—you'll need this for creditors</li>
                        <li>• This creates an official record with the federal government</li>
                        <li>• Provides recovery plan tailored to your situation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Step 4: Contact Affected Institutions (1-2 hours)</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Call fraud departments of banks, credit cards with fraudulent activity</li>
                        <li>• Request account closures and new account numbers</li>
                        <li>• Dispute unauthorized charges in writing (keep copies)</li>
                        <li>• Ask about provisional credit while investigating</li>
                        <li>• Request written confirmation of fraud claim</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="tip" title="Documentation is Critical">
                Keep detailed records of every call, email, and letter. Note dates, times, names of representatives, and what was discussed. This documentation is essential for disputes and legal action.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  Week 1: Credit Freezes & Security
                </h2>
                
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Freeze Your Credit</h3>
                      <p className="mb-3">
                        Credit freezes are FREE and prevent new accounts from being opened in your name.
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Equifax:</strong> equifax.com/personal/credit-report-services/credit-freeze</li>
                        <li>• <strong>Experian:</strong> experian.com/freeze</li>
                        <li>• <strong>TransUnion:</strong> transunion.com/credit-freeze</li>
                        <li>• Also freeze: Innovis (innovis.com) and ChexSystems (chexsystems.com)</li>
                        <li>• Save your PIN/password—you'll need it to temporarily lift freezes</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Change All Passwords & Enable 2FA</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Change passwords for all financial accounts</li>
                        <li>• Enable two-factor authentication everywhere possible</li>
                        <li>• Use a password manager (Bitwarden, 1Password)</li>
                        <li>• Create unique, strong passwords for each account</li>
                        <li>• Consider hardware security keys for critical accounts</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">File Police Report</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• Visit local police department with FTC Identity Theft Report</li>
                        <li>• Request copy of police report—some creditors require it</li>
                        <li>• Bring government ID, proof of address, and documentation of theft</li>
                        <li>• Some jurisdictions allow online filing</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                A credit freeze doesn't affect your credit score or prevent you from accessing your own credit. It simply stops new accounts from being opened until you lift the freeze.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  Weeks 2-4: Dispute Fraudulent Items
                </h2>
                
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Disputing with Credit Bureaus</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Send dispute letters via certified mail with return receipt</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Include copies (not originals) of supporting documents</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Bureaus have 30 days to investigate and respond</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Follow up if they don't remove fraudulent items</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Request "extended fraud alert" (7 years, free)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Disputing with Creditors</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Contact fraud departments of companies with fraudulent accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Demand written confirmation that accounts are closed</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Request they notify credit bureaus to remove items</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Zero out balances—you're not liable for fraud</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Special Cases</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        Tax Identity Theft
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Someone filed a tax return using your SSN.
                      </p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• File Form 14039 (Identity Theft Affidavit) with IRS</li>
                        <li>• Call IRS Identity Protection Specialized Unit: 1-800-908-4490</li>
                        <li>• Request IP PIN for future tax filings</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Medical Identity Theft
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Someone used your information for medical services.
                      </p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Request medical records from all providers</li>
                        <li>• Dispute incorrect information in writing</li>
                        <li>• Contact your health insurance company</li>
                        <li>• File complaint with HHS Office for Civil Rights</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Criminal Identity Theft
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Someone committed crimes using your identity.
                      </p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• Contact arresting agency and court where charges filed</li>
                        <li>• Request court clearance or certificate of innocence</li>
                        <li>• File complaint with FBI's Internet Crime Complaint Center</li>
                        <li>• Consider hiring attorney for serious cases</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="Child Identity Theft">
                Children are attractive targets because theft often goes undetected for years. Check your child's credit report if you suspect fraud. Freeze their credit at all bureaus until they're adults.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Long-Term Recovery & Prevention</h2>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Monitor credit monthly:</strong> Use free monitoring from Credit Karma, Experian, or your credit card</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Review statements:</strong> Check all financial accounts weekly for suspicious activity</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Keep freezes active:</strong> Only lift temporarily when applying for credit</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Secure mail:</strong> Use informed delivery and consider PO box</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Shred documents:</strong> Cross-cut shredder for anything with personal info</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Annual audits:</strong> Check credit reports annually for new issues</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                Recovery from identity theft takes time—often 100-200 hours over 6-12 months. Stay persistent, document everything, and don't give up.
              </BlogPullQuote>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Prevent Future Identity Theft</h2>
                <p className="text-lg mb-6">
                  FootprintIQ monitors your personal information exposure and alerts you to potential risks before they become theft.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Protect Your Identity</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/remove-data-brokers" className="text-primary hover:underline">
                          Remove Data from Brokers
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Reduce your exposure to prevent identity theft
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/check-email-breach" className="text-primary hover:underline">
                          Check for Email Breaches
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        See if your data was exposed in breaches
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
