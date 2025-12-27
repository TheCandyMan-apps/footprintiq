import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { StructuredData, organizationSchema } from "@/components/StructuredData";
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
import { OrganizationSchema } from "@/components/OrganizationSchema";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { FloatingCTA } from "@/components/FloatingCTA";
import { ScrollToTop } from "@/components/ScrollToTop";

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
        "description": "See what the internet knows about you. FootprintIQ scans hundreds of public sources to reveal exposed usernames, profiles, breached data, and digital risks linked to your online identity.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free scan available"
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
              "text": "Yes — we analyse publicly available information only and never store or sell your personal data. Your privacy is our top priority."
            }
          },
          {
            "@type": "Question",
            "name": "Is FootprintIQ free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! The free tier runs comprehensive checks across public sources including social platforms, forums, breach indexes, and data brokers."
            }
          },
          {
            "@type": "Question",
            "name": "What does FootprintIQ scan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "FootprintIQ scans publicly accessible sources including social platforms, forums, breach indexes, data broker listings, and people-search sites to build a clear picture of your online visibility."
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
        title="FootprintIQ — See What The Internet Knows About You"
        description="FootprintIQ scans hundreds of public sources to reveal exposed usernames, profiles, breached data, and digital risks linked to your online identity. No hacking. No private databases."
        canonical="https://footprintiq.app/"
        ogImage="https://footprintiq.app/og-image.jpg"
        structuredData={structuredData}
      />
      <OrganizationSchema />
      <StructuredData organization={organizationSchema} />
      <ScrollProgressBar />
      <Header />
      
      {/* Hero */}
      <Hero onStartScan={handleStartScan} onAdvancedScan={handleAdvancedScan} />
      
      {/* Social Proof Strip */}
      <TrustSignals />
      
      {/* What FootprintIQ Does */}
      <WhatWeDoSection />
      
      {/* How It Works - 3 Steps */}
      <div id="how-it-works">
        <HowItWorks />
      </div>
      
      {/* What We Scan */}
      <div id="features">
        <WhyChooseUs />
      </div>
      
      {/* What We Are / Aren't */}
      <WhatWeAre />
      
      {/* Who It's For */}
      <WhoItsFor />
      
      {/* Sample Report Preview */}
      <SampleReportPreview />
      
      {/* Trust & Transparency */}
      <TrustTransparency />
      
      {/* Why It Matters */}
      <WhyItMatters />
      
      {/* Final CTA */}
      <FinalCTA />
      
      {/* FAQ */}
      <FAQ />
      
      <FloatingCTA />
      <ScrollToTop />
      <Footer />
    </>
  );
}
