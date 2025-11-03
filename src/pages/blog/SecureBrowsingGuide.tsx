import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Globe, Shield, Eye, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { StructuredData } from "@/components/StructuredData";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function SecureBrowsingGuide() {
  const heroImage = getBlogHeroImage("secure-browsing-guide");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "Secure Browsing Guide" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Secure Browsing Guide 2024: Privacy & Safety Best Practices",
    description: "Complete guide to secure internet browsing. Learn about privacy browsers, extensions, HTTPS, and protecting yourself from tracking and malware.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <Helmet>
        <title>Secure Browsing Guide 2024 | Privacy Browser & Safety Tips</title>
        <meta name="description" content="Master secure internet browsing with privacy-focused browsers, essential extensions, and best practices to protect against tracking, malware, and surveillance." />
        <link rel="canonical" href="https://footprintiq.app/blog/secure-browsing-guide" />
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
                  alt="Secure browsing and online privacy illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                Secure Browsing Guide 2024: Privacy & Safety Best Practices
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>14 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Your web browser knows more about you than any other software. This comprehensive guide shows you how to browse the internet securely and privately.
              </p>

              <BlogCallout type="warning" title="Browser Tracking Reality">
                The average website contains 40+ trackers. Your browsing habits, interests, and identity are constantly monitored and sold to advertisers, data brokers, and surveillance companies.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Globe className="h-8 w-8 text-primary" />
                  Best Privacy Browsers 2024
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">1. Firefox (Recommended)</h3>
                      <div className="space-y-3">
                        <p><strong>Privacy Rating:</strong> ⭐⭐⭐⭐ (4/5)</p>
                        <p><strong>Best Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Open-source, not owned by ad company</li>
                          <li>• Enhanced Tracking Protection enabled by default</li>
                          <li>• Containers isolate browsing contexts</li>
                          <li>• Strong extension ecosystem</li>
                          <li>• Regular security updates</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Daily use, good balance of privacy and compatibility</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">2. Brave (Privacy-First Chromium)</h3>
                      <div className="space-y-3">
                        <p><strong>Privacy Rating:</strong> ⭐⭐⭐⭐⭐ (5/5)</p>
                        <p><strong>Best Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Blocks ads and trackers by default</li>
                          <li>• Built-in Tor mode for anonymity</li>
                          <li>• Automatic HTTPS upgrades</li>
                          <li>• Fingerprinting protection</li>
                          <li>• Chrome extension compatible</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Maximum privacy with Chrome compatibility</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">3. Tor Browser (Maximum Anonymity)</h3>
                      <div className="space-y-3">
                        <p><strong>Privacy Rating:</strong> ⭐⭐⭐⭐⭐ (5/5)</p>
                        <p><strong>Best Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Routes through Tor network (3+ hops)</li>
                          <li>• No tracking or browsing history</li>
                          <li>• Access to .onion sites</li>
                          <li>• Resists fingerprinting</li>
                          <li>• Blocks all scripts by default</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Journalists, activists, whistleblowers</p>
                        <p className="text-sm text-muted-foreground">⚠️ Very slow speeds, many sites broken</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">4. Safari (Apple Devices Only)</h3>
                      <div className="space-y-3">
                        <p><strong>Privacy Rating:</strong> ⭐⭐⭐ (3/5)</p>
                        <p><strong>Best Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Intelligent Tracking Prevention</li>
                          <li>• Privacy Report dashboard</li>
                          <li>• Sandboxed browsing</li>
                          <li>• Good performance on Apple hardware</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Apple ecosystem users</p>
                        <p className="text-sm text-muted-foreground">Limited extension support</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <BlogCallout type="warning" title="Browsers to Avoid">
                  <strong>Google Chrome:</strong> Extensive tracking, shares data with Google. <strong>Microsoft Edge:</strong> Telemetry and Bing integration. <strong>Opera:</strong> Owned by Chinese consortium, questionable privacy.
                </BlogCallout>
              </section>

              <BlogPullQuote author="Electronic Frontier Foundation">
                Your browser is your window to the digital world, but it's also the primary tool companies use to track your every move online. Choose wisely.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Essential Browser Extensions
                </h2>
                
                <div className="space-y-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        uBlock Origin (Ad & Tracker Blocker)
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Open-source ad blocker that's efficient and powerful. Blocks ads, trackers, and malware domains.
                      </p>
                      <p className="text-sm">
                        <strong>Why it's essential:</strong> Reduces tracking by 90%, improves page load speed, saves bandwidth
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Privacy Badger (Smart Tracker Blocking)
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        From EFF, learns to block trackers as you browse. Works alongside uBlock Origin.
                      </p>
                      <p className="text-sm">
                        <strong>Why it's essential:</strong> Catches trackers that sneak past other blockers
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        HTTPS Everywhere (Encryption)
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Forces encrypted HTTPS connections when available, preventing eavesdropping.
                      </p>
                      <p className="text-sm">
                        <strong>Why it's essential:</strong> Protects data from man-in-the-middle attacks
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Decentraleyes (CDN Privacy)
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Serves common JavaScript libraries locally instead of fetching from tracking CDNs.
                      </p>
                      <p className="text-sm">
                        <strong>Why it's essential:</strong> Prevents CDN tracking, improves privacy
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        ClearURLs (URL Tracking Removal)
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Removes tracking parameters from URLs (like ?utm_source=).
                      </p>
                      <p className="text-sm">
                        <strong>Why it's essential:</strong> Stops URL-based tracking across sites
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        Bitwarden (Password Manager)
                      </h3>
                      <p className="text-muted-foreground mb-2">
                        Open-source password manager with browser integration.
                      </p>
                      <p className="text-sm">
                        <strong>Why it's essential:</strong> Secure password storage, phishing protection
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Browser Security Settings</h2>
                
                <Card className="border-2 border-primary/20 mb-6 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Firefox Security Checklist</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy → Enhanced Tracking Protection:</strong> Set to "Strict"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy → Firefox Data Collection:</strong> Disable all telemetry</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy → Website Privacy Preferences:</strong> Enable "Do Not Track"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy → Cookies:</strong> Delete on close, block third-party</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy → DNS over HTTPS:</strong> Enable with Cloudflare or NextDNS</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>about:config →</strong> Disable WebRTC (media.peerconnection.enabled = false)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary/20 mb-6 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4">Chrome/Brave Security Checklist</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy and security → Block third-party cookies</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy and security → Send "Do Not Track"</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy and security → Clear browsing data on exit</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Privacy and security → Disable "Use a prediction service"</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Sync and Google services → Disable all sync</strong> (or use Brave Sync)</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogCallout type="tip" title="Container Tabs in Firefox">
                Firefox's Multi-Account Containers let you separate work, personal, shopping, and social browsing into isolated contexts. Facebook in one container can't track you in others.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Secure Browsing Best Practices</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">✅ Do This</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Always look for HTTPS and padlock icon</li>
                        <li>• Use separate browser profiles for different activities</li>
                        <li>• Clear cookies and cache regularly</li>
                        <li>• Use search engines like DuckDuckGo or Startpage</li>
                        <li>• Enable automatic browser updates</li>
                        <li>• Verify URLs before clicking links</li>
                        <li>• Use private/incognito mode for sensitive browsing</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold mb-3">❌ Don't Do This</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Save passwords in browser (use password manager)</li>
                        <li>• Click "Remember me" on shared computers</li>
                        <li>• Ignore HTTPS warnings</li>
                        <li>• Use outdated browsers</li>
                        <li>• Install unknown extensions</li>
                        <li>• Stay logged into sensitive accounts</li>
                        <li>• Use public WiFi without VPN</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote>
                Privacy isn't about having something to hide—it's about having control over what you share. Your browsing habits reveal intimate details about your life, health, finances, and beliefs.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Advanced Privacy Techniques</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Use Compartmentalized Browsers</h3>
                      <p className="text-muted-foreground">
                        Firefox for work, Brave for personal browsing, Tor for anonymity. Prevents cross-contamination of browsing data.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Disable JavaScript Selectively</h3>
                      <p className="text-muted-foreground">
                        Use NoScript extension to block JavaScript on untrusted sites. Breaks many sites but maximizes security.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Use DNS Filtering</h3>
                      <p className="text-muted-foreground">
                        NextDNS or Pi-hole block tracking and ads at DNS level, protecting all devices on your network.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Resist Browser Fingerprinting</h3>
                      <p className="text-muted-foreground">
                        Test at coveryourtracks.eff.org. Brave and Tor Browser have best fingerprinting resistance.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Audit Your Digital Footprint</h2>
                <p className="text-lg mb-6">
                  FootprintIQ shows you what information is exposed through your browsing and online activity.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Check Your Exposure</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/vpn-privacy-guide" className="text-primary hover:underline">
                          VPN Privacy Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Add VPN layer for complete browsing privacy
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/what-is-digital-footprint" className="text-primary hover:underline">
                          What is a Digital Footprint?
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Understanding your complete online presence
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
