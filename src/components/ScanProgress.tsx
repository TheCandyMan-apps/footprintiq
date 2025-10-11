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
}

const scanSteps = [
  { icon: Search, label: "Searching public records", key: "public" },
  { icon: Database, label: "Scanning data broker sites", key: "brokers" },
  { icon: Globe, label: "Checking social networks", key: "social" },
  { icon: Shield, label: "Analyzing exposure risk", key: "analyze" },
];

export const ScanProgress = ({ onComplete, scanData, userId }: ScanProgressProps) => {
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

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Scan data brokers
        setCurrentStep(1);
        setProgress(35);

        const mockDataSources = [
          { name: "PeopleSearchNow", category: "People Search", url: "https://example.com", risk_level: "high" as const, data_found: ["Name", "Email", "Phone", "Address"] },
          { name: "WhitePages", category: "Public Records", url: "https://example.com", risk_level: "high" as const, data_found: ["Name", "Phone", "Age"] },
          { name: "Spokeo", category: "Data Broker", url: "https://example.com", risk_level: "medium" as const, data_found: ["Name", "Email", "Relatives"] },
          { name: "BeenVerified", category: "Background Check", url: "https://example.com", risk_level: "medium" as const, data_found: ["Name", "Address History"] },
          { name: "Intelius", category: "Data Broker", url: "https://example.com", risk_level: "low" as const, data_found: ["Name", "Email"] },
        ];

        const { error: dataSourceError } = await supabase
          .from("data_sources")
          .insert(mockDataSources.map(ds => ({
            scan_id: scan.id,
            ...ds,
          })));

        if (dataSourceError) throw dataSourceError;

        await new Promise(resolve => setTimeout(resolve, 2500));

        // Step 3: Scan social media
        setCurrentStep(2);
        setProgress(65);

        let socialProfileCount = 0;

        if (scanData.username) {
          const cleanUsername = scanData.username.startsWith('@') 
            ? scanData.username.slice(1) 
            : scanData.username;

          const mockSocialProfiles = [
            { platform: "Twitter/X", username: `@${cleanUsername}`, profile_url: `https://twitter.com/${cleanUsername}`, found: true, followers: "1.2K", last_active: "2 days ago" },
            { platform: "Instagram", username: `@${cleanUsername}`, profile_url: `https://instagram.com/${cleanUsername}`, found: true, followers: "3.5K", last_active: "1 day ago" },
            { platform: "Facebook", username: cleanUsername, profile_url: `https://facebook.com/${cleanUsername}`, found: true, last_active: "1 week ago" },
            { platform: "LinkedIn", username: cleanUsername, profile_url: `https://linkedin.com/in/${cleanUsername}`, found: true, last_active: "3 days ago" },
            { platform: "TikTok", username: `@${cleanUsername}`, profile_url: `https://tiktok.com/@${cleanUsername}`, found: true, followers: "892", last_active: "5 hours ago" },
            { platform: "Reddit", username: `u/${cleanUsername}`, profile_url: `https://reddit.com/user/${cleanUsername}`, found: true, last_active: "12 hours ago" },
            { platform: "GitHub", username: cleanUsername, profile_url: `https://github.com/${cleanUsername}`, found: true, followers: "45", last_active: "2 weeks ago" },
            { platform: "YouTube", username: `@${cleanUsername}`, profile_url: `https://youtube.com/@${cleanUsername}`, found: true, followers: "567", last_active: "1 month ago" },
          ];

          const { error: socialError } = await supabase
            .from("social_profiles")
            .insert(mockSocialProfiles.map(sp => ({
              scan_id: scan.id,
              ...sp,
            })));

          if (socialError) throw socialError;

          socialProfileCount = mockSocialProfiles.length;
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 4: Calculate privacy score
        setCurrentStep(3);
        setProgress(90);

        const highRiskCount = mockDataSources.filter(ds => ds.risk_level === 'high').length;
        const mediumRiskCount = mockDataSources.filter(ds => ds.risk_level === 'medium').length;
        const lowRiskCount = mockDataSources.filter(ds => ds.risk_level === 'low').length;
        
        const privacyScore = Math.max(0, 100 - (highRiskCount * 15 + mediumRiskCount * 10 + lowRiskCount * 5 + socialProfileCount * 2));

        const { error: updateError } = await supabase
          .from("scans")
          .update({
            privacy_score: privacyScore,
            total_sources_found: mockDataSources.length + socialProfileCount,
            high_risk_count: highRiskCount,
            medium_risk_count: mediumRiskCount,
            low_risk_count: lowRiskCount,
          })
          .eq("id", scan.id);

        if (updateError) throw updateError;

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
  }, [onComplete, scanData, userId, toast]);

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