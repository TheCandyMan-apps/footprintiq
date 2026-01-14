import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Smartphone, Key, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function TwoFactorAuthentication() {
  const heroImage = getBlogHeroImage("two-factor-authentication");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Two-Factor Authentication Guide" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: "Two-Factor Authentication (2FA): Complete Setup Guide 2024",
    description: "Learn how to set up and use two-factor authentication to protect your accounts. Compare authenticator apps, hardware keys, and SMS codes.",
    author: { "@type": "Organization" as const, name: "FootprintIQ" },
    publisher: { "@type": "Organization" as const, name: "FootprintIQ", logo: { "@type": "ImageObject" as const, url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <SEO
        title="Two-Factor Authentication Guide 2024 | 2FA Setup & Best Practices"
        description="Complete guide to two-factor authentication (2FA). Learn how to set up authenticator apps, hardware security keys, and protect your accounts."
        canonical="https://footprintiq.app/blog/two-factor-authentication"
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
                  alt="Two-factor authentication security illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Two-Factor Authentication: Complete Setup Guide 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>10 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Two-factor authentication (2FA) is the single most effective way to protect your online accounts. This guide shows you how to set it up everywhere and choose the best methods.
              </p>

              <BlogCallout type="success" title="Proven Protection">
                Microsoft research shows that 2FA blocks 99.9% of automated account attacks. Even basic SMS codes are significantly better than passwords alone.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  What is Two-Factor Authentication?
                </h2>
                <p className="mb-4">
                  2FA requires two separate forms of verification to access your account:
                </p>
                <Card className="border-2 border-primary/20 mb-6 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Something you know:</strong> Your password</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Something you have:</strong> Your phone, security key, or authenticator app</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Something you are:</strong> Biometrics like fingerprint or face (less common)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <p>
                  Even if someone steals your password, they can't access your account without the second factor.
                </p>
              </section>

              <BlogPullQuote author="Google Security Team">
                Of the 1.7 billion credentials stolen in 2023, only 0.1% resulted in successful account breaches—almost all victims had 2FA disabled.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">2FA Methods Ranked</h2>
                
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Key className="h-6 w-6 text-green-500" />
                        1. Hardware Security Keys (Best)
                      </h3>
                      <p className="mb-3">
                        Physical devices that plug into USB, NFC, or Bluetooth. Immune to phishing.
                      </p>
                      <div className="space-y-2">
                        <p><strong>Recommended Products:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• <strong>YubiKey 5 Series:</strong> $45-70, USB-A/C, NFC support</li>
                          <li>• <strong>Google Titan Security Key:</strong> $30, USB-C + NFC</li>
                          <li>• <strong>Nitrokey:</strong> $30-60, open-source firmware</li>
                        </ul>
                        <p className="mt-3"><strong>✅ Pros:</strong> Phishing-proof, no phone required, works offline</p>
                        <p><strong>❌ Cons:</strong> Cost, can be lost, not universally supported</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Smartphone className="h-6 w-6 text-blue-500" />
                        2. Authenticator Apps (Great)
                      </h3>
                      <p className="mb-3">
                        Apps generate time-based codes (TOTP) that change every 30 seconds.
                      </p>
                      <div className="space-y-2">
                        <p><strong>Recommended Apps:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• <strong>Aegis (Android):</strong> Open-source, encrypted, no cloud</li>
                          <li>• <strong>Raivo OTP (iOS):</strong> Open-source, iCloud backup</li>
                          <li>• <strong>Authy:</strong> Cross-platform, cloud backup (encrypted)</li>
                          <li>• <strong>2FAS:</strong> Free, open-source, browser extension</li>
                        </ul>
                        <p className="mt-3"><strong>✅ Pros:</strong> Free, works offline, widely supported</p>
                        <p><strong>❌ Cons:</strong> Vulnerable to phone theft, backup complexity</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Lock className="h-6 w-6 text-amber-500" />
                        3. Push Notifications (Good)
                      </h3>
                      <p className="mb-3">
                        Approve login attempts with a tap on your phone.
                      </p>
                      <div className="space-y-2">
                        <p><strong>Common Services:</strong> Duo, Microsoft Authenticator, Okta</p>
                        <p className="mt-3"><strong>✅ Pros:</strong> Convenient, fast, user-friendly</p>
                        <p><strong>❌ Cons:</strong> Requires internet, push fatigue attacks possible</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <Smartphone className="h-6 w-6 text-orange-500" />
                        4. SMS Codes (Better than nothing)
                      </h3>
                      <p className="mb-3">
                        Text message with 6-digit code.
                      </p>
                      <div className="space-y-2">
                        <p className="mt-3"><strong>✅ Pros:</strong> No app needed, universal support</p>
                        <p><strong>❌ Cons:</strong> SIM swapping, SMS interception, requires cell signal</p>
                        <p className="text-amber-600 dark:text-amber-400"><strong>⚠️ Use only if no other option available</strong></p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <BlogCallout type="warning" title="Avoid SMS When Possible">
                  SMS 2FA is vulnerable to SIM swapping attacks where criminals convince your carrier to transfer your number to their device. Use authenticator apps or hardware keys instead.
                </BlogCallout>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">How to Set Up Authenticator Apps</h2>
                
                <Card className="border-2 border-primary/20 mb-6 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">1.</span>
                        <div>
                          <strong>Download Authenticator App</strong>
                          <p className="text-sm text-muted-foreground">Install Aegis (Android) or Raivo (iOS)</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">2.</span>
                        <div>
                          <strong>Go to Account Security Settings</strong>
                          <p className="text-sm text-muted-foreground">Find "Two-Factor Authentication" or "Security" in your account</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">3.</span>
                        <div>
                          <strong>Choose "Authenticator App" Method</strong>
                          <p className="text-sm text-muted-foreground">Select app-based 2FA, not SMS</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">4.</span>
                        <div>
                          <strong>Scan QR Code</strong>
                          <p className="text-sm text-muted-foreground">Open authenticator app and scan the QR code shown</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">5.</span>
                        <div>
                          <strong>Enter Verification Code</strong>
                          <p className="text-sm text-muted-foreground">Type the 6-digit code from your app to confirm setup</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">6.</span>
                        <div>
                          <strong>Save Backup Codes</strong>
                          <p className="text-sm text-muted-foreground">Download and securely store recovery codes</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>

                <BlogCallout type="tip" title="Backup Your 2FA">
                  Always save backup codes in your password manager. If you lose your phone, these codes are your only way to regain access. Some apps like Authy offer encrypted cloud backups.
                </BlogCallout>
              </section>

              <BlogPullQuote>
                Set up 2FA on your email first—it's the gateway to all your other accounts. If your email is compromised, attackers can reset passwords everywhere.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Priority Accounts for 2FA</h2>
                <p className="mb-4">
                  Enable 2FA on these accounts immediately:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-primary">Critical (Enable First)</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Primary email (Gmail, Outlook, etc.)</li>
                        <li>• Password manager</li>
                        <li>• Banking & financial accounts</li>
                        <li>• Investment platforms</li>
                        <li>• Cryptocurrency exchanges</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-primary">High Priority</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Cloud storage (Dropbox, Google Drive)</li>
                        <li>• Social media (Facebook, Twitter, Instagram)</li>
                        <li>• Apple ID / Google Account</li>
                        <li>• Work accounts (Slack, Microsoft 365)</li>
                        <li>• Payment services (PayPal, Venmo)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-primary">Important</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• E-commerce (Amazon, eBay)</li>
                        <li>• Healthcare portals</li>
                        <li>• Government services</li>
                        <li>• Domain registrars</li>
                        <li>• VPN accounts</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-primary">Consider</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Gaming accounts (Steam, Xbox)</li>
                        <li>• Streaming services</li>
                        <li>• Forums & communities</li>
                        <li>• Newsletter subscriptions</li>
                        <li>• Any account with personal data</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Common 2FA Mistakes</h2>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Not Saving Backup Codes</h3>
                      <p className="text-muted-foreground">
                        Losing your phone without backup codes means permanent account lockout. Save codes in password manager or print them.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Using Same Phone for Everything</h3>
                      <p className="text-muted-foreground">
                        If your phone is your 2FA device AND recovery method, losing it locks you out. Use hardware key as backup.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Approving Unknown Push Notifications</h3>
                      <p className="text-muted-foreground">
                        "Push fatigue" attacks send repeated notifications until you approve. Only approve logins you initiated.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Protect Your Accounts Today</h2>
                <p className="text-lg mb-6">
                  FootprintIQ identifies which of your accounts have been breached and need immediate 2FA protection.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Check Account Security</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/password-security-guide" className="text-primary hover:underline">
                          Password Security Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Create strong passwords and use password managers
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
                        See if your accounts have been compromised
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
