import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useNavigate } from 'react-router-dom';

import { getPlan } from '@/lib/billing/tiers';
import { useTurnstileGating, withTurnstileToken } from '@/hooks/useTurnstileGating';

// Custom error class for tier-related errors
class TierRestrictionError extends Error {
  code: string;
  scanType: string;
  blockedProviders: string[];
  
  constructor(message: string, scanType: string, blockedProviders: string[] = [], code: string = 'no_providers_available_for_tier') {
    super(message);
    this.name = 'TierRestrictionError';
    this.code = code;
    this.scanType = scanType;
    this.blockedProviders = blockedProviders;
  }
}

function buildProvidersList(
  type: 'email' | 'username' | 'domain' | 'phone',
  workspacePlan: string | null | undefined,
  customProviders?: string[]
): string[] {
  const plan = getPlan(workspacePlan);
  const allowedProviders = plan.allowedProviders || [];
  
  let providers: string[] = [];
  
  // Define default providers per scan type - only add if allowed by plan
  const defaultProvidersByType: Record<string, string[]> = {
    username: ['maigret', 'sherlock', 'gosearch'],
    email: ['holehe', 'hibp', 'dehashed'],
    phone: ['phoneinfoga', 'truecaller', 'numverify'],
    domain: ['shodan', 'virustotal', 'securitytrails'],
  };
  
  const typeProviders = defaultProvidersByType[type] || [];
  
  // Only add providers that are allowed by the plan
  for (const provider of typeProviders) {
    if (allowedProviders.includes(provider)) {
      providers.push(provider);
    }
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

// Helper to check if a scan type is available for a workspace
export function isScanTypeAvailable(
  type: 'email' | 'username' | 'domain' | 'phone',
  workspacePlan: string | null | undefined,
  freeAnyScanCredits: number = 0
): { available: boolean; reason?: string; blockedProviders?: string[] } {
  const providers = buildProvidersList(type, workspacePlan);
  const normalizedPlan = (workspacePlan || 'free').toLowerCase();
  const isFree = normalizedPlan === 'free';
  
  // Username scans are always available
  if (type === 'username') {
    return { available: providers.length > 0 };
  }
  
  // For non-username scans on free tier, check credits
  if (isFree) {
    if (freeAnyScanCredits > 0) {
      return { available: true };
    }
    
    // No credits left - blocked
    const blockedProviders = type === 'email' ? ['holehe'] : 
                             type === 'phone' ? ['phoneinfoga'] : [];
    return {
      available: false,
      reason: `${type.charAt(0).toUpperCase() + type.slice(1)} scans require Pro plan. Your free advanced scan has been used.`,
      blockedProviders
    };
  }
  
  // Check if plan has any providers for this type
  if (providers.length === 0) {
    return {
      available: false,
      reason: `No providers available for ${type} scans on your current plan.`,
      blockedProviders: []
    };
  }
  
  return { available: true };
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
  useN8n?: boolean;
  turnstileToken?: string | null;
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
  const { requiresTurnstile, validateToken, isBypassTier } = useTurnstileGating();

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
      // Validate Turnstile token if required
      if (requiresTurnstile && !isBypassTier) {
        const validation = validateToken(options.turnstileToken || null);
        if (!validation.valid) {
          throw new Error(validation.message || 'Please complete the verification to continue.');
        }
      }
      
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
        
        const n8nBody = withTurnstileToken({
          username: value,
          workspaceId: workspace.id,
          scanType: 'username',
        }, options.turnstileToken);
        
        const { data: n8nData, error: n8nError } = await supabase.functions.invoke('n8n-scan-trigger', {
          body: n8nBody,
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
        
        // PRE-CHECK: Combined tier + credit validation
        const freeCredits = ((workspace as any)?.free_any_scan_credits || 0);
        const availability = isScanTypeAvailable(type, workspace?.subscription_tier, freeCredits);
        
        if (!availability.available) {
          throw new TierRestrictionError(
            availability.reason || 'This scan type is not available on your current plan.',
            type,
            availability.blockedProviders || [],
            freeCredits <= 0 ? 'free_any_scan_exhausted' : 'no_providers_available_for_tier'
          );
        }
        
        // Build providers list for the API call
        const providersForScan = buildProvidersList(type, workspace?.subscription_tier, options.providers);
        if (providersForScan.length === 0) {
          throw new TierRestrictionError(
            `No providers available for ${type} scans on your current plan. Upgrade to Pro for access.`,
            type,
            [],
            'no_providers_available_for_tier'
          );
        }
        
        const orchestrateBody = withTurnstileToken({
          type,
          value: value!,
          workspaceId: workspace.id,
          options: {
            includeDarkweb: !!options.deepWeb,
            providers: providersForScan,
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
        }, options.turnstileToken);
        
        const { data: orchestrateData, error: orchestrateError } = await supabase.functions.invoke('scan-orchestrate', {
          body: orchestrateBody,
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
      
      // Handle tier restriction errors with upgrade prompt
      const errorCode = (error as any)?.code || '';
      if (error instanceof TierRestrictionError || 
          errorCode === 'no_providers_available_for_tier' ||
          errorCode === 'free_any_scan_exhausted') {
        
        const isFreeAnyScanExhausted = errorCode === 'free_any_scan_exhausted';
        
        toast.error(
          isFreeAnyScanExhausted 
            ? 'Free advanced scan credit used'
            : (error as TierRestrictionError).scanType === 'email' 
              ? 'Email scanning requires Pro plan'
              : 'Upgrade required for this scan type',
          {
            description: isFreeAnyScanExhausted
              ? 'Email/phone/name scans require Pro. Username scans remain free.'
              : (error as Error).message,
            action: {
              label: 'Upgrade Now',
              onClick: () => window.location.href = '/settings/billing'
            },
            duration: 8000
          }
        );
      } else {
        toast.error('Advanced scan failed: ' + (error as Error).message);
      }
      
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
