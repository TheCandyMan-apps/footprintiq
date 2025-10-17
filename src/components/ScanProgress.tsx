import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Search, Database, Globe, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { ScanFormData } from "./ScanForm";

interface ScanProgressProps {
  onComplete: (scanId: string) => void;
  scanData: ScanFormData;
  userId: string;
  subscriptionTier: string;
  isAdmin?: boolean;
}

const scanSteps = [
  { icon: Search, label: "Searching public records", key: "public" },
  { icon: Database, label: "Scanning data broker sites", key: "brokers" },
  { icon: Globe, label: "Checking social networks", key: "social" },
  { icon: Search, label: "Reverse image search", key: "image" },
  { icon: Shield, label: "Analyzing exposure risk", key: "analyze" },
];

export const ScanProgress = ({ onComplete, scanData, userId, subscriptionTier, isAdmin = false }: ScanProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Utility to prevent indefinite hanging
  const withTimeout = async <T,>(promise: Promise<T>, ms: number, label = 'operation'): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const id = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      promise
        .then((val) => { clearTimeout(id); resolve(val); })
        .catch((err) => { clearTimeout(id); reject(err); });
    });
  };

  useEffect(() => {
    let isMounted = true;
    let createdScanId: string | null = null;
    
    const performScan = async () => {
      try {
        if (!isMounted) return;
        // Step 1: Create scan record
        setCurrentStep(0);
        setProgress(10);

        const scanType = scanData.username && !scanData.firstName && !scanData.lastName ? 'username' : 
                        scanData.firstName && scanData.lastName ? 'personal_details' : 'both';

        const { data: scan, error: scanError } = await supabase
          .from("scans")
          .insert({
            user_id: userId,
            scan_type: scanType,
            username: scanData.username,
            first_name: scanData.firstName,
            last_name: scanData.lastName,
            email: scanData.email,
            phone: scanData.phone,
          })
          .select()
          .single();

        if (scanError) throw scanError;
        createdScanId = scan.id;

        // Fire-and-forget: kick off OSINT scan in the background and immediately navigate to results
        // This prevents the UI from hanging if providers are slow
        try {
          void supabase.functions.invoke('osint-scan', {
            body: {
              scanId: scan.id,
              scanType,
              username: scanData.username,
              firstName: scanData.firstName,
              lastName: scanData.lastName,
              email: scanData.email,
              phone: scanData.phone,
            }
          }).catch((e) => console.warn('Background OSINT scan error:', e?.message || e));
        } catch (e: any) {
          console.warn('Failed to start background OSINT scan:', e?.message || e);
        }

        // Immediately complete and go to results; data will populate as the background task finishes
        setCurrentStep(4);
        setProgress(100);
        setTimeout(() => {
          if (isMounted) {
            onComplete(scan.id);
            // direct navigation fallback
            try { navigate(`/results/${scan.id}`); } catch {}
          }
        }, 300);
        return;


        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Progress update
        setCurrentStep(2);
        setProgress(65);

        // Step 4: Reverse image search
        setCurrentStep(3);
        setProgress(75);

        let imageResults = 0;

        if (scanData.imageFile) {
          const fileExt = scanData.imageFile.name.split('.').pop();
          const fileName = `${scan.id}_${Date.now()}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;

          // Upload image to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('scan-images')
            .upload(filePath, scanData.imageFile);

          if (!uploadError) {
            // Create a signed URL since the bucket is private
            const { data: signed, error: signedError } = await supabase.storage
              .from('scan-images')
              .createSignedUrl(filePath, 60 * 60);

            if (!signedError && signed?.signedUrl) {
              // Call reverse image search edge function with timeout
              try {
                const res = await withTimeout(
                  supabase.functions.invoke('reverse-image-search', {
                    body: { imageUrl: signed.signedUrl, scanId: scan.id }
                  }),
                  20000,
                  'Reverse image search'
                );
                if (res?.data) {
                  imageResults = (res.data as any).resultsCount || 0;
                }
              } catch (e) {
                console.warn('Reverse image search skipped:', (e as any)?.message || e);
              }
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 5: Finalize
        setCurrentStep(4);
        setProgress(90);

        // Get the updated scan data with results from osint-scan function
        const { data: finalScan, error: finalError } = await supabase
          .from("scans")
          .select("*")
          .eq("id", scan.id)
          .maybeSingle();

        if (finalError) throw finalError;

        // For free users (non-admin), limit the data shown
        if (!isAdmin && subscriptionTier === "free") {
          // Limit data sources to 3
          const { data: allDataSources } = await supabase
            .from("data_sources")
            .select("*")
            .eq("scan_id", scan.id);
          
          if (allDataSources && allDataSources.length > 3) {
            const idsToKeep = allDataSources.slice(0, 3).map(ds => ds.id);
            await supabase
              .from("data_sources")
              .delete()
              .eq("scan_id", scan.id)
              .not("id", "in", `(${idsToKeep.join(",")})`);
          }

          // Limit social profiles to 3
          const { data: allSocial } = await supabase
            .from("social_profiles")
            .select("*")
            .eq("scan_id", scan.id);
          
          if (allSocial && allSocial.length > 3) {
            const idsToKeep = allSocial.slice(0, 3).map(sp => sp.id);
            await supabase
              .from("social_profiles")
              .delete()
              .eq("scan_id", scan.id)
              .not("id", "in", `(${idsToKeep.join(",")})`);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (!isMounted) return;

        setProgress(100);

        setTimeout(() => {
          if (isMounted) {
            onComplete(scan.id);
          }
        }, 500);

      } catch (error: any) {
        if (!isMounted) return;
        
        console.error("Scan error:", error);
        toast({
          title: "Scan issue",
          description: error?.message || "We hit a snag. Finishing in the background if possible.",
          variant: "destructive",
        });
        // Fallback: if scan record exists, proceed to results to avoid hanging UI
        if (createdScanId) {
          setProgress(100);
          setTimeout(() => {
            if (isMounted) {
              onComplete(createdScanId as string);
            }
          }, 500);
        } else {
          setErrorMsg("We couldn’t start the scan. Please return to the form and try again.");
        }
      }
    };

    // Safety net: never hang more than 35s
    const t = window.setTimeout(() => {
      if (isMounted && createdScanId) {
        setProgress(100);
        onComplete(createdScanId);
        try { navigate(`/results/${createdScanId}`); } catch {}
      }
    }, 35000);

    performScan();

    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [onComplete, scanData, userId, subscriptionTier, isAdmin, toast]);
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Scanning Your Digital Footprint</h2>
          <p className="text-muted-foreground">
            This may take a few moments while we search across the web
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive">
            {errorMsg}
            <div className="mt-3">
              <button
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
                onClick={() => (window.location.href = '/scan')}
              >
                Return to form
              </button>
            </div>
          </div>
        )}

        <div className="space-y-8">
          <Progress value={progress} className="h-2" />
          
          <div className="space-y-4">
            {scanSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-primary/10 border border-primary/20' : 
                    isCompleted ? 'bg-secondary/50' : 'bg-secondary/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive ? 'bg-primary text-primary-foreground shadow-glow' :
                    isCompleted ? 'bg-accent text-accent-foreground' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`transition-all duration-300 ${
                    isActive ? 'text-foreground font-medium' : 
                    isCompleted ? 'text-foreground/80' : 
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <div className="ml-auto flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};