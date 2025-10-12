import { Footer } from "@/components/Footer";
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using footprintiq's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              footprintiq provides digital footprint scanning, data broker removal services, and ongoing privacy monitoring. We scan various online sources for your personal information and submit removal requests to data brokers and people search sites on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Accurate Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to provide accurate, current, and complete information when using our services. You are responsible for maintaining the accuracy of your account information.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Authorized Use</h3>
            <p className="text-muted-foreground leading-relaxed">
              You may only use our services for your own personal information or information for which you have proper authorization. You may not use our services for any illegal purpose or in violation of any applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Service Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While we make every effort to remove your information from data brokers and people search sites, we cannot guarantee:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Complete removal of all online information</li>
              <li>Specific timeframes for removal (as this depends on third-party cooperation)</li>
              <li>Prevention of information reappearing on public records or legally required databases</li>
              <li>Removal from sources that are legally exempt or outside our coverage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Subscription and Payment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Paid subscriptions renew automatically unless cancelled. You may cancel at any time through your account settings. Refunds are provided according to our refund policy:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>30-day money-back guarantee for new subscribers</li>
              <li>Pro-rated refunds for annual subscriptions cancelled mid-term</li>
              <li>No refunds for monthly subscriptions after the billing date</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, features, and functionality of footprintiq's services are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              footprintiq shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate your access to our services at any time for violation of these terms or for any other reason at our sole discretion. Upon termination, your right to use the services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. We will notify you of significant changes via email or through the service. Your continued use of the service after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:legal@footprintiq.com" className="text-primary hover:underline">
                legal@footprintiq.com
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
