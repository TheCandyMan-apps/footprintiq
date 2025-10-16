import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HowWeSourceData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://footprintiq.app/" },
      { "@type": "ListItem", "position": 2, "name": "How We Source Data", "item": "https://footprintiq.app/how-we-source-data" }
    ]
  };

  return (
    <>
      <SEO
        title="How We Source Data — FootprintIQ OSINT Provider Transparency"
        description="Learn about FootprintIQ's trusted OSINT data sources including Have I Been Pwned, Shodan, VirusTotal, and 100+ data brokers. Full transparency on our intelligence gathering."
        canonical="https://footprintiq.app/how-we-source-data"
        structuredData={structuredData}
      />
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-8">How We Source Data</h1>
        
        <section className="space-y-6 text-muted-foreground">
          <p className="text-lg">FootprintIQ aggregates intelligence from trusted, lawful OSINT (Open Source Intelligence) providers to give you comprehensive visibility into your digital footprint.</p>

          <div className="space-y-8 mt-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Breach Intelligence</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Have I Been Pwned</strong> — Troy Hunt's authoritative breach database covering 12+ billion compromised accounts</li>
                <li><strong>DeHashed</strong> — Real-time breach monitoring and credential exposure tracking</li>
                <li><strong>IntelX</strong> — Dark web and paste site monitoring for leaked credentials</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Network & Infrastructure</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Shodan</strong> — Internet-connected device scanning and open port detection</li>
                <li><strong>Censys</strong> — Certificate transparency and TLS configuration analysis</li>
                <li><strong>SecurityTrails</strong> — Historical DNS records and domain intelligence</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Domain & Reputation</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>VirusTotal</strong> — Multi-engine malware scanning and URL reputation</li>
                <li><strong>AlienVault OTX</strong> — Threat intelligence and indicator feeds</li>
                <li><strong>AbuseIPDB</strong> — IP reputation and abuse reporting</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Username & Social Intelligence</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>500+ Platform Checks</strong> — Automated username availability across social media, forums, gaming, and developer platforms</li>
                <li><strong>Public Profile Scraping</strong> — Lawful extraction of publicly visible information</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Data Broker Monitoring</h2>
              <p>We monitor 100+ data broker sites including Spokeo, WhitePages, PeopleFinders, and specialized people-search databases. Our automated removal service submits opt-out requests on your behalf.</p>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-3">Our Commitment to Lawful OSINT</h3>
            <p>All data sources used by FootprintIQ are publicly accessible or obtained through authorized API partnerships. We never use illegal hacking, unauthorized access, or privacy-violating techniques. All intelligence gathering complies with UK GDPR, Computer Misuse Act 1990, and international data protection standards.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
