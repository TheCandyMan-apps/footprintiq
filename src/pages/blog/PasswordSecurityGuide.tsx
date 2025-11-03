import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Lock, Key, Shield, AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { StructuredData } from "@/components/StructuredData";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function PasswordSecurityGuide() {
  const heroImage = getBlogHeroImage("password-security-guide");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Password Security Guide" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Password Security: Complete Protection Guide for 2024",
    description: "Master password security with best practices, password managers, and multi-factor authentication strategies to protect your accounts.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <Helmet>
        <title>Password Security Guide 2024 | Best Practices & Password Managers</title>
        <meta name="description" content="Complete guide to password security. Learn how to create strong passwords, use password managers, and implement multi-factor authentication." />
        <link rel="canonical" href="https://footprintiq.app/blog/password-security-guide" />
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
                  alt="Password security best practices illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Password Security: Complete Protection Guide for 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>12 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Passwords are your first line of defense against cyber threats. This comprehensive guide shows you how to create unbreakable passwords and manage them effectively.
              </p>

              <BlogCallout type="warning" title="Password Crisis">
                81% of data breaches involve weak or stolen passwords. The average person has 100+ online accounts but uses only 5-7 different passwords, making them vulnerable to credential stuffing attacks.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Why Password Security Matters
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Key className="h-5 w-5 text-primary" />
                        Credential Stuffing
                      </h3>
                      <p className="text-muted-foreground">
                        Attackers use leaked passwords to access your other accounts where you reused credentials.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Brute Force Attacks
                      </h3>
                      <p className="text-muted-foreground">
                        Simple passwords can be cracked in seconds using automated tools.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Phishing Attacks
                      </h3>
                      <p className="text-muted-foreground">
                        Fake websites steal passwords from unsuspecting users every day.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Account Takeover
                      </h3>
                      <p className="text-muted-foreground">
                        Compromised accounts lead to identity theft, financial loss, and reputation damage.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="Verizon Data Breach Report">
                Password-related attacks account for over 80% of all hacking-related breaches. Using strong, unique passwords for every account is the single most effective security measure.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Common Password Mistakes</h2>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Using Common Passwords
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        "123456", "password", "qwerty" are cracked instantly. Even "Password123!" is weak.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Use randomly generated passwords with 16+ characters.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Reusing Passwords
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        One breach exposes all accounts with the same password.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Every account gets a unique password stored in a password manager.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Personal Information in Passwords
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Names, birthdays, pet names are easily guessed from social media.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Use random combinations unrelated to your life.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-700 dark:text-amber-400">
                        ❌ Writing Passwords Down
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Sticky notes, notebooks, and unencrypted files are insecure.
                      </p>
                      <p className="text-sm">
                        <strong>Better:</strong> Use an encrypted password manager.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Creating Strong Passwords
                </h2>
                
                <Card className="border-2 border-primary/20 mb-6 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Password Strength Requirements</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Length:</strong> Minimum 16 characters (longer is exponentially better)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Complexity:</strong> Mix uppercase, lowercase, numbers, and symbols</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Uniqueness:</strong> Never reuse passwords across accounts</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Randomness:</strong> Avoid patterns, dictionary words, or personal info</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Memorability:</strong> Use passphrases or password manager for storage</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <BlogCallout type="tip" title="Passphrase Method">
                  For passwords you need to remember (like your password manager master password), use a passphrase: "Correct-Horse-Battery-Staple-9742" is both strong and memorable. 5+ random words = excellent security.
                </BlogCallout>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Lock className="h-8 w-8 text-primary" />
                  Best Password Managers
                </h2>
                
                <div className="space-y-6">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">1. Bitwarden (Recommended)</h3>
                      <p className="mb-3">
                        Open-source, independently audited, and highly secure.
                      </p>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Price:</strong> Free tier, Premium $10/year</li>
                        <li>• <strong>Features:</strong> Unlimited passwords, cross-platform, 2FA support</li>
                        <li>• <strong>Security:</strong> Zero-knowledge encryption, open-source code</li>
                        <li>• <strong>Best for:</strong> Privacy-conscious users, families, teams</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">2. 1Password</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Price:</strong> $36/year individual, $60/year family</li>
                        <li>• <strong>Features:</strong> Travel mode, Watchtower alerts, secure sharing</li>
                        <li>• <strong>Security:</strong> Secret Key adds extra layer beyond master password</li>
                        <li>• <strong>Best for:</strong> Premium experience, business teams</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">3. KeePassXC</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Price:</strong> Free and open-source</li>
                        <li>• <strong>Features:</strong> Local database, complete control, no cloud sync</li>
                        <li>• <strong>Security:</strong> Offline storage, encrypted database</li>
                        <li>• <strong>Best for:</strong> Advanced users, maximum privacy</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">4. Proton Pass</h3>
                      <ul className="space-y-2 ml-4">
                        <li>• <strong>Price:</strong> Free tier, Plus $48/year</li>
                        <li>• <strong>Features:</strong> Email aliasing, Swiss privacy laws</li>
                        <li>• <strong>Security:</strong> End-to-end encryption, Proton ecosystem</li>
                        <li>• <strong>Best for:</strong> ProtonMail users, EU privacy protection</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <BlogCallout type="warning" title="Avoid These">
                  Don't use browser-saved passwords (less secure), LastPass (multiple breaches), or any free password manager that isn't open-source and audited.
                </BlogCallout>
              </section>

              <BlogPullQuote>
                A password manager is not optional—it's essential. Trying to remember unique passwords for 100+ accounts is impossible. Let encryption do the work for you.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Multi-Factor Authentication (MFA)</h2>
                <p className="mb-4">
                  MFA adds a second verification step beyond your password, making accounts 99.9% more secure:
                </p>
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">MFA Method Ranking (Best to Worst)</h3>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-0.5">1.</span>
                        <div>
                          <strong>Hardware Security Keys (Best)</strong>
                          <p className="text-sm text-muted-foreground">YubiKey, Titan Key - Physical keys immune to phishing</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-0.5">2.</span>
                        <div>
                          <strong>Authenticator Apps (Great)</strong>
                          <p className="text-sm text-muted-foreground">Authy, Google Authenticator, Microsoft Authenticator - Time-based codes</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-0.5">3.</span>
                        <div>
                          <strong>Push Notifications (Good)</strong>
                          <p className="text-sm text-muted-foreground">Duo, Okta - Approve login attempts on your phone</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold mt-0.5">4.</span>
                        <div>
                          <strong>SMS Codes (Better than nothing)</strong>
                          <p className="text-sm text-muted-foreground">Text message codes - Vulnerable to SIM swapping but better than no MFA</p>
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Password Manager Setup Guide</h2>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 1:</strong> Choose and install a password manager (Bitwarden recommended)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 2:</strong> Create a strong master password using passphrase method</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 3:</strong> Enable MFA on your password manager account</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 4:</strong> Import existing passwords or add manually</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 5:</strong> Run security audit to find weak/reused passwords</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 6:</strong> Change weak passwords to strong, unique ones</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Step 7:</strong> Install browser extensions and mobile apps</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogCallout type="tip" title="Emergency Access">
                Set up emergency access in your password manager so trusted family members can access your accounts if something happens to you. Both Bitwarden and 1Password support this.
              </BlogCallout>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Check Your Password Security</h2>
                <p className="text-lg mb-6">
                  FootprintIQ scans breach databases to see if your passwords have been exposed in data leaks.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Check Password Exposure</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/check-email-breach" className="text-primary hover:underline">
                          Check for Email Breaches
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        See if your credentials were exposed
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/identity-theft-response" className="text-primary hover:underline">
                          Identity Theft Response
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        What to do if accounts are compromised
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
