import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO, organizationSchema } from "@/components/SEO";
import { PLATFORM_SCHEMA_DESCRIPTION, PLATFORM_META_DESCRIPTION } from "@/lib/platformDescription";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { TrustSignals } from "@/components/TrustSignals";
import { WhatYouCanDiscover } from "@/components/WhatYouCanDiscover";
import { WhatWeDoSection } from "@/components/WhatWeDoSection";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { WhatWeAre } from "@/components/WhatWeAre";
import { WhoItsFor } from "@/components/WhoItsFor";
import { ProductEntryPoints } from "@/components/ProductEntryPoints";
import { FreeVsPro } from "@/components/FreeVsPro";
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
    navigate('/scan');
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": PLATFORM_SCHEMA_DESCRIPTION,
    "url": "https://footprintiq.app/",
    "featureList": [
      "Case-based investigations",
      "False-positive reduction",
      "Consent-oriented analysis",
      "Ethical OSINT-based scanning",
      "Username search across 500+ platforms",
      "Email breach detection",
      "Data broker exposure checks",
      "Transparency and consent-first design"
    ],
    "about": {
      "@type": "DefinedTerm",
      "name": "Ethical OSINT",
      "url": "https://footprintiq.app/ethical-osint-for-individuals"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP",
      "description": "Free scan available"
    }
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
          text: "Yes — we analyse publicly available information only and never store or sell your personal data. All scans are user-initiated, and we don't monitor or track your activity."
        }
      },
      {
        "@type": "Question" as const,
        name: "Is FootprintIQ free to use?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Yes! Free scans show where exposure exists across public sources. Pro scans provide deeper analysis and evidence for data removal requests."
        }
      },
      {
        "@type": "Question" as const,
        name: "What does FootprintIQ scan?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "FootprintIQ scans publicly accessible sources including social platforms, forums, breach indexes, data broker listings, and people-search sites for username reuse, email exposure, and data broker listings."
        }
      },
      {
        "@type": "Question" as const,
        name: "Is this legal and ethical?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "Yes. FootprintIQ only accesses publicly available information using ethical OSINT techniques. We never access private accounts or bypass authentication."
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
        title="FootprintIQ — Ethical Digital Footprint Intelligence"
        description={PLATFORM_META_DESCRIPTION}
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
        <WhatYouCanDiscover />
      </div>
      
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
        <ProductEntryPoints />
      </div>
      
      <div className="below-fold">
        <FreeVsPro />
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

      <div className="below-fold">
        <div className="max-w-3xl mx-auto px-6 pb-12 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            FootprintIQ is an ethical OSINT platform designed to help individuals understand their public digital footprint. It analyses publicly available information to identify potential account exposure and correlation risks, while emphasising accuracy, transparency, and responsible interpretation.
          </p>
        </div>
      </div>
      
      <FloatingCTA />
      <ScrollToTop />
      <Footer />
    </>
  );
}
