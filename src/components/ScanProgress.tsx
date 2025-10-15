import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Search, Database, Globe, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ScanFormData } from "./ScanForm";

interface ScanProgressProps {
  onComplete: (scanId: string) => void;
  scanData: ScanFormData;
  userId: string;
  subscriptionTier: string;
}

const scanSteps = [
  { icon: Search, label: "Searching public records", key: "public" },
  { icon: Database, label: "Scanning data broker sites", key: "brokers" },
  { icon: Globe, label: "Checking social networks", key: "social" },
  { icon: Search, label: "Reverse image search", key: "image" },
  { icon: Shield, label: "Analyzing exposure risk", key: "analyze" },
];

export const ScanProgress = ({ onComplete, scanData, userId, subscriptionTier }: ScanProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const performScan = async () => {
      try {
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

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Step 2: Call OSINT scan edge function for real data
        setCurrentStep(1);
        setProgress(30);

        console.log('Invoking osint-scan edge function...');
        const { data: osintResult, error: osintError } = await supabase.functions.invoke('osint-scan', {
          body: {
            scanId: scan.id,
            scanType,
            username: scanData.username,
            firstName: scanData.firstName,
            lastName: scanData.lastName,
            email: scanData.email,
            phone: scanData.phone,
          }
        });

        if (osintError) {
          console.error('OSINT scan error:', osintError);
          throw new Error('Failed to complete OSINT scan');
        }

        console.log('OSINT scan completed:', osintResult);

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
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('scan-images')
              .getPublicUrl(filePath);

            // Call reverse image search edge function
            const { data: imageSearchData, error: imageSearchError } = await supabase.functions
              .invoke('reverse-image-search', {
                body: { imageUrl: publicUrl, scanId: scan.id }
              });

            if (!imageSearchError && imageSearchData) {
              imageResults = imageSearchData.resultsCount || 0;
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
          .single();

        if (finalError) throw finalError;

        // For free users, limit the data shown
        if (subscriptionTier === "free") {
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

        setProgress(100);

        setTimeout(() => {
          onComplete(scan.id);
        }, 500);

      } catch (error: any) {
        console.error("Scan error:", error);
        toast({
          title: "Scan failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    performScan();
  }, [onComplete, scanData, userId, subscriptionTier, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">Scanning Your Digital Footprint</h2>
          <p className="text-muted-foreground">
            This may take a few moments while we search across the web
          </p>
        </div>

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