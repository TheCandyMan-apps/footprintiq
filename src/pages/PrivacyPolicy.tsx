import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://footprintiq.app/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Privacy Policy",
        "item": "https://footprintiq.app/privacy"
      }
    ]
  };

  return (
    <>
      <SEO
        title="Privacy Policy — FootprintIQ"
        description="How FootprintIQ handles your data: what we collect, why we collect it, retention, cookies, analytics, and your rights under UK GDPR."
        canonical="https://footprintiq.app/privacy"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">footprintiq</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 15, 2025</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ provides OSINT-powered digital footprint scanning to help you understand and protect your online privacy. 
                We are committed to handling your data responsibly and in compliance with UK GDPR and applicable data protection laws. 
                We do not sell your personal data, and scan queries are processed transiently.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">What Data We Process</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Data You Provide</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use FootprintIQ, we process the following information you provide:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Scan Inputs:</strong> Email addresses, usernames, domain names, IP addresses, and phone numbers you submit for scanning</li>
                <li><strong className="text-foreground">Account Information:</strong> Email address, name (optional), and authentication credentials</li>
                <li><strong className="text-foreground">Support Requests:</strong> Any information you provide when contacting support</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We automatically collect limited usage data:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Basic Logs:</strong> Timestamps of scans, subscription tier, and aggregated usage statistics</li>
                <li><strong className="text-foreground">Technical Data:</strong> Browser type, device type (for responsive design), and general location (country-level for compliance)</li>
                <li><strong className="text-foreground">Analytics:</strong> Privacy-friendly analytics via Plausible (no personal identifiers, respects Do-Not-Track)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Cookies & Consent</h3>
              <p className="text-muted-foreground leading-relaxed">
                We use essential cookies for authentication and session management. Optional analytics cookies are only enabled 
                with your explicit consent. You can manage cookie preferences via our consent banner.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Legal Basis & Purpose (UK GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We process your data under the following legal bases:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Performance of a Contract:</strong> Processing scan requests you initiate is necessary to provide the service you've requested
                </li>
                <li>
                  <strong className="text-foreground">Legitimate Interests:</strong> Security monitoring, fraud prevention, abuse detection, and service improvement (where not overridden by your privacy rights)
                </li>
                <li>
                  <strong className="text-foreground">Consent:</strong> Analytics cookies and non-essential processing (you may withdraw consent at any time)
                </li>
                <li>
                  <strong className="text-foreground">Legal Obligation:</strong> Compliance with data protection laws, court orders, and lawful requests from authorities
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sources</h2>
              <p className="text-muted-foreground leading-relaxed">
                We query only open-source and publicly accessible OSINT providers including Have I Been Pwned, Shodan, 
                VirusTotal, DNS/WHOIS records, and data broker databases. We do not bypass authentication, access private 
                systems, or engage in unauthorized data collection. See our{" "}
                <Link to="/data-sources" className="text-primary hover:underline">Data Sources & Methodology</Link> page for details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">Scan Inputs:</strong> Processed transiently and deleted immediately after results are delivered (typically 2-5 minutes)
                </li>
                <li>
                  <strong className="text-foreground">Scan Results:</strong> Stored encrypted in your account for 90 days (Pro users) or 30 days (Free users)
                </li>
                <li>
                  <strong className="text-foreground">Account Data:</strong> Retained while your account is active; deleted within 30 days of account deletion
                </li>
                <li>
                  <strong className="text-foreground">Aggregate Analytics:</strong> Non-personal, anonymized diagnostics may be retained indefinitely for service improvement
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Sharing & Third-Party Processors</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We share limited data with selected processors who help us operate the service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Cloud Hosting:</strong> Supabase (data storage and authentication) — EU/UK data residency</li>
                <li><strong className="text-foreground">Analytics:</strong> Plausible Analytics (privacy-friendly, GDPR-compliant, EU-hosted)</li>
                <li><strong className="text-foreground">Email:</strong> Transactional email service for account notifications (Resend or equivalent)</li>
                <li><strong className="text-foreground">OSINT Providers:</strong> Have I Been Pwned, Shodan, VirusTotal APIs (scan queries only)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">We never sell your personal data.</strong> All third-party processors are bound 
                by data processing agreements and security requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies & Analytics</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground">
                    Authentication tokens and session cookies (required for service functionality, no consent needed under UK GDPR)
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground">
                    We use privacy-friendly Plausible Analytics with no personal identifiers, no cross-site tracking, and full 
                    respect for Do-Not-Track (DNT) browser settings. Analytics are only enabled with your explicit consent.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights (UK/EU GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under UK GDPR and the UK Data Protection Act 2018, you have the following rights:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Right of Access:</strong> Request a copy of all personal data we hold about you</li>
                <li><strong className="text-foreground">Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong className="text-foreground">Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong className="text-foreground">Right to Restrict Processing:</strong> Limit how we use your data in certain circumstances</li>
                <li><strong className="text-foreground">Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong className="text-foreground">Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Withdraw consent for analytics or non-essential processing at any time</li>
                <li><strong className="text-foreground">Right to Lodge a Complaint:</strong> File a complaint with the UK Information Commissioner's Office (ICO)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@footprintiq.app" className="text-primary hover:underline">
                  privacy@footprintiq.app
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">International Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                We primarily use EU/UK-based service providers. Where data is transferred outside the UK/EEA, we ensure 
                adequate safeguards via Standard Contractual Clauses (SCCs) or other approved transfer mechanisms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for individuals under 16 years of age. We do not knowingly collect personal 
                data from children. Parents may scan their minor children's digital footprint with appropriate consent 
                (see our <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</Link>).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact & Data Protection Officer</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For privacy questions, data subject access requests, or concerns:
              </p>
              <p className="text-foreground">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacy@footprintiq.app" className="text-primary hover:underline">
                  privacy@footprintiq.app
                </a>
              </p>
              <p className="text-foreground mt-2">
                <strong>UK ICO Registration:</strong> [Registration number — to be added once registered]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy to reflect changes in our practices or legal requirements. Material 
                changes will be communicated via email or a prominent notice on our website. The "Last updated" date at 
                the top of this page indicates when the policy was last revised.
              </p>
            </section>

            <div className="p-6 rounded-xl bg-muted/50 border border-border mt-8">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Governing Law:</strong> This Privacy Policy is governed by the laws of 
                England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
