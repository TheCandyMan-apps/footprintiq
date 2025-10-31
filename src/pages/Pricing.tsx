import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";
import { Sparkles } from "lucide-react";
import pricingHero from "@/assets/pricing-hero.jpg";

const PricingPage = () => {
  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "FootprintIQ",
    "description": "Enterprise OSINT platform for digital footprint analysis and threat intelligence",
    "brand": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Analyst Plan",
        "price": "29",
        "priceCurrency": "GBP",
        "priceValidUntil": "2026-12-31",
        "description": "For security analysts with unlimited scans and dark web monitoring"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan",
        "price": "79",
        "priceCurrency": "GBP",
        "priceValidUntil": "2026-12-31",
        "description": "Advanced features with PDF exports and white-label reports"
      },
      {
        "@type": "Offer",
        "name": "Enterprise Plan",
        "price": "Contact",
        "priceCurrency": "GBP",
        "description": "Custom enterprise solution with API access and SSO"
      }
    ]
  };

  return (
    <>
      <SEO
        title="Pricing — FootprintIQ Digital Footprint Scanner"
        description="Affordable plans for comprehensive OSINT scanning. Free tier includes basic breach checks. Premium unlocks dark web monitoring and unlimited scans."
        canonical="https://footprintiq.app/pricing"
        structuredData={pricingStructuredData}
      />
      <div className="min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 z-0">
            <img 
              src={pricingHero} 
              alt="Pricing plans" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                Protection Plan
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start protecting your digital footprint today with our flexible pricing options
            </p>
          </div>
        </section>

        <main className="container mx-auto px-4 pb-16">
          <Pricing />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
