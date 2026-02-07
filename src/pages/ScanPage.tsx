import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedScanForm } from "@/components/scan/UnifiedScanForm";
import { ScanProgress } from "@/components/ScanProgress";
import { UpgradeDialog } from "@/components/UpgradeDialog";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/hooks/useWorkspace";
import { canRunScan } from "@/lib/billing/quotas";
import type { User } from "@supabase/supabase-js";
import type { UnifiedScanConfig, ScanMode, EnhancerKey } from "@/lib/scan/unifiedScanTypes";
import type { ScanFormData } from "@/components/ScanForm";

type Step = "form" | "scanning";

const ScanPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("form");
  const [scanData, setScanData] = useState<ScanFormData & { scanMode?: ScanMode; enhancers?: EnhancerKey[] } | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState<boolean>(false);
  const { workspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?redirect=/scan");
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
        /**
         * UI-ONLY role check for display purposes.
         * SECURITY: Actual authorization enforced server-side via RLS policies.
         * DO NOT use this for access control decisions.
         * Server-side validation occurs in edge functions and RLS policies.
         */
        setIsAdmin(userRole.role === 'admin');
      } else {
        // default to free when no row exists
        setSubscriptionTier("free");
        setIsAdmin(false);
      }
      
      // NOTE: Scan gating is evaluated via workspace monthly limits (UX-only).
      // Server-side enforcement still occurs in backend functions and RLS.
    };

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth?redirect=/scan");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleFormSubmit = (config: UnifiedScanConfig) => {
    /**
     * UI-ONLY validation for display purposes.
     * SECURITY: Server enforces actual limits via RLS policies and edge functions.
     * DO NOT rely on this for security - it only improves UX by showing upgrade dialog.
     * Backend will reject unauthorized requests regardless of client state.
     */
    if (!isAdmin) {
      const quota = canRunScan(workspace ? {
        plan: workspace.plan,
        scans_used_monthly: workspace.scans_used_monthly ?? 0,
        scan_limit_monthly: workspace.scan_limit_monthly ?? null,
      } : null);

      if (!quota.allowed) {
        setShowUpgradeDialog(true);
        if (quota.message) {
          toast({
            title: "Upgrade required",
            description: quota.message,
            variant: "destructive",
          });
        }
        return;
      }
    }
    
    // Convert UnifiedScanConfig to ScanFormData for ScanProgress
    const formData: ScanFormData & { scanMode?: ScanMode; enhancers?: EnhancerKey[] } = {
      turnstile_token: config.turnstile_token,
      scanMode: config.scanMode,
      enhancers: config.enhancers,
    };
    
    switch (config.detectedType) {
      case "email":
        formData.email = config.query;
        break;
      case "phone":
        formData.phone = config.query;
        break;
      case "name":
        const parts = config.query.split(/\s+/);
        formData.firstName = parts[0];
        formData.lastName = parts.slice(1).join(" ");
        break;
      case "username":
      default:
        formData.username = config.query;
        break;
    }
    
    setScanData(formData);
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
        title="Free Digital Footprint Scanner — Check Your Online Presence | FootprintIQ"
        description="Scan your username, email, or phone number across 500+ platforms. Free OSINT tool to check data breaches, find public profiles, and discover where your personal information appears online."
        canonical="https://footprintiq.app/scan"
        schema={{
          breadcrumbs: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://footprintiq.app/" },
              { "@type": "ListItem", position: 2, name: "Scan", item: "https://footprintiq.app/scan" }
            ]
          }
        }}
      />
      <main className="min-h-screen bg-background">
        {currentStep === "form" && <UnifiedScanForm onSubmit={handleFormSubmit} subscriptionTier={subscriptionTier} />}
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
