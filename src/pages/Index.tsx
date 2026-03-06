import { useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO, organizationSchema } from "@/components/SEO";
import { PLATFORM_SCHEMA_DESCRIPTION, PLATFORM_META_DESCRIPTION } from "@/lib/platformDescription";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";

// Below-fold on mobile (hero is 80svh): lazy-loaded for LCP
const HomepageResultPreview = lazy(() => import("@/components/HomepageResultPreview").then(m => ({ default: m.HomepageResultPreview })));
const HomepageEducational = lazy(() => import("@/components/HomepageEducational").then(m => ({ default: m.HomepageEducational })));

// Below-fold: lazy-loaded to reduce initial JS and improve FCP
const WhatYouCanDiscover = lazy(() => import("@/components/WhatYouCanDiscover").then(m => ({ default: m.WhatYouCanDiscover })));
const TrustSignals = lazy(() => import("@/components/TrustSignals").then(m => ({ default: m.TrustSignals })));
const WhatWeDoSection = lazy(() => import("@/components/WhatWeDoSection").then(m => ({ default: m.WhatWeDoSection })));
const PlatformCapabilities = lazy(() => import("@/components/PlatformCapabilities").then(m => ({ default: m.PlatformCapabilities })));
const ExposureIntelligenceSection = lazy(() => import("@/components/ExposureIntelligenceSection").then(m => ({ default: m.ExposureIntelligenceSection })));
const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const CategoryComparisonStrip = lazy(() => import("@/components/CategoryComparisonStrip").then(m => ({ default: m.CategoryComparisonStrip })));
const WhatWeAre = lazy(() => import("@/components/WhatWeAre").then(m => ({ default: m.WhatWeAre })));
const WhoItsFor = lazy(() => import("@/components/WhoItsFor").then(m => ({ default: m.WhoItsFor })));
const EverydayUseCases = lazy(() => import("@/components/EverydayUseCases").then(m => ({ default: m.EverydayUseCases })));
const ProductEntryPoints = lazy(() => import("@/components/ProductEntryPoints").then(m => ({ default: m.ProductEntryPoints })));
const FreeVsPro = lazy(() => import("@/components/FreeVsPro").then(m => ({ default: m.FreeVsPro })));
const SampleReportPreview = lazy(() => import("@/components/SampleReportPreview").then(m => ({ default: m.SampleReportPreview })));
const TrustTransparency = lazy(() => import("@/components/TrustTransparency").then(m => ({ default: m.TrustTransparency })));
const WhyItMatters = lazy(() => import("@/components/WhyItMatters").then(m => ({ default: m.WhyItMatters })));
const FinalCTA = lazy(() => import("@/components/FinalCTA").then(m => ({ default: m.FinalCTA })));
const DiscoveryToProofSection = lazy(() => import("@/components/DiscoveryToProofSection").then(m => ({ default: m.DiscoveryToProofSection })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const ForProfessionals = lazy(() => import("@/components/ForProfessionals").then(m => ({ default: m.ForProfessionals })));
const ResponsibleUsePledge = lazy(() => import("@/components/ResponsibleUsePledge").then(m => ({ default: m.ResponsibleUsePledge })));
const HomepageSEOLinks = lazy(() => import("@/components/HomepageSEOLinks").then(m => ({ default: m.HomepageSEOLinks })));
const FloatingCTA = lazy(() => import("@/components/FloatingCTA").then(m => ({ default: m.FloatingCTA })));
const ScrollToTop = lazy(() => import("@/components/ScrollToTop").then(m => ({ default: m.ScrollToTop })));

import { ScrollProgressBar } from "@/components/ScrollProgressBar";
import { SocialProofToast } from "@/components/conversion/SocialProofToast";
import { ExitIntentModal } from "@/components/conversion/ExitIntentModal";

// Minimal suspense fallback that doesn't cause CLS
const SectionFallback = () => <div className="min-h-[200px]" />;

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          navigate("/dashboard");
        }
      });
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(checkAuth, { timeout: 2000 });
    } else {
      setTimeout(checkAuth, 100);
    }
  }, [navigate]);




  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FootprintIQ",
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web",
    "description": "Ethical OSINT platform providing digital footprint discovery, identity risk scoring, and exposure analysis",
    "url": "https://footprintiq.app/",
    "featureList": [
      "Identity risk scoring",
      "Digital footprint discovery",
      "Public exposure analysis",
      "Breach signal detection",
      "Confidence-based interpretation"
    ],
    "about": {
      "@type": "DefinedTerm",
      "name": "Ethical OSINT",
      "url": "https://footprintiq.app/ethical-osint-for-individuals"
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
      },
      {
        "@type": "Question" as const,
        name: "Does FootprintIQ remove my data?",
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: "FootprintIQ does not directly remove data from third-party platforms. Instead, it maps your exposure and provides a structured remediation roadmap — including official opt-out links and removal guidance — so you can act efficiently and strategically."
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
      <Hero />
      
      {/* Result preview - immediately below hero */}
      <HomepageResultPreview />
      
      {/* Educational content */}
      <HomepageEducational />
      
      {/* Below fold sections - lazy loaded */}
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><WhatYouCanDiscover /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><TrustSignals /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><WhatWeDoSection /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><PlatformCapabilities includeSchema /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><ExposureIntelligenceSection /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div id="how-it-works" className="below-fold"><HowItWorks /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div id="features" className="below-fold"><WhyChooseUs /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><CategoryComparisonStrip /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><WhatWeAre /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><WhoItsFor /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><EverydayUseCases /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><ProductEntryPoints /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><FreeVsPro /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><SampleReportPreview /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><TrustTransparency /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><WhyItMatters /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><FinalCTA /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><DiscoveryToProofSection /></div>
      </Suspense>
      
      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><FAQ /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold"><ForProfessionals /></div>
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <div className="below-fold">
          <div className="max-w-3xl mx-auto px-6 pb-12 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed">
              FootprintIQ is an ethical OSINT platform designed to help individuals understand their public digital footprint. It analyses publicly available information to identify potential account exposure and correlation risks, while emphasising accuracy, transparency, and responsible interpretation.
            </p>
          </div>
        </div>
      </Suspense>
      
      <Suspense fallback={null}>
        <ResponsibleUsePledge />
        <HomepageSEOLinks />
        <FloatingCTA />
        <ScrollToTop />
      </Suspense>
      <SocialProofToast />
      <ExitIntentModal />
      <Footer />
    </>
  );
}
