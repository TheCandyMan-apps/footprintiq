import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, XCircle, Loader2, Database, Shield, Search, Globe, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { updateStreakOnScan } from "@/lib/updateStreakOnScan";
import type { ScanFormData } from "./ScanForm";

interface ScanProgressProps {
  onComplete: (scanId: string) => void;
  scanData: ScanFormData;
  userId: string;
  subscriptionTier: string;
  isAdmin?: boolean;
}

type ProviderStatus = 'pending' | 'loading' | 'success' | 'failed';

interface Provider {
  id: string;
  name: string;
  icon: any;
  status: ProviderStatus;
  message?: string;
  resultCount?: number;
}

const initialProviders: Provider[] = [
  { id: 'hibp', name: 'HaveIBeenPwned', icon: Shield, status: 'pending' },
  { id: 'predicta', name: 'Predicta Social', icon: Search, status: 'pending' },
  { id: 'shodan', name: 'Shodan', icon: Database, status: 'pending' },
  { id: 'virustotal', name: 'VirusTotal', icon: Globe, status: 'pending' },
  { id: 'email', name: 'Email Hunter', icon: Mail, status: 'pending' },
  { id: 'phone', name: 'Phone Lookup', icon: Phone, status: 'pending' },
];

export const ScanProgress = ({ onComplete, scanData, userId, subscriptionTier, isAdmin = false }: ScanProgressProps) => {
  const [progress, setProgress] = useState(0);
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateProvider = (id: string, updates: Partial<Provider>) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // WebSocket connection for real-time provider updates
  const connectToWebSocket = (scanId: string) => {
    const wsUrl = `wss://byuzgvauaeldjqxlrjci.supabase.co/functions/v1/scan-progress-ws`;
    console.log('[ScanProgress] Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[ScanProgress] WebSocket connected');
      ws.send(JSON.stringify({
        type: 'subscribe',
        scanId: scanId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[ScanProgress] Received update:', data);

        if (data.type === 'provider_update') {
          updateProvider(data.providerId, {
            status: data.status,
            message: data.message,
            resultCount: data.resultCount
          });
        } else if (data.type === 'subscribed') {
          console.log('[ScanProgress] Subscribed to scan:', data.scanId);
        }
      } catch (error) {
        console.error('[ScanProgress] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('[ScanProgress] WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('[ScanProgress] WebSocket disconnected');
    };

    return ws;
  };

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
    let websocket: WebSocket | null = null;
    
    const performScan = async () => {
      try {
        if (!isMounted) return;
        
        // Show skeleton briefly then start
        setTimeout(() => {
          if (isMounted) setIsInitializing(false);
        }, 500);
        
        // Step 1: Create scan record
        setProgress(10);

        // Fetch user's workspace
        const { data: workspaceMember } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', userId)
          .single();

        const scanType = scanData.username && !scanData.firstName && !scanData.lastName ? 'username' : 
                        scanData.firstName && scanData.lastName ? 'personal_details' : 'both';

        // Convert empty strings to null to avoid database validation errors
        const toNullIfEmpty = (val: string | undefined | null): string | null => 
          val && val.trim() ? val.trim() : null;

        const { data: scan, error: scanError } = await supabase
          .from("scans")
          .insert({
            user_id: userId,
            workspace_id: workspaceMember?.workspace_id || null,
            scan_type: scanType,
            username: toNullIfEmpty(scanData.username),
            first_name: toNullIfEmpty(scanData.firstName),
            last_name: toNullIfEmpty(scanData.lastName),
            email: toNullIfEmpty(scanData.email),
            phone: toNullIfEmpty(scanData.phone),
          })
          .select()
          .single();

        if (scanError) throw scanError;
        createdScanId = scan.id;

        // Connect to WebSocket for real-time provider updates
        websocket = connectToWebSocket(scan.id);
        setProgress(30);

        try {
          const body: Record<string, any> = {
            scanId: scan.id,
            scanType,
          };
          if (scanData.username && scanData.username.trim()) body.username = scanData.username.trim();
          if (scanData.firstName && scanData.firstName.trim()) body.firstName = scanData.firstName.trim();
          if (scanData.lastName && scanData.lastName.trim()) body.lastName = scanData.lastName.trim();
          if (scanData.email && scanData.email.trim()) body.email = scanData.email.trim();
          if (scanData.phone && scanData.phone.trim()) body.phone = scanData.phone.trim();

          // Actually wait for the scan to complete
          const invokeRes = await withTimeout(
            supabase.functions.invoke('osint-scan', { body }),
            90000,
            'OSINT scan'
          );
          
          if (invokeRes?.data?.diagnostics) {
            console.log('[Scan] Providers diagnostics:', invokeRes.data.diagnostics);
          }
        } catch (e: any) {
          console.warn('OSINT scan error:', e?.message || e);
        }

        if (!isMounted) return;
        setProgress(60);

        if (!isMounted) return;
        setProgress(90);

        // Poll for actual results
        let pollAttempts = 0;
        const maxPollAttempts = 10;
        let hasResults = false;
        
        while (pollAttempts < maxPollAttempts && isMounted && !hasResults) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          pollAttempts++;
          
          // Check if we have any results in either table
          const [sourcesResult, profilesResult] = await Promise.all([
            supabase.from('data_sources').select('id').eq('scan_id', scan.id).limit(1),
            supabase.from('social_profiles').select('id').eq('scan_id', scan.id).limit(1)
          ]);
          
          if ((sourcesResult.data && sourcesResult.data.length > 0) || 
              (profilesResult.data && profilesResult.data.length > 0)) {
            hasResults = true;
          }
          
          // Update progress gradually
          const progressIncrement = (100 - 90) / maxPollAttempts;
          setProgress(Math.min(90 + (pollAttempts * progressIncrement), 99));
        }
        
        // Final progress to 100%
        setProgress(100);

        // Update user streak
        await updateStreakOnScan(userId);

        // Navigate to results
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
      if (websocket) {
        websocket.close();
      }
    };
  }, [onComplete, scanData, userId, subscriptionTier, isAdmin, toast]);

  const getStatusIcon = (status: ProviderStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ProviderStatus) => {
    switch (status) {
      case 'success':
        return 'border-accent/20 bg-accent/5';
      case 'loading':
        return 'border-primary/20 bg-primary/5';
      case 'failed':
        return 'border-destructive/20 bg-destructive/5';
      case 'pending':
      default:
        return 'border-border bg-secondary/20';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <Card className="w-full max-w-2xl p-8 bg-gradient-card border-border shadow-card">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-3">Scanning Your Digital Footprint</h2>
          <p className="text-muted-foreground">
            Searching across multiple providers in real-time
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

        <div className="space-y-6">
          {/* Progress bar at the top */}
          <Progress value={progress} className="h-2" />
          
          {/* Provider list with real-time status or skeleton */}
          <div className="space-y-3">
            {isInitializing ? (
              // Show skeleton loaders during initialization
              Array.from({ length: 6 }).map((_, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border bg-secondary/20 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="w-5 h-5 rounded-full" />
                </div>
              ))
            ) : (
              // Show actual provider statuses
              providers.map((provider, index) => {
                const Icon = provider.icon;
                
                return (
                  <div 
                    key={provider.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 animate-fade-in ${getStatusColor(provider.status)}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{provider.name}</span>
                        {provider.message && (
                          <span className="text-sm text-muted-foreground">
                            — {provider.message}
                            {provider.resultCount !== undefined && provider.resultCount > 0 && (
                              <span className="ml-1 font-semibold text-accent">
                                ({provider.resultCount} {provider.resultCount === 1 ? 'result' : 'results'})
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      {getStatusIcon(provider.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};