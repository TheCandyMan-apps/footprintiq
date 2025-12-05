import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/hooks/useWorkspace';

import { getPlan } from '@/lib/billing/tiers';

function buildProvidersList(
  type: 'email' | 'username' | 'domain' | 'phone',
  workspacePlan: string | null | undefined,
  customProviders?: string[]
): string[] {
  const plan = getPlan(workspacePlan);
  const allowedProviders = plan.allowedProviders;
  
  let providers: string[] = [];
  
  if (type === 'username') {
    // Start with tier-allowed providers only
    if (allowedProviders.includes('maigret')) providers.push('maigret');
    if (allowedProviders.includes('sherlock')) {
      providers.push('sherlock');
    }
    if (allowedProviders.includes('gosearch')) providers.push('gosearch');
  }
  
  if (type === 'email') {
    providers.push('holehe');
  }

  // If custom providers specified, filter by tier allowance
  if (customProviders && customProviders.length > 0) {
    const filtered = customProviders
      .filter(Boolean)
      .filter(p => allowedProviders.includes((p ?? '').toLowerCase()));
    providers = Array.from(new Set([...providers, ...filtered]));
  }

  return providers;
}

export interface AdvancedScanOptions {
  deepWeb?: boolean;
  socialMedia?: boolean;
  faceRecognition?: boolean;
  behavioralAnalysis?: boolean;
  threatForecasting?: boolean;
  correlationEngine?: boolean;
  osintScraper?: boolean;
  osintKeywords?: string[];
  darkwebScraper?: boolean;
  darkwebSearch?: string;
  darkwebUrls?: string[];
  darkwebDepth?: number;
  darkwebPages?: number;
  providers?: string[];
  useN8n?: boolean; // Option to force n8n usage
}

export interface ScanProgress {
  stage: string;
  progress: number;
  message: string;
}

