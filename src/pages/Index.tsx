import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { TrustSignals } from "@/components/TrustSignals";
import { Testimonials } from "@/components/Testimonials";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleStartScan = () => {
    navigate("/auth");
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero onStartScan={handleStartScan} />
      <TrustSignals />
      <HowItWorks />
      <section id="features">
        <WhyChooseUs />
      </section>
      <Testimonials />
      <section id="pricing">
        <Pricing />
      </section>
      <FAQ />
      <Footer />
    </main>
  );
};

export default Index;
