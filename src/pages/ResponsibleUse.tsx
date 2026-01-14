import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

const ResponsibleUse = () => {
  return (
    <>
      <SEO
        title="Responsible Use & OSINT Ethics — FootprintIQ"
        description="Guidance on ethical, lawful, and proportionate use of OSINT results. UK law-compliant guidelines for responsible digital footprint scanning."
        canonical="https://footprintiq.app/responsible-use"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Responsible Use & Ethics", item: "https://footprintiq.app/responsible-use" }
            ]
          }
        }}
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
              Responsible Use & OSINT Ethics
            </h1>
            <p className="text-xl text-muted-foreground">
              FootprintIQ is designed for legitimate privacy protection and security research. 
              Use our OSINT tools ethically, lawfully, and with respect for individual privacy rights 
              under UK data protection law.
            </p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Why Responsible OSINT Matters</h2>
              <p className="text-muted-foreground leading-relaxed">
                Open Source Intelligence (OSINT) tools are powerful resources for privacy protection and security research. 
                However, the same data that helps individuals secure their digital footprint can be misused for harassment, 
                stalking, or discrimination. FootprintIQ is committed to promoting ethical, legal, and proportionate use of 
                OSINT in accordance with UK law and international privacy standards.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Core OSINT Principles</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Legality:</strong> Comply with UK Data Protection Act 2018, UK GDPR, 
                  Computer Misuse Act 1990, and all applicable laws
                </li>
                <li>
                  <strong className="text-foreground">Necessity:</strong> Only collect data necessary for your legitimate purpose; 
                  avoid excessive or indiscriminate scanning
                </li>
                <li>
                  <strong className="text-foreground">Proportionality:</strong> Ensure OSINT use is proportionate to the risk or 
                  objective; do not overreach
                </li>
                <li>
                  <strong className="text-foreground">Minimisation:</strong> Limit data collection to what is strictly required; 
                  delete data when no longer needed
                </li>
                <li>
                  <strong className="text-foreground">Respect for Privacy:</strong> Honor individuals' reasonable expectation of 
                  privacy, even when data is publicly available
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Acceptable Use Cases
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Personal Privacy Protection:</strong> Scanning your own digital footprint 
                  to identify and remediate exposed personal information
                </li>
                <li>
                  <strong className="text-foreground">Authorized Security Research:</strong> Legitimate security testing of your 
                  own systems, domains, and infrastructure
                </li>
                <li>
                  <strong className="text-foreground">Lawful Investigations:</strong> Scanning with explicit written permission from 
                  the data owner, legal authority, or under a lawful basis (e.g., employment contracts, safeguarding)
                </li>
                <li>
                  <strong className="text-foreground">Family Protection:</strong> Parents monitoring their minor children's digital 
                  footprint with appropriate parental responsibility
                </li>
                <li>
                  <strong className="text-foreground">Brand & Corporate Protection:</strong> Organizations monitoring their official 
                  domains, email addresses, and brand presence for security or reputation management
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Prohibited Uses
              </h2>
              <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-foreground font-semibold mb-4">
                  The following uses are strictly prohibited under UK law and FootprintIQ policy, and may result in account 
                  termination, legal action, and reporting to authorities:
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Stalking or Harassment:</strong> Scanning individuals without consent for 
                    harassment, stalking, or intimidation (offenses under Protection from Harassment Act 1997 and Serious Crime Act 2015)
                  </li>
                  <li>
                    <strong className="text-foreground">Doxxing:</strong> Publicly sharing or threatening to share private 
                    information about individuals without consent
                  </li>
                  <li>
                    <strong className="text-foreground">Discrimination:</strong> Using OSINT data for discriminatory hiring, 
                    housing, credit, or employment decisions (Equality Act 2010 violations)
                  </li>
                  <li>
                    <strong className="text-foreground">Unlawful Surveillance:</strong> Illegal monitoring of employees, partners, 
                    ex-partners, or minors without lawful authority
                  </li>
                  <li>
                    <strong className="text-foreground">Unauthorized Access:</strong> Attempting to gain unauthorized access to 
                    systems, accounts, or private databases (Computer Misuse Act 1990)
                  </li>
                  <li>
                    <strong className="text-foreground">Identity Theft & Fraud:</strong> Using OSINT data to impersonate others, 
                    commit fraud, or facilitate financial crimes
                  </li>
                  <li>
                    <strong className="text-foreground">Exploitation of Minors:</strong> Unlawful monitoring, tracking, or data 
                    collection targeting minors without parental consent
                  </li>
                  <li>
                    <strong className="text-foreground">Competitive Intelligence Abuse:</strong> Unauthorized scanning of 
                    competitors' infrastructure for unfair commercial advantage
                  </li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">UK Legal Compliance</h2>
              <p className="text-muted-foreground mb-4">
                When using FootprintIQ, you must comply with:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">UK GDPR & Data Protection Act 2018:</strong> Lawful basis, data minimisation, purpose limitation</li>
                <li><strong className="text-foreground">Computer Misuse Act 1990:</strong> No unauthorized access to computer systems</li>
                <li><strong className="text-foreground">Protection from Harassment Act 1997:</strong> No stalking, harassment, or course of conduct causing alarm/distress</li>
                <li><strong className="text-foreground">Serious Crime Act 2015:</strong> Stalking involving fear of violence is a criminal offense</li>
                <li><strong className="text-foreground">Equality Act 2010:</strong> No discriminatory use of personal data</li>
                <li><strong className="text-foreground">Investigatory Powers Act 2016:</strong> No unlawful interception or surveillance</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Reporting Abuse</h2>
              <p className="text-muted-foreground mb-4">
                If you believe someone is misusing FootprintIQ, engaging in unlawful conduct, or violating this policy:
              </p>
              <p className="text-foreground font-semibold">
                <strong>Abuse Reports:</strong>{" "}
                <a href="mailto:abuse@footprintiq.app" className="text-primary hover:underline">
                  abuse@footprintiq.app
                </a>
              </p>
              <p className="text-muted-foreground mt-4">
                We investigate all reports and may suspend or terminate accounts, report illegal activity to law enforcement, 
                and cooperate with lawful investigations.
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
