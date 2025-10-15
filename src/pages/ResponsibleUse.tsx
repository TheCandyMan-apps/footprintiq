import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

const ResponsibleUse = () => {
  return (
    <>
      <SEO
        title="Responsible Use Policy | FootprintIQ"
        description="Learn about ethical OSINT practices and responsible use of FootprintIQ's digital footprint scanning tools. Guidelines for privacy-conscious research."
        canonical="https://footprintiq.app/responsible-use"
      />
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-6">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Ethical OSINT Practices</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Responsible Use Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              FootprintIQ is designed for legitimate privacy protection and security research. 
              Please use our tools ethically and responsibly.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Acceptable Use
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Personal Privacy Protection:</strong> Scanning your own digital footprint to identify and remove exposed personal information
                </li>
                <li>
                  <strong className="text-foreground">Security Research:</strong> Legitimate security testing of your own systems, domains, and infrastructure
                </li>
                <li>
                  <strong className="text-foreground">Authorized Investigations:</strong> Scanning with explicit written permission from the data owner or legal authority
                </li>
                <li>
                  <strong className="text-foreground">Family Protection:</strong> Parents monitoring their minor children's digital footprint with appropriate consent
                </li>
                <li>
                  <strong className="text-foreground">Brand Protection:</strong> Companies monitoring their official domains, email addresses, and brand presence
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Prohibited Activities
              </h2>
              <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-foreground font-semibold mb-4">
                  The following uses are strictly prohibited and may result in account termination and legal action:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Stalking or Harassment:</strong> Scanning individuals without consent for harassment, stalking, or intimidation
                  </li>
                  <li>
                    <strong className="text-foreground">Unauthorized Access:</strong> Attempting to gain unauthorized access to systems, accounts, or private information
                  </li>
                  <li>
                    <strong className="text-foreground">Identity Theft:</strong> Using OSINT data to impersonate others or commit fraud
                  </li>
                  <li>
                    <strong className="text-foreground">Doxxing:</strong> Publicly sharing private information about individuals without consent
                  </li>
                  <li>
                    <strong className="text-foreground">Employment Discrimination:</strong> Using scan results for discriminatory hiring or employment decisions
                  </li>
                  <li>
                    <strong className="text-foreground">Competitive Intelligence Abuse:</strong> Unauthorized scanning of competitors' infrastructure for unfair advantage
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">OSINT Ethics Guidelines</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Open Source Intelligence (OSINT) tools like FootprintIQ should be used in accordance 
                  with ethical standards and applicable laws:
                </p>
                <ul className="space-y-2">
                  <li><strong className="text-foreground">Transparency:</strong> Be honest about your intentions when conducting research</li>
                  <li><strong className="text-foreground">Proportionality:</strong> Only collect data necessary for your legitimate purpose</li>
                  <li><strong className="text-foreground">Privacy:</strong> Respect individuals' reasonable expectation of privacy</li>
                  <li><strong className="text-foreground">Legality:</strong> Comply with all applicable data protection and privacy laws</li>
                  <li><strong className="text-foreground">Accountability:</strong> Take responsibility for how you use discovered information</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Data Sources & Limitations</h2>
              <p className="text-muted-foreground mb-4">
                FootprintIQ aggregates data from publicly available OSINT sources including:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>Have I Been Pwned (breach databases)</li>
                <li>Shodan (internet-connected device intelligence)</li>
                <li>VirusTotal (domain and file reputation)</li>
                <li>Public data broker databases</li>
                <li>DNS and WHOIS records</li>
                <li>Social media platform searches</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                All data comes from publicly accessible sources. We do not hack, breach, or access 
                any private systems or databases.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Enforcement</h2>
              <p className="text-muted-foreground mb-4">
                We actively monitor for abuse and take violations seriously:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li>First violation: Account warning and temporary suspension</li>
                <li>Second violation: Permanent account termination</li>
                <li>Illegal activity: Immediate termination and reporting to authorities</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Reporting Abuse</h2>
              <p className="text-muted-foreground mb-4">
                If you believe someone is misusing FootprintIQ or have questions about responsible use:
              </p>
              <p className="text-foreground font-semibold">
                Email: <a href="mailto:abuse@footprintiq.app" className="text-primary hover:underline">abuse@footprintiq.app</a>
              </p>
            </section>

            <div className="p-6 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Last Updated:</strong> October 15, 2025
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                We reserve the right to update this policy at any time. Continued use of FootprintIQ 
                constitutes acceptance of these terms.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default ResponsibleUse;