export function useAdvancedScan() {
  const { workspace } = useWorkspace();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState<ScanProgress>({
    stage: 'idle',
    progress: 0,
    message: '',
  });

  const startAdvancedScan = async (
    scanData: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    },
    options: AdvancedScanOptions = {}
  ) => {
    setIsScanning(true);
    setProgress({ stage: 'initializing', progress: 0, message: 'Starting scan...' });

    try {
      // Create initial scan via orchestrator (expects type, value, workspaceId)
      if (!workspace?.id) {
        throw new Error('No workspace selected');
      }

      let type: 'email' | 'username' | 'domain' | 'phone';
      let value: string | undefined;

      if (scanData.email) {
        type = 'email';
        value = scanData.email;
      } else if (scanData.username) {
        type = 'username';
        value = scanData.username;
      } else if (scanData.phone) {
        type = 'phone';
        value = scanData.phone;
      } else {
        throw new Error('Please provide an email, username, or phone');
      }

      let scanId: string;

      // Use n8n for username scans (bypasses edge function timeout issues)
      if (type === 'username') {
        console.log('[useAdvancedScan] Using n8n for username scan');
        setProgress({ stage: 'initializing', progress: 5, message: 'Queuing scan via n8n...' });
        
        const { data: n8nData, error: n8nError } = await supabase.functions.invoke('n8n-scan-trigger', {
          body: {
            username: value,
            workspaceId: workspace.id,
            scanType: 'username',
          },
        });

        if (n8nError) {
          console.error('[useAdvancedScan] n8n trigger error:', n8nError);
          throw new Error(n8nError.message || 'Failed to trigger n8n scan');
        }

        if (!n8nData?.scanId && !n8nData?.id) {
          throw new Error('n8n scan trigger failed - no scan ID returned');
        }

        scanId = n8nData.scanId || n8nData.id;
        console.log(`[useAdvancedScan] n8n scan queued: ${scanId}`);
        
        setProgress({ stage: 'scanning', progress: 30, message: 'Scan running via n8n (no timeout!)...' });
        toast.success('Scan queued successfully via n8n');

      } else {
        // Use traditional scan-orchestrate for email/phone scans
        console.log(`[useAdvancedScan] Using scan-orchestrate for ${type} scan`);
        
        const { data: orchestrateData, error: orchestrateError } = await supabase.functions.invoke('scan-orchestrate', {
          body: {
            type,
            value: value!,
            workspaceId: workspace.id,
            options: {
              includeDarkweb: !!options.deepWeb,
              providers: buildProvidersList(type, workspace?.subscription_tier, options.providers),
              premium: {
                socialMediaFinder: !!options.socialMedia,
                osintScraper: !!options.osintScraper,
                osintKeywords: options.osintKeywords,
                darkwebScraper: !!options.darkwebScraper,
                darkwebSearch: options.darkwebSearch,
                darkwebUrls: options.darkwebUrls,
                darkwebDepth: options.darkwebDepth,
                darkwebPages: options.darkwebPages,
              },
            },
          },
        });

        if (orchestrateError) {
          console.error('[useAdvancedScan] Orchestrate error:', orchestrateError);
          
          // Extract structured error if available
          const errorData = orchestrateError as Record<string, unknown>;
          const errorCode = (errorData?.code || '') as string;
          const errorMessage = (errorData?.message || orchestrateError.message || 'Failed to start scan') as string;
          const errorDetails = errorData?.details;
          
          // Handle tier restriction errors with helpful message
          if (errorCode === 'no_providers_available_for_tier') {
            const details = errorDetails as Record<string, string[]> | undefined;
            const blockedProviders = details?.blockedProviders || [];
            const allowedProviders = details?.allowedProviders || [];
            
            const error = new Error(
              `Cannot start scan: ${blockedProviders.join(', ')} require${blockedProviders.length === 1 ? 's' : ''} a higher plan. ` +
              `Available providers: ${allowedProviders.join(', ')}`
            ) as Error & { code?: string; details?: unknown };
            error.code = errorCode;
            error.details = errorDetails;
            throw error;
          }
          
          // Re-throw with structured error info
          const error = new Error(errorMessage) as Error & { code?: string; details?: unknown };
          error.code = errorCode;
          error.details = errorDetails;
          throw error;
        }
        
        if (!orchestrateData?.scanId) throw new Error('Scan orchestration failed');
        scanId = orchestrateData.scanId as string;
        
        setProgress({ stage: 'scanning', progress: 30, message: 'Scanning data sources...' });
      }
      
      // Clear isScanning immediately so UI updates
      setIsScanning(false);

      // Return scanId immediately so progress dialog can open
      const scan = { id: scanId };

      // Run optional follow-ups in background (non-blocking)
      void (async () => {
        try {
          // Optional: Dark web monitoring
          if (options.deepWeb && (scanData.email || scanData.username)) {
            setProgress({ stage: 'darkweb', progress: 40, message: 'Scanning dark web...' });
            
            const targetValue = scanData.email || scanData.username!;
            const { error: darkwebError } = await supabase
              .from('darkweb_targets')
              .insert({
                workspace_id: workspace!.id,
                type: scanData.email ? 'email' : 'username',
                value: targetValue,
                active: true,
              });

            if (!darkwebError) {
              await supabase.functions.invoke('darkweb/monitor', {
                body: { target: targetValue },
              });
            }
          }

          // Optional: Face recognition - skip if no image available
          if (options.faceRecognition) {
            setProgress({ stage: 'face', progress: 50, message: 'Running face recognition...' });
            await supabase.functions.invoke('reverse-image-search', {
              body: { scanId },
            });
          }

          // Optional: Behavioral analysis
          if (options.behavioralAnalysis) {
            setProgress({ stage: 'behavioral', progress: 60, message: 'Analyzing behavior patterns...' });
            await supabase.functions.invoke('behavioral-analysis', {
              body: { scanId },
            });
          }

          // Optional: Correlation engine
          if (options.correlationEngine) {
            setProgress({ stage: 'correlation', progress: 70, message: 'Correlating data...' });
            await supabase.functions.invoke('correlation-engine', {
              body: { scanId },
            });
          }

          // AI Analysis
          setProgress({ stage: 'ai', progress: 80, message: 'Running AI analysis...' });
          await supabase.functions.invoke('ai-analysis', {
            body: { scanId },
          });

          // Index for RAG
          setProgress({ stage: 'indexing', progress: 90, message: 'Indexing for AI...' });
          await supabase.functions.invoke('ai-rag-indexer', {
            body: { scanId },
          });

          // Optional: Generate threat forecast
          if (options.threatForecasting) {
            setProgress({ stage: 'forecasting', progress: 95, message: 'Generating threat forecast...' });
            await supabase.functions.invoke('threat-forecast-generator');
          }

          setProgress({ stage: 'complete', progress: 100, message: 'Scan complete!' });
          toast.success('Advanced scan completed successfully');
        } catch (bgError) {
          console.error('Background task error:', bgError);
          // Don't throw - scan ID is already returned
        }
      })();

      return scan;

    } catch (error) {
      console.error('Advanced scan error:', error);
      toast.error('Advanced scan failed: ' + (error as Error).message);
      setIsScanning(false);
      throw error;
    }
  };

  return {
    startAdvancedScan,
    isScanning,
    progress,
  };
}
