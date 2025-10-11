import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ScanForm, type ScanFormData } from "@/components/ScanForm";
import { ScanProgress } from "@/components/ScanProgress";
import type { User } from "@supabase/supabase-js";

type Step = "form" | "scanning";

const ScanPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("form");
  const [scanData, setScanData] = useState<ScanFormData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

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
    <main className="min-h-screen bg-background">
      {currentStep === "form" && <ScanForm onSubmit={handleFormSubmit} />}
      {currentStep === "scanning" && scanData && (
        <ScanProgress 
          onComplete={handleScanComplete} 
          scanData={scanData}
          userId={user.id}
        />
      )}
    </main>
  );
};

export default ScanPage;