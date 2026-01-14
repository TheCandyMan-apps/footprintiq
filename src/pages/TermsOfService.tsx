import { SEO } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <>
      <SEO
        title="Terms of Use — FootprintIQ"
        description="The rules for using FootprintIQ. Acceptable use, disclaimers, limitations, and jurisdiction under UK law."
        canonical="https://footprintiq.app/terms"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Terms of Service", item: "https://footprintiq.app/terms" }
            ]
          }
        }}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Use</h1>
          <p className="text-muted-foreground mb-8">Last updated: October 15, 2025</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using FootprintIQ's services (the "Service"), you agree to be bound by these Terms of Use 
                ("Terms"). If you do not agree to these Terms, you may not use the Service. These Terms constitute a legally 
                binding agreement between you and FootprintIQ.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ provides OSINT-powered digital footprint scanning, privacy analysis, and data broker removal 
                services. We scan publicly available sources including Have I Been Pwned, Shodan, VirusTotal, DNS/WHOIS 
                records, and data broker databases to identify your digital footprint and help you protect your privacy.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The Service includes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Email breach detection via Have I Been Pwned</li>
                <li>Username presence searches across social platforms</li>
                <li>Domain intelligence and reputation analysis</li>
                <li>IP exposure and open port scanning via Shodan</li>
                <li>Phone number intelligence and validation</li>
                <li>Automated data removal from 100+ data brokers (Pro plan)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree to use the Service only for lawful and ethical purposes. You must comply with all applicable 
                laws and our <Link to="/responsible-use" className="text-primary hover:underline">Responsible Use Policy</Link>.
              </p>
              
              <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
                <h3 className="text-lg font-semibold mb-3 text-foreground">Prohibited Uses</h3>
                <p className="text-muted-foreground mb-3">
                  You may NOT use FootprintIQ for:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Harassment or Stalking:</strong> Scanning individuals without consent for harassment, stalking, intimidation, or doxxing</li>
                  <li><strong className="text-foreground">Unlawful Surveillance:</strong> Illegal monitoring of employees, partners, or third parties</li>
                  <li><strong className="text-foreground">Discrimination:</strong> Using scan results for discriminatory hiring, housing, or credit decisions</li>
                  <li><strong className="text-foreground">Unauthorized Access:</strong> Attempting to bypass authentication or access non-public systems</li>
                  <li><strong className="text-foreground">Violating Provider Terms:</strong> Using scan data in ways that violate OSINT provider terms of service</li>
                  <li><strong className="text-foreground">Reselling or Redistribution:</strong> Reselling scan results or creating competing services</li>
                  <li><strong className="text-foreground">Automated Abuse:</strong> Scraping, bot attacks, or overwhelming the Service with excessive requests</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">No Legal or Professional Advice</h2>
              <p className="text-muted-foreground leading-relaxed">
                FootprintIQ provides informational tools and data aggregation services. <strong className="text-foreground">We do not 
                provide legal, financial, or professional advice.</strong> Scan results are for informational purposes only. 
                For legal guidance on data protection, privacy compliance, or cybersecurity, consult a qualified professional.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Service Availability & Changes</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We strive to maintain Service availability but do not guarantee uninterrupted access:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>The Service may be temporarily unavailable due to maintenance, upgrades, or third-party provider downtime</li>
                <li>We reserve the right to modify, suspend, or discontinue features at any time</li>
                <li>OSINT provider coverage may change as third-party APIs evolve or become unavailable</li>
                <li>Data removal timelines depend on third-party cooperation and are not guaranteed</li>
              </ul>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Enterprise Service Level Agreement (SLA)</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Enterprise customers receive enhanced availability commitments:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">99.9% Uptime SLA:</strong> Monthly uptime guarantee with service credits for violations</li>
                <li><strong className="text-foreground">Priority Support:</strong> Dedicated account manager and 4-hour response time for critical issues</li>
                <li><strong className="text-foreground">Scheduled Maintenance:</strong> 7-day advance notice for planned maintenance windows</li>
                <li><strong className="text-foreground">API Rate Limits:</strong> Guaranteed API quota with burst capacity up to 10,000 requests/hour</li>
                <li><strong className="text-foreground">Data Export:</strong> 48-hour maximum turnaround for bulk data export requests</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                See full{" "}
                <Link to="/legal/dpa" className="text-primary hover:underline">Enterprise SLA Terms</Link> or contact{" "}
                <a href="mailto:enterprise@footprintiq.app" className="text-primary hover:underline">
                  enterprise@footprintiq.app
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the fullest extent permitted by UK law:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>
                  <strong className="text-foreground">No Guarantees:</strong> We do not guarantee complete removal of all online 
                  information or specific scan result accuracy
                </li>
                <li>
                  <strong className="text-foreground">Indirect Damages:</strong> We are not liable for any indirect, incidental, 
                  special, consequential, or punitive damages (including lost profits, data loss, or business interruption)
                </li>
                <li>
                  <strong className="text-foreground">Liability Cap:</strong> Our total liability shall not exceed the amount you 
                  paid for the Service in the 12 months preceding the claim
                </li>
                <li>
                  <strong className="text-foreground">Third-Party Providers:</strong> We are not responsible for errors, omissions, 
                  or failures by third-party OSINT providers
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Consumer Rights:</strong> Nothing in these Terms excludes or limits our 
                liability for death or personal injury caused by negligence, fraud, or other liabilities that cannot be limited 
                under UK law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Indemnity</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless FootprintIQ, its officers, directors, employees, and agents from any 
                claims, damages, losses, or expenses (including legal fees) arising from:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
                <li>Your violation of these Terms or our Responsible Use Policy</li>
                <li>Your misuse of the Service or scan results</li>
                <li>Your violation of any third-party rights or applicable laws</li>
                <li>Any unauthorized access to your account resulting from your failure to maintain credential security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Subscription & Payment</h2>
              <h3 className="text-xl font-semibold mb-3 mt-4">Free Tier</h3>
              <p className="text-muted-foreground leading-relaxed">
                The Free tier includes 1 scan per month with basic OSINT coverage. No payment required.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Pro Plan</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong className="text-foreground">Auto-Renewal:</strong> Paid subscriptions renew automatically unless cancelled</li>
                <li><strong className="text-foreground">Cancellation:</strong> Cancel anytime via account settings — access continues until the end of the billing period</li>
                <li><strong className="text-foreground">Refunds:</strong> 14-day money-back guarantee for new subscribers (after first scan); pro-rated refunds for annual plans</li>
                <li><strong className="text-foreground">Price Changes:</strong> We will notify you 30 days in advance of any price changes; continued use constitutes acceptance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, software, branding, and functionality of the Service are owned by FootprintIQ or our 
                licensors and are protected by UK and international copyright, trademark, and intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You are granted a limited, non-exclusive, non-transferable license to use the Service for personal purposes. 
                You may not copy, modify, distribute, reverse engineer, or create derivative works from the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We reserve the right to suspend or terminate your access to the Service at any time for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Violation of these Terms or our Responsible Use Policy</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of subscription fees</li>
                <li>Abusive behavior toward our staff or other users</li>
                <li>Any other reason at our sole discretion</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Upon termination, your right to use the Service will immediately cease. You may delete your account at any 
                time via account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law & Jurisdiction</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of <strong className="text-foreground">England and Wales</strong>, 
                without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service 
                shall be subject to the <strong className="text-foreground">exclusive jurisdiction of the courts of England and Wales</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms at any time. Material changes will be communicated via email or a prominent notice 
                on the Service. The "Last updated" date at the top of this page indicates when the Terms were last revised. 
                Your continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Severability</h2>
              <p className="text-muted-foreground leading-relaxed">
                If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will remain 
                in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact & Notices</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms or to provide legal notice:
              </p>
              <p className="text-foreground mt-4">
                <strong>Email:</strong>{" "}
                <a href="mailto:support@footprintiq.app" className="text-primary hover:underline">
                  support@footprintiq.app
                </a>
              </p>
              <p className="text-foreground mt-2">
                <strong>Legal Notices:</strong>{" "}
                <a href="mailto:legal@footprintiq.app" className="text-primary hover:underline">
                  legal@footprintiq.app
                </a>
              </p>
            </section>

            <div className="p-6 rounded-xl bg-muted/50 border border-border mt-8">
              <p className="text-sm text-muted-foreground">
                By using FootprintIQ, you acknowledge that you have read, understood, and agree to be bound by these 
                Terms of Use and our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;
