import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Database, Shield, Lock, Search } from "lucide-react";

const DataSources = () => {
  return (
    <>
      <SEO
        title="How We Source Data | FootprintIQ OSINT Providers"
        description="Learn about FootprintIQ's trusted OSINT sources: Have I Been Pwned, Shodan, VirusTotal, and 100+ data broker databases. Transparent data collection practices."
        canonical="https://footprintiq.app/data-sources"
      />
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
              <Database className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Trusted OSINT Sources</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How We Source Data
            </h1>
            <p className="text-xl text-muted-foreground">
              FootprintIQ aggregates information from reputable, publicly available OSINT (Open Source Intelligence) 
              sources. We never hack, breach, or access private databases.
            </p>
          </div>

          <div className="space-y-8">
            <section className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">Primary OSINT Providers</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Have I Been Pwned (HIBP)</h3>
                  <p className="text-muted-foreground mb-2">
                    Troy Hunt's trusted breach notification service. Checks if email addresses appear 
                    in known data breaches.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Data Type:</strong> Email breach history, compromised passwords, affected services
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Shodan</h3>
                  <p className="text-muted-foreground mb-2">
                    The search engine for internet-connected devices. Reveals IP exposure, open ports, 
                    and vulnerable services.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Data Type:</strong> IP addresses, open ports, banners, SSL certificates, geolocation
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">VirusTotal</h3>
                  <p className="text-muted-foreground mb-2">
                    Google-owned malware and URL analysis platform. Provides domain reputation, 
                    file analysis, and threat intelligence.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Data Type:</strong> Domain reputation, DNS records, SSL certificates, malware detections
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Username Search Platforms</h3>
                  <p className="text-muted-foreground mb-2">
                    Aggregated searches across major social media and platform APIs to find username presence.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Data Type:</strong> Twitter/X, Instagram, GitHub, Reddit, LinkedIn profile existence
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Data Broker Databases (100+)</h3>
                  <p className="text-muted-foreground mb-2">
                    Public people search sites and data aggregators that sell personal information.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Data Type:</strong> Names, addresses, phone numbers, relatives, email addresses, age
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">DNS & WHOIS Records</h3>
                  <p className="text-muted-foreground mb-2">
                    Publicly available domain registration and DNS configuration data.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Data Type:</strong> Domain ownership, nameservers, MX records, SPF/DKIM, historical DNS
                  </p>
                </div>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">Our Data Collection Principles</h2>
              </div>
              
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong className="text-foreground">Public Sources Only:</strong> We only query publicly accessible databases and APIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong className="text-foreground">No Hacking or Breaching:</strong> We never attempt unauthorized access to private systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong className="text-foreground">Transient Queries:</strong> Scan data is temporary and deleted after results are delivered</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong className="text-foreground">We Never Sell Your Data:</strong> Your search queries and results are never sold or shared</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong className="text-foreground">Encrypted Transmission:</strong> All queries are sent over HTTPS with end-to-end encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span><strong className="text-foreground">Ethical Use Only:</strong> We prohibit stalking, harassment, and illegal uses (see Responsible Use Policy)</span>
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">How Scans Work</h2>
              </div>
              
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">1</span>
                  <div>
                    <strong className="text-foreground">Input Validation:</strong> Your query (email, username, domain, phone, IP) is validated and sanitized
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">2</span>
                  <div>
                    <strong className="text-foreground">Parallel OSINT Queries:</strong> We simultaneously query relevant providers based on input type
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">3</span>
                  <div>
                    <strong className="text-foreground">Data Aggregation:</strong> Results are collected, deduplicated, and organized by risk level
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">4</span>
                  <div>
                    <strong className="text-foreground">Actionable Insights:</strong> We provide remediation steps for each finding
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">5</span>
                  <div>
                    <strong className="text-foreground">Data Cleanup:</strong> After delivery, query data is permanently deleted from our systems
                  </div>
                </li>
              </ol>
            </section>

            <section className="p-6 rounded-xl bg-muted/50 border border-border">
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Scan Queries:</strong> Deleted immediately after results are delivered (typically within 2-5 minutes)
                </p>
                <p>
                  <strong className="text-foreground">Scan Results:</strong> Stored encrypted in your account for 90 days (Pro users), 30 days (Free users)
                </p>
                <p>
                  <strong className="text-foreground">Account Data:</strong> Retained while your account is active, deleted within 30 days of account deletion
                </p>
              </div>
            </section>

            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-foreground">
                <strong>Questions about our data sources or practices?</strong>
              </p>
              <p className="text-muted-foreground mt-2">
                Contact our privacy team: <a href="mailto:privacy@footprintiq.app" className="text-primary hover:underline">privacy@footprintiq.app</a>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default DataSources;
