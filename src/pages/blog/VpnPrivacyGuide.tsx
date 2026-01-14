import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Globe, Lock, CheckCircle2, AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function VpnPrivacyGuide() {
  const heroImage = getBlogHeroImage("vpn-privacy-guide");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "VPN Privacy Guide" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Article" as const,
    headline: "VPN Guide 2024: Complete Privacy & Security Explained",
    description: "Everything you need to know about VPNs. Learn how VPNs work, which one to choose, and how to use them for maximum privacy protection.",
    author: { "@type": "Organization" as const, name: "FootprintIQ" },
    publisher: { "@type": "Organization" as const, name: "FootprintIQ", logo: { "@type": "ImageObject" as const, url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <SEO
        title="VPN Guide 2024 | Best VPN for Privacy & Security Explained"
        description="Complete VPN guide for 2024. Learn how VPNs work, compare top providers, and choose the best VPN for privacy, security, and streaming."
        canonical="https://footprintiq.app/blog/vpn-privacy-guide"
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
                  alt="VPN privacy and security guide illustration"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                VPN Guide 2024: Complete Privacy & Security Explained
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>16 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Virtual Private Networks (VPNs) are essential for online privacy. This comprehensive guide explains how VPNs work and helps you choose the right one for your needs.
              </p>

              <BlogCallout type="info" title="What is a VPN?">
                A VPN creates an encrypted tunnel between your device and the internet, hiding your IP address and protecting your data from ISPs, hackers, and surveillance. Think of it as a secure, private highway for your internet traffic.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Why You Need a VPN
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Privacy Protection
                      </h3>
                      <p className="text-muted-foreground">
                        Hide your browsing activity from ISPs, governments, and advertisers tracking your online behavior.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Location Masking
                      </h3>
                      <p className="text-muted-foreground">
                        Bypass geo-restrictions, access blocked content, and prevent location-based price discrimination.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Public WiFi Security
                      </h3>
                      <p className="text-muted-foreground">
                        Protect your data from attackers on unsecured public networks at cafes, airports, and hotels.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        ISP Throttling Prevention
                      </h3>
                      <p className="text-muted-foreground">
                        Stop internet providers from slowing down your connection based on your activity.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="Privacy Research Study">
                71% of VPN users cite privacy as their primary reason for use, while 55% use VPNs for secure access to work networks. VPN adoption has grown 165% since 2020.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">How VPNs Work</h2>
                <Card className="border-2 border-primary/20 mb-6 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">1.</span>
                        <div>
                          <strong>Connection Initiated:</strong> Your device connects to a VPN server
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">2.</span>
                        <div>
                          <strong>Encryption Applied:</strong> All data is encrypted using protocols like WireGuard or OpenVPN
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">3.</span>
                        <div>
                          <strong>IP Masking:</strong> Your real IP address is replaced with the VPN server's IP
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">4.</span>
                        <div>
                          <strong>Secure Tunnel:</strong> Traffic passes through encrypted tunnel to VPN server
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">5.</span>
                        <div>
                          <strong>Internet Access:</strong> VPN server forwards your requests to destination websites
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-primary font-bold text-xl">6.</span>
                        <div>
                          <strong>Return Journey:</strong> Responses travel back through the encrypted tunnel to you
                        </div>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  Best VPN Services 2024
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">1. Mullvad VPN (Best for Privacy)</h3>
                      <div className="space-y-3">
                        <p><strong>Price:</strong> €5/month (flat rate, no tiers)</p>
                        <p><strong>Jurisdiction:</strong> Sweden (privacy-friendly)</p>
                        <p><strong>Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• No email required, anonymous accounts</li>
                          <li>• Accepts cash payments by mail</li>
                          <li>• Independently audited, open-source apps</li>
                          <li>• WireGuard protocol, kill switch</li>
                          <li>• No logs, no tracking, no data collection</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Maximum privacy, anonymous payment</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">2. ProtonVPN (Best for Features)</h3>
                      <div className="space-y-3">
                        <p><strong>Price:</strong> Free tier, Plus $10/month</p>
                        <p><strong>Jurisdiction:</strong> Switzerland (outside 14 Eyes)</p>
                        <p><strong>Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Secure Core (multi-hop) routing</li>
                          <li>• Tor over VPN support</li>
                          <li>• NetShield ad/malware blocker</li>
                          <li>• 10 Gbps servers, streaming support</li>
                          <li>• Integrates with Proton ecosystem</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Free tier users, Proton subscribers</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">3. IVPN (Best for Transparency)</h3>
                      <div className="space-y-3">
                        <p><strong>Price:</strong> $6/month (Standard), $10/month (Pro)</p>
                        <p><strong>Jurisdiction:</strong> Gibraltar</p>
                        <p><strong>Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Open-source, independently audited</li>
                          <li>• Multi-hop VPN connections</li>
                          <li>• Anti-tracker, firewall included</li>
                          <li>• WireGuard and OpenVPN support</li>
                          <li>• Anonymous accounts, cash accepted</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: Security-conscious professionals</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">4. OVPN (Best for Nordic Users)</h3>
                      <div className="space-y-3">
                        <p><strong>Price:</strong> $7/month</p>
                        <p><strong>Jurisdiction:</strong> Sweden</p>
                        <p><strong>Features:</strong></p>
                        <ul className="ml-6 space-y-1">
                          <li>• Multihop routing through Sweden</li>
                          <li>• RAM-only servers</li>
                          <li>• Swedish privacy laws protection</li>
                          <li>• Threat Protection included</li>
                          <li>• Full transparency reports</li>
                        </ul>
                        <p className="text-primary font-semibold">Best for: European users, journalists</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <BlogCallout type="warning" title="VPNs to Avoid">
                  Stay away from: Free VPNs (sell your data), NordVPN/Surfshark (same ownership, multiple breaches), VPNs based in 5/9/14 Eyes countries, and any service without independent audits.
                </BlogCallout>
              </section>

              <BlogPullQuote>
                A VPN is only as trustworthy as the company running it. Choose providers with proven no-logs policies, independent audits, and transparent operations.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">VPN Protocols Explained</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-primary">WireGuard (Recommended)</h3>
                      <p className="text-muted-foreground mb-2">
                        Modern, fast, and secure. Only 4,000 lines of code (easy to audit).
                      </p>
                      <p className="text-sm">
                        ✅ Best speed, strong security, efficient battery use
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-primary">OpenVPN (Reliable)</h3>
                      <p className="text-muted-foreground mb-2">
                        Open-source standard with excellent security. Works everywhere.
                      </p>
                      <p className="text-sm">
                        ✅ Highly configurable, bypasses firewalls, proven track record
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-amber-600 dark:text-amber-400">IKEv2/IPSec (Mobile)</h3>
                      <p className="text-muted-foreground mb-2">
                        Fast reconnection, good for mobile. Less auditable than alternatives.
                      </p>
                      <p className="text-sm">
                        ⚠️ Good for phones, but prefer WireGuard when available
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">PPTP/L2TP (Avoid)</h3>
                      <p className="text-muted-foreground mb-2">
                        Outdated protocols with known vulnerabilities.
                      </p>
                      <p className="text-sm">
                        ❌ Never use these - compromised security
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Essential VPN Features</h2>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Kill Switch:</strong> Blocks internet if VPN drops to prevent IP leaks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>DNS Leak Protection:</strong> Ensures DNS requests go through VPN tunnel</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>No-Logs Policy:</strong> Verified by independent audits, not just marketing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Split Tunneling:</strong> Choose which apps use VPN vs direct connection</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Multi-Hop/Double VPN:</strong> Route through multiple servers for extra security</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Obfuscation:</strong> Disguises VPN traffic to bypass censorship</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogCallout type="tip" title="Testing Your VPN">
                Always test for leaks after connecting: Visit ipleak.net, dnsleaktest.com, and browserleaks.com to verify your IP, DNS, and WebRTC aren't leaking.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Common VPN Myths</h2>
                <div className="space-y-4">
                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Myth: VPNs Make You Anonymous</h3>
                      <p className="text-muted-foreground">
                        <strong>Reality:</strong> VPNs hide your IP but don't make you anonymous. Websites can still track you with cookies, fingerprinting, and login data. Use VPN + Tor + privacy browser for real anonymity.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Myth: Free VPNs Are Safe</h3>
                      <p className="text-muted-foreground">
                        <strong>Reality:</strong> Free VPNs often sell your data, inject ads, or contain malware. If you're not paying, you're the product.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Myth: VPNs Slow Down Your Connection</h3>
                      <p className="text-muted-foreground">
                        <strong>Reality:</strong> Modern VPNs with WireGuard have minimal impact. You might lose 10-20% speed, but gain security and bypass ISP throttling.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Check Your IP Exposure</h2>
                <p className="text-lg mb-6">
                  FootprintIQ identifies where your IP address appears online and in data leaks.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Scan Your IP</Link>
                </Button>
              </div>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/ip-address-security" className="text-primary hover:underline">
                          IP Address Security Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Protect your IP from tracking and attacks
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/secure-browsing-guide" className="text-primary hover:underline">
                          Secure Browsing Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Complete online security best practices
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
