import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Pricing } from "@/components/Pricing";
import { PremiumTeaser } from "@/components/PremiumTeaser";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { TrustSignals } from "@/components/TrustSignals";
import { TrustCredibility } from "@/components/TrustCredibility";
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { FloatingCTA } from "@/components/FloatingCTA";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { ExplainerAnimation } from "@/components/ExplainerAnimation";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleStartScan = () => {
    navigate('/scan');
  };

  const handleAdvancedScan = () => {
    navigate('/scan/advanced');
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "FootprintIQ",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Web",
        "description": "Scan your digital footprint with trusted OSINT sources. Check email breaches, usernames, domains, IPs, and phones. Remove personal data from 100+ data brokers automatically.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free tier available with Pro plans for advanced features"
        },
        "url": "https://footprintiq.app/"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is my data private when using FootprintIQ?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes — we query reputable OSINT providers and never store or sell your personal data. Your privacy is our top priority. All scans are encrypted and securely processed."
            }
          },
          {
            "@type": "Question",
            "name": "Is FootprintIQ free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! The free tier runs comprehensive checks across email breaches, username searches, and basic domain intelligence. Pro plans unlock deeper historical sources, continuous monitoring, and automated data removal from 100+ data brokers."
            }
          },
          {
            "@type": "Question",
            "name": "What OSINT sources does FootprintIQ use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "FootprintIQ uses trusted OSINT sources including Have I Been Pwned for breach detection, Shodan for IP and device exposure, VirusTotal for domain and file reputation, plus 100+ data broker databases for comprehensive digital footprint analysis."
            }
          }
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://footprintiq.app/"
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title="FootprintIQ — Digital Footprint Scanner & OSINT Privacy Protection"
        description="Scan emails, usernames, domains, phones and IPs with trusted OSINT sources. Check breaches via Have I Been Pwned, Shodan, VirusTotal. Remove data from 100+ brokers."
        canonical="https://footprintiq.app/"
        ogImage="https://footprintiq.app/og-image.jpg"
        structuredData={structuredData}
      />
      <OrganizationSchema />
      <StructuredData organization={organizationSchema} />
      <AnnouncementBar 
        message="🎉 New Feature: Persona DNA & Evidence Packs now available! Get comprehensive identity resolution reports."
        link="/blog/persona-dna-and-evidence-packs"
        linkText="Read More"
        storageKey="persona-dna-announcement"
        variant="promo"
      />
      <ScrollProgressBar />
      <Header />
      <Hero onStartScan={handleStartScan} onAdvancedScan={handleAdvancedScan} />
      <TrustSignals />
      <ExplainerAnimation />
      <div id="how-it-works" className="animate-fadeIn">
        <HowItWorks />
      </div>
      <div id="features" className="animate-fadeIn">
        <WhyChooseUs />
      </div>
      <div id="pricing" className="animate-fadeIn">
        <Pricing />
      </div>
      <PremiumTeaser />
      <Testimonials />
      
      {/* Scan Capabilities Section - Clean design */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              What You Can Scan
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive OSINT scanning across multiple data types
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Scan Types</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Email breach checks</strong> — via Have I Been Pwned</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Username presence</strong> — across major platforms</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Domain reputation</strong> — DNS &amp; VirusTotal</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">IP exposure</strong> — open ports via Shodan</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Phone intelligence</strong> — carrier validation</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Why It Matters</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Reduce risk</strong> from exposed data and breaches</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Protect privacy</strong> for you and your family</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Get actionable steps</strong> with cleanup guides</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span><strong className="text-foreground">Monitor continuously</strong> for new exposures</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/scan" 
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Run a Free Scan
            </Link>
          </div>
        </div>
      </section>

      {/* Privacy Section - Clean card design */}
      <section className="py-20 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-6">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Your Privacy is Our Priority
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            We never sell your data. All scan queries are transient and encrypted. 
            We only query reputable OSINT providers and delete search data after delivering your results.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Zero Data Retention</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Credibility Section */}
      <TrustCredibility />
      
      <FAQ />
      <FloatingCTA />
      <ScrollToTop />
      <Footer />
    </>
  );
}
