import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Pricing } from "@/components/Pricing";

const PricingPage = () => {
  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "FootprintIQ Premium",
    "description": "Advanced digital footprint scanning and online privacy protection",
    "brand": {
      "@type": "Organization",
      "name": "FootprintIQ"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "GBP",
        "description": "Basic scans with limited sources"
      },
      {
        "@type": "Offer",
        "name": "Premium Plan",
        "price": "9.99",
        "priceCurrency": "GBP",
        "description": "Unlimited scans with all OSINT sources and dark web monitoring"
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <Pricing />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
