import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO, organizationSchema } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TrustSignals } from "@/components/TrustSignals";
import { WhatWeDoSection } from "@/components/WhatWeDoSection";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { WhatWeAre } from "@/components/WhatWeAre";
import { WhoItsFor } from "@/components/WhoItsFor";
import { SampleReportPreview } from "@/components/SampleReportPreview";
import { WhyItMatters } from "@/components/WhyItMatters";
import { TrustTransparency } from "@/components/TrustTransparency";
import { FinalCTA } from "@/components/FinalCTA";
import { FAQ } from "@/components/FAQ";

import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { FloatingCTA } from "@/components/FloatingCTA";
import { ScrollToTop } from "@/components/ScrollToTop";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Defer auth check to avoid blocking LCP
    const checkAuth = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/dashboard");
        }
      });
    };
    
    // Use requestIdleCallback for non-blocking auth check
    if ('requestIdleCallback' in window) {
      requestIdleCallback(checkAuth, { timeout: 2000 });
    } else {
      // Fallback: defer with setTimeout
      setTimeout(checkAuth, 100);
    }
  }, [navigate]);

  const handleStartScan = () => {
    navigate('/scan');
  };

  const handleAdvancedScan = () => {
    navigate('/scan/advanced');
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": "See what the internet knows about you. FootprintIQ scans hundreds of public sources to reveal exposed usernames, profiles, breached data, and digital risks linked to your online identity.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free scan available"
    },
    "url": "https://footprintiq.app/"
  };

  const faqSchema = {
    "@context": "https://schema.org" as const,
    "@type": "FAQPage" as const,
    mainEntity: [
      {
        "@type": "Question" as const,
        name: "Is my data private when using FootprintIQ?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Yes — we analyse publicly available information only and never store or sell your personal data. Your privacy is our top priority."
        }
      },
      {
        "@type": "Question" as const,
        name: "Is FootprintIQ free to use?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Yes! The free tier runs comprehensive checks across public sources including social platforms, forums, breach indexes, and data brokers."
        }
      },
      {
        "@type": "Question" as const,
        name: "What does FootprintIQ scan?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "FootprintIQ scans publicly accessible sources including social platforms, forums, breach indexes, data broker listings, and people-search sites to build a clear picture of your online visibility."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org" as const,
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: "https://footprintiq.app/"
      }
    ]
  };

  return (
    <>
      <SEO
        title="FootprintIQ — See What The Internet Knows About You"
        description="FootprintIQ scans hundreds of public sources to reveal exposed usernames, profiles, breached data, and digital risks linked to your online identity. No hacking. No private databases."
        canonical="https://footprintiq.app/"
        ogImage="https://footprintiq.app/og-image.jpg"
        schema={{
          organization: organizationSchema,
          faq: faqSchema,
          breadcrumbs: breadcrumbSchema,
          custom: softwareAppSchema
        }}
      />
      <ScrollProgressBar />
      <Header />
      
      {/* Hero - Above fold, priority render */}
      <Hero onStartScan={handleStartScan} onAdvancedScan={handleAdvancedScan} />
      
      {/* Below fold sections - use content-visibility for LCP optimization */}
      <div className="below-fold">
        <TrustSignals />
      </div>
      
      <div className="below-fold">
        <WhatWeDoSection />
      </div>
      
      <div id="how-it-works" className="below-fold">
        <HowItWorks />
      </div>
      
      <div id="features" className="below-fold">
        <WhyChooseUs />
      </div>
      
      <div className="below-fold">
        <WhatWeAre />
      </div>
      
      <div className="below-fold">
        <WhoItsFor />
      </div>
      
      <div className="below-fold">
        <SampleReportPreview />
      </div>
      
      <div className="below-fold">
        <TrustTransparency />
      </div>
      
      <div className="below-fold">
        <WhyItMatters />
      </div>
      
      <div className="below-fold">
        <FinalCTA />
      </div>
      
      <div className="below-fold">
        <FAQ />
      </div>
      
      <FloatingCTA />
      <ScrollToTop />
      <Footer />
    </>
  );
}
