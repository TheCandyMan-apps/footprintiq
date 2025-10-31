import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card } from "@/components/ui/card";

export default function DPA() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Data Processing Agreement - FootprintIQ"
        description="FootprintIQ Data Processing Agreement for GDPR compliance"
        canonical="https://footprintiq.app/legal/dpa"
      />
      <Header />
      
      <main className="flex-1">
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Data Processing Agreement</h1>
            <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

            <Card className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-bold mb-4">1. Definitions</h2>
                <p className="mb-4">
                  For the purposes of this Data Processing Agreement ("DPA"):
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>"Controller"</strong> means the customer who determines the purposes and means of processing Personal Data.</li>
                  <li><strong>"Processor"</strong> means FootprintIQ, which processes Personal Data on behalf of the Controller.</li>
                  <li><strong>"Personal Data"</strong> means any information relating to an identified or identifiable natural person.</li>
                  <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, storage, and deletion.</li>
                  <li><strong>"Sub-processor"</strong> means any third party engaged by the Processor to assist in processing Personal Data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">2. Scope and Purpose</h2>
                <p className="mb-4">
                  This DPA applies to all Personal Data processed by FootprintIQ as part of providing OSINT intelligence services 
                  to the Controller. The purpose of processing is to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Perform digital footprint scans and analysis</li>
                  <li>Generate intelligence reports and risk assessments</li>
                  <li>Provide monitoring and alerting services</li>
                  <li>Deliver API-based intelligence data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">3. Data Protection Obligations</h2>
                <h3 className="text-xl font-semibold mb-3">3.1 Processor's Obligations</h3>
                <p className="mb-4">FootprintIQ shall:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Process Personal Data only on documented instructions from the Controller</li>
                  <li>Ensure personnel authorized to process Personal Data are bound by confidentiality</li>
                  <li>Implement appropriate technical and organizational measures to ensure data security</li>
                  <li>Assist the Controller in responding to data subject requests</li>
                  <li>Delete or return all Personal Data upon termination of services</li>
                  <li>Make available all information necessary to demonstrate compliance</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">3.2 Controller's Obligations</h3>
                <p className="mb-4">The Controller shall:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ensure it has lawful basis for processing and sharing Personal Data</li>
                  <li>Provide clear instructions for processing</li>
                  <li>Comply with applicable data protection laws</li>
                  <li>Inform data subjects of processing activities where required</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">4. Security Measures</h2>
                <p className="mb-4">
                  FootprintIQ implements the following security measures:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Encryption:</strong> AES-256 at rest, TLS 1.3 in transit</li>
                  <li><strong>Access Controls:</strong> Role-based access control (RBAC) and multi-factor authentication</li>
                  <li><strong>Infrastructure:</strong> SOC 2 compliant cloud providers (AWS, Supabase)</li>
                  <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response</li>
                  <li><strong>Backups:</strong> Encrypted daily backups with 30-day retention</li>
                  <li><strong>Auditing:</strong> Comprehensive audit logs for all data access</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">5. Sub-processors</h2>
                <p className="mb-4">
                  FootprintIQ engages the following sub-processors:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Sub-processor</th>
                        <th className="border border-border p-3 text-left">Service</th>
                        <th className="border border-border p-3 text-left">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-border p-3">Supabase</td>
                        <td className="border border-border p-3">Database & Authentication</td>
                        <td className="border border-border p-3">USA (AWS)</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Stripe</td>
                        <td className="border border-border p-3">Payment Processing</td>
                        <td className="border border-border p-3">USA</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">Resend</td>
                        <td className="border border-border p-3">Email Delivery</td>
                        <td className="border border-border p-3">USA</td>
                      </tr>
                      <tr>
                        <td className="border border-border p-3">AWS</td>
                        <td className="border border-border p-3">Cloud Infrastructure</td>
                        <td className="border border-border p-3">USA, EU</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  FootprintIQ will notify the Controller 30 days before engaging new sub-processors. 
                  The Controller may object to new sub-processors within this period.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">6. Data Subject Rights</h2>
                <p className="mb-4">
                  FootprintIQ will assist the Controller in fulfilling data subject requests for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access to Personal Data</li>
                  <li>Rectification of inaccurate data</li>
                  <li>Erasure ("right to be forgotten")</li>
                  <li>Restriction of processing</li>
                  <li>Data portability</li>
                  <li>Objection to processing</li>
                </ul>
                <p className="mt-4">
                  The Controller must submit data subject requests to <a href="mailto:privacy@footprintiq.com" className="text-primary hover:underline">privacy@footprintiq.com</a>. 
                  FootprintIQ will respond within 10 business days.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">7. Data Breach Notification</h2>
                <p className="mb-4">
                  In the event of a Personal Data breach, FootprintIQ will:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Notify the Controller without undue delay and no later than 72 hours after becoming aware</li>
                  <li>Provide details of the breach, affected data, and mitigation steps</li>
                  <li>Cooperate with the Controller in breach investigation and remediation</li>
                  <li>Document all breaches and remediation actions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
                <p className="mb-4">
                  Personal Data may be transferred outside the European Economic Area (EEA). 
                  For such transfers, FootprintIQ relies on:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
                  <li>Adequacy decisions where applicable</li>
                  <li>Supplementary measures to ensure data protection equivalent to EU standards</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">9. Audit Rights</h2>
                <p className="mb-4">
                  The Controller may audit FootprintIQ's compliance with this DPA once per year upon 30 days' notice. 
                  FootprintIQ will provide:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>SOC 2 Type II reports</li>
                  <li>Security documentation and policies</li>
                  <li>Access to audit logs and compliance records</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Additional audits may be conducted if required by regulatory authorities or in response to a data breach.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">10. Data Retention and Deletion</h2>
                <p className="mb-4">
                  Upon termination of services, FootprintIQ will:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Delete all Personal Data within 30 days</li>
                  <li>Provide certification of deletion upon request</li>
                  <li>Retain data only if required by law (with notification to Controller)</li>
                </ul>
                <p className="mt-4">
                  The Controller may request data export in portable format before deletion.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">11. Liability and Indemnification</h2>
                <p className="mb-4">
                  Each party's liability under this DPA is subject to the limitations and exclusions in the main service agreement. 
                  FootprintIQ shall indemnify the Controller for losses resulting from FootprintIQ's breach of this DPA or applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">12. Term and Termination</h2>
                <p className="mb-4">
                  This DPA takes effect on the service start date and continues until:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Termination of the main service agreement</li>
                  <li>All Personal Data has been deleted or returned</li>
                </ul>
                <p className="mt-4">
                  Provisions related to confidentiality, liability, and data deletion survive termination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">13. Governing Law</h2>
                <p>
                  This DPA is governed by the laws of England and Wales. Disputes shall be resolved in accordance with the dispute resolution 
                  provisions in the main service agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
                <p className="mb-4">
                  For questions about this DPA or data protection matters:
                </p>
                <div className="space-y-2">
                  <p><strong>Data Protection Officer:</strong></p>
                  <p>Email: <a href="mailto:privacy@footprintiq.com" className="text-primary hover:underline">privacy@footprintiq.com</a></p>
                  <p>Address: FootprintIQ Ltd, London, United Kingdom</p>
                </div>
              </section>

              <div className="pt-8 border-t">
                <p className="text-sm text-muted-foreground">
                  Last Updated: January 1, 2025
                </p>
              </div>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}