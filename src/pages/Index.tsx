import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield } from "lucide-react";
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
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { FloatingCTA } from "@/components/FloatingCTA";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { shouldAutoStartTour, getTourAutoStartDelay } from "@/lib/tour/firstTime";
import scanCapabilitiesBg from "@/assets/scan-capabilities-bg.jpg";
import privacyBadge from "@/assets/privacy-badge.jpg";
import privacyShield from "@/assets/privacy-shield.jpg";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a first-time user and should auto-start tour
    if (shouldAutoStartTour()) {
      const timer = setTimeout(() => {
        navigate('/onboarding?tour=onboarding');
      }, getTourAutoStartDelay());
      
      return () => clearTimeout(timer);
    }
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
      
      <main className="relative px-6 py-16 mx-auto max-w-5xl overflow-hidden animate-fadeIn">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 -mx-6">
          <img 
            src={scanCapabilitiesBg} 
            alt="Digital footprint scanning visualization" 
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/90 to-background" />
        </div>
        
        <section className="relative z-10 mt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What You Can Scan with FootprintIQ
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Comprehensive OSINT scanning across multiple data types to uncover your complete digital footprint
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <div className="group p-6 rounded-xl bg-gradient-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">What You Can Scan</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Email breach checks</strong> — Identity enrichment via Have I Been Pwned</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Username presence</strong> — Search across major social platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Domain reputation</strong> — Tech stack, DNS history &amp; VirusTotal analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>IP exposure</strong> — Open ports &amp; device scanning via Shodan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Phone intelligence</strong> — Carrier checks &amp; number validation</span>
                </li>
              </ul>
            </div>
            
            <div className="group p-6 rounded-xl bg-gradient-card border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
              <h3 className="text-xl font-semibold mb-4 group-hover:text-accent transition-colors">Why It Matters</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Reduce risk</strong> from exposed personal data and security breaches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Protect privacy</strong> for yourself, your family, and your brand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Get actionable steps</strong> with detailed cleanup instructions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span><strong>Monitor continuously</strong> with automated tracking of new exposures</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link 
              to="/scan" 
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-6 py-3 font-semibold hover:bg-primary/90 transition-colors"
            >
              Run a Free Scan
            </Link>
          </div>
        </section>

        {/* Privacy Trust Note with Image */}
        <section className="relative mt-20 rounded-3xl overflow-hidden group">
          <div className="absolute inset-0">
            <img 
              src={privacyShield} 
              alt="Privacy protection shield" 
              className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/90 to-accent/20" />
          </div>
          
          <div className="relative z-10 p-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary/30 mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Your Privacy is Our Priority
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We never sell your data. All scan queries are <span className="text-foreground font-semibold">transient and encrypted</span>. 
                We only query reputable OSINT providers and <span className="text-foreground font-semibold">delete search data</span> after delivering your results.
              </p>
              <div className="mt-8 flex justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:200ms]" />
                  <span>Zero Data Retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:400ms]" />
                  <span>GDPR Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <FAQ />
      <FloatingCTA />
      <ScrollToTop />
      <Footer />
    </>
  );
}
