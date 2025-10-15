import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { ScanForm, type ScanFormData } from "@/components/ScanForm";
import { ScanProgress } from "@/components/ScanProgress";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

type Step = "form" | "scanning";

const ScanPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("form");
  const [scanData, setScanData] = useState<ScanFormData | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [scanCount, setScanCount] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
      
      // Get user subscription tier
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("subscription_tier")
        .eq("user_id", session.user.id)
        .single();
      
      if (userRole) {
        setSubscriptionTier(userRole.subscription_tier);
      }
      
      // Get scan count
      const { count } = await supabase
        .from("scans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);
      
      setScanCount(count || 0);
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleFormSubmit = (data: ScanFormData) => {
    // Check if free user has exceeded scan limit
    if (subscriptionTier === "free" && scanCount >= 1) {
      toast({
        title: "Scan Limit Reached",
        description: "Free users get 1 scan. Upgrade to Premium for unlimited scans and full data access.",
        variant: "destructive",
      });
      navigate("/scan#pricing");
      return;
    }
    
    setScanData(data);
    setCurrentStep("scanning");
  };

  const handleScanComplete = (scanId: string) => {
    navigate(`/results/${scanId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <SEO
        title="Start Your Digital Footprint Scan | FootprintIQ OSINT Scanner"
        description="Run a comprehensive OSINT scan to check your digital footprint. Detect email breaches, exposed data, and vulnerabilities across 100+ sources. Free privacy check."
        canonical="https://footprintiq.com/scan"
      />
      <main className="min-h-screen bg-background">
        {currentStep === "form" && <ScanForm onSubmit={handleFormSubmit} />}
        {currentStep === "scanning" && scanData && (
          <ScanProgress 
            onComplete={handleScanComplete} 
            scanData={scanData}
            userId={user.id}
            subscriptionTier={subscriptionTier}
          />
        )}
      </main>
    </>
  );
};

export default ScanPage;