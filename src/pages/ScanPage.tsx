import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { ScanForm, type ScanFormData } from "@/components/ScanForm";
import { ScanProgress } from "@/components/ScanProgress";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

type Step = "form" | "scanning";

const ScanPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("form");
  const [scanData, setScanData] = useState<ScanFormData | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [scanCount, setScanCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);
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
      
      // Get user subscription tier and role
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("subscription_tier, role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (roleError) {
        console.warn("user_roles fetch error:", roleError);
      }
      
      if (userRole) {
        setSubscriptionTier(userRole.subscription_tier);
        setIsAdmin(userRole.role === 'admin');
      } else {
        // default to free when no row exists
        setSubscriptionTier("free");
        setIsAdmin(false);
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
    // Admin users have unrestricted access
    if (!isAdmin && subscriptionTier === "free" && scanCount >= 1) {
      setShowUpgradeDialog(true);
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
        title="Scan Your Digital Footprint — FootprintIQ OSINT Scanner"
        description="Free OSINT scanner for emails, usernames, domains, phones and IPs. Check data breaches with Have I Been Pwned, Shodan, VirusTotal and more."
        canonical="https://footprintiq.app/scan"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://footprintiq.app/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Scan",
              "item": "https://footprintiq.app/scan"
            }
          ]
        }}
      />
      <main className="min-h-screen bg-background">
        {currentStep === "form" && <ScanForm onSubmit={handleFormSubmit} />}
        {currentStep === "scanning" && scanData && (
          <ScanProgress 
            onComplete={handleScanComplete} 
            scanData={scanData}
            userId={user.id}
            subscriptionTier={subscriptionTier}
            isAdmin={isAdmin}
          />
        )}
        <UpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog} 
        />
      </main>
    </>
  );
};

export default ScanPage;