import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Globe, Shield, MapPin, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StructuredData } from "@/components/StructuredData";
import { BlogPullQuote } from "@/components/blog/BlogPullQuote";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { getBlogHeroImage } from "@/lib/blogImages";

export default function IpAddressSecurity() {
  const heroImage = getBlogHeroImage("ip-address-security");

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      { "@type": "ListItem" as const, position: 1, name: "Home", item: "https://footprintiq.app" },
      { "@type": "ListItem" as const, position: 2, name: "Blog", item: "https://footprintiq.app/blog" },
      { "@type": "ListItem" as const, position: 3, name: "IP Address Security" }
    ]
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "IP Address Security: Complete Privacy & Protection Guide 2024",
    description: "Comprehensive guide to protecting your IP address, understanding privacy risks, and using VPNs effectively for online security.",
    author: { "@type": "Organization", name: "FootprintIQ" },
    publisher: { "@type": "Organization", name: "FootprintIQ", logo: { "@type": "ImageObject", url: "https://footprintiq.app/logo-social.png" } },
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    image: heroImage
  };

  return (
    <>
      <Helmet>
        <title>IP Address Security Guide 2024 | VPN Privacy Protection</title>
        <meta name="description" content="Learn how to protect your IP address from tracking and cyberattacks. Complete guide to VPNs, proxies, and IP privacy best practices." />
        <link rel="canonical" href="https://footprintiq.app/blog/ip-address-security" />
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
                  alt="IP address security and privacy protection"
                  className="w-full h-[400px] object-cover"
                  loading="eager"
                />
              </div>
            )}

            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent leading-tight">
                IP Address Security: Complete Privacy & Protection Guide 2024
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <time dateTime="2024-01-15">January 15, 2024</time>
                <span>•</span>
                <span>13 min read</span>
              </div>
            </header>

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Your IP address reveals your location, ISP, and browsing behavior. This comprehensive guide shows you how to protect your IP and maintain online privacy.
              </p>

              <BlogCallout type="info" title="What is an IP Address?">
                An IP address is a unique numerical identifier assigned to every device connected to the internet. Think of it as your device's home address online—websites and services use it to send data back to you.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  Privacy Risks of Exposed IP Addresses
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Location Tracking
                      </h3>
                      <p className="text-muted-foreground">
                        Your IP reveals city, region, and ISP—enough to narrow down your physical location.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        Activity Monitoring
                      </h3>
                      <p className="text-muted-foreground">
                        Websites, ISPs, and governments can track your browsing history via IP logs.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        DDoS Attacks
                      </h3>
                      <p className="text-muted-foreground">
                        Exposed IPs can be targeted with Distributed Denial of Service attacks.
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Geo-Blocking
                      </h3>
                      <p className="text-muted-foreground">
                        Content restrictions and price discrimination based on your location.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogPullQuote author="Privacy Rights Research">
                Every website you visit, every email you send, and every online service you use logs your IP address. Over 90% of websites track visitor IPs for analytics and advertising.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">What Information Does Your IP Reveal?</h2>
                <Card className="border-2 border-primary/20 mb-6">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Approximate Location:</strong> City, region, postal code (within ~10 miles)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Internet Service Provider (ISP):</strong> Your network provider</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Time Zone:</strong> Your local time for targeted attacks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Organization/Employer:</strong> Corporate networks reveal workplace</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Connection Type:</strong> Mobile, residential, or datacenter</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                <BlogCallout type="tip" title="Check Your IP Exposure">
                  Visit WhatIsMyIPAddress.com or IPLeak.net to see exactly what information your current IP reveals about you. You might be surprised.
                </BlogCallout>
              </section>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  Protection Methods: VPNs, Proxies & Tor
                </h2>
                
                <div className="space-y-8">
                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Virtual Private Networks (VPNs)</h3>
                      <p className="mb-3">
                        VPNs encrypt your connection and route traffic through secure servers, masking your real IP.
                      </p>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">✅ Pros:</h4>
                        <ul className="space-y-1 ml-4 mb-3">
                          <li>• Complete traffic encryption</li>
                          <li>• Fast speeds (premium services)</li>
                          <li>• Easy to use with apps</li>
                          <li>• Protects all device traffic</li>
                        </ul>
                        <h4 className="font-semibold mb-2">❌ Cons:</h4>
                        <ul className="space-y-1 ml-4">
                          <li>• Costs $3-12/month</li>
                          <li>• Requires trust in VPN provider</li>
                          <li>• Some sites block VPN IPs</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Recommended VPN Services</h3>
                      <ul className="space-y-3">
                        <li>
                          <strong>Mullvad VPN:</strong> Privacy-focused, no logs, accepts cash, €5/month
                        </li>
                        <li>
                          <strong>ProtonVPN:</strong> Swiss privacy laws, free tier available, open-source
                        </li>
                        <li>
                          <strong>IVPN:</strong> Independently audited, no logs, WireGuard support
                        </li>
                        <li>
                          <strong>Avoid:</strong> Free VPNs (often sell your data) and VPNs in 5/9/14 Eyes countries
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Proxy Servers</h3>
                      <p className="mb-3">
                        Proxies act as intermediaries, forwarding your requests with a different IP.
                      </p>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">✅ Pros:</h4>
                        <ul className="space-y-1 ml-4 mb-3">
                          <li>• Often free or very cheap</li>
                          <li>• Can be faster than VPNs</li>
                          <li>• No client software needed</li>
                        </ul>
                        <h4 className="font-semibold mb-2">❌ Cons:</h4>
                        <ul className="space-y-1 ml-4">
                          <li>• Usually no encryption</li>
                          <li>• Only works for specific apps</li>
                          <li>• Less reliable connections</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
                    <CardContent className="pt-6">
                      <h3 className="text-2xl font-semibold mb-4">Tor Network</h3>
                      <p className="mb-3">
                        Tor routes your traffic through multiple encrypted nodes, providing maximum anonymity.
                      </p>
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">✅ Pros:</h4>
                        <ul className="space-y-1 ml-4 mb-3">
                          <li>• Free and open-source</li>
                          <li>• Maximum anonymity</li>
                          <li>• Access to .onion sites</li>
                        </ul>
                        <h4 className="font-semibold mb-2">❌ Cons:</h4>
                        <ul className="space-y-1 ml-4">
                          <li>• Very slow speeds</li>
                          <li>• Exit nodes can be compromised</li>
                          <li>• Many sites block Tor traffic</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="VPN Myths Debunked">
                VPNs don't make you "anonymous"—they shift trust from your ISP to the VPN provider. Choose providers with proven no-logs policies and independent audits.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Additional IP Protection Strategies</h2>
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Use HTTPS Everywhere:</strong> Encrypt traffic even without VPN (browser extension)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Disable WebRTC:</strong> Prevents IP leaks in browsers (test at browserleaks.com)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Use DNS-over-HTTPS:</strong> Encrypt DNS queries to prevent ISP snooping</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Avoid Public WiFi:</strong> Or always use VPN on untrusted networks</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Regularly Change IP:</strong> Restart router or use dynamic IP from ISP</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <BlogPullQuote>
                Your IP address is the starting point for most online tracking. Protecting it is the first step in comprehensive digital privacy.
              </BlogPullQuote>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">How to Choose a VPN</h2>
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">1. Jurisdiction & Privacy Laws</h3>
                      <p className="text-muted-foreground">
                        Choose VPNs based in privacy-friendly countries (Switzerland, Iceland, Panama) outside 5/9/14 Eyes intelligence alliances.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">2. No-Logs Policy</h3>
                      <p className="text-muted-foreground">
                        Verify the provider doesn't log connection data. Look for independent audits by firms like Cure53.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">3. Security Features</h3>
                      <p className="text-muted-foreground">
                        WireGuard or OpenVPN protocols, kill switch, DNS leak protection, multi-hop routing.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">4. Payment Options</h3>
                      <p className="text-muted-foreground">
                        Best providers accept cryptocurrency or cash for anonymous payment.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">5. Speed & Server Network</h3>
                      <p className="text-muted-foreground">
                        More servers in diverse locations = better speeds and reliability. Look for 1000+ servers.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              <BlogCallout type="warning" title="IP Leak Testing">
                Always test your VPN for leaks after connecting. Visit ipleak.net or dnsleaktest.com to verify your IP, DNS, and WebRTC aren't leaking your real location.
              </BlogCallout>

              <section className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Advanced: IPv6 Considerations</h2>
                <p className="mb-4">
                  Many VPNs only protect IPv4 traffic, leaving IPv6 exposed:
                </p>
                <Card className="border-2 border-primary/20">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Check if your VPN supports IPv6 or blocks it entirely</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Test for IPv6 leaks at test-ipv6.com</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span>Disable IPv6 on your device if VPN doesn't support it</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 my-12 border-2 border-primary/20">
                <h2 className="text-2xl font-bold mb-4">Monitor Your IP Exposure</h2>
                <p className="text-lg mb-6">
                  FootprintIQ checks if your IP address appears in data breaches or on tracking databases.
                </p>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Link to="/scan">Check IP Security</Link>
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
                        Understanding all aspects of your online presence
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10 hover:border-primary/30">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">
                        <Link to="/blog/osint-beginners-guide" className="text-primary hover:underline">
                          OSINT Beginner's Guide
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Learn how IP addresses are used in investigations
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
