import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProviderETAs, getProviderETA, formatETA, calculateRemainingETA } from './useProviderETAs';

export interface NarrativeItem {
  id: string;
  icon: 'search' | 'check' | 'database' | 'shield' | 'alert' | 'link' | 'loader';
  text: string;
  timestamp?: string;
  provider?: string;
  duration?: number;
  findingsCount?: number;
  isActive?: boolean;
  eta?: string; // Estimated time remaining for this provider
}

export interface ScanNarrative {
  items: NarrativeItem[];
  summary: string;
  totalPlatforms: number;
  totalFindings: number;
  scanDuration: number;
  isLoading: boolean;
  isComplete: boolean;
  estimatedTimeRemaining?: string; // Overall ETA for scan completion
}

interface ScanEvent {
  id: string;
  provider: string;
  stage: string;
  status: string | null;
  duration_ms: number | null;
  findings_count: number | null;
  created_at: string;
  error_message: string | null;
}

/**
 * Maps provider IDs to user-friendly action messages
 */
const PROVIDER_ACTION_MESSAGES: Record<string, { action: string; icon: NarrativeItem['icon'] }> = {
  // Username providers
  sherlock: { action: 'Searching social media profiles...', icon: 'search' },
  maigret: { action: 'Checking 500+ platforms for username...', icon: 'search' },
  gosearch: { action: 'Running advanced username intelligence...', icon: 'database' },
  whatsmyname: { action: 'Scanning known username databases...', icon: 'search' },
  
  // Email providers
  holehe: { action: 'Checking email registrations...', icon: 'search' },
  hibp: { action: 'Checking breach databases...', icon: 'shield' },
  dehashed: { action: 'Searching leaked credentials...', icon: 'shield' },
  clearbit: { action: 'Enriching email identity data...', icon: 'database' },
  fullcontact: { action: 'Looking up contact information...', icon: 'database' },
  ipqs_email: { action: 'Analyzing email reputation...', icon: 'shield' },
  perplexity_osint: { action: 'Running AI-powered research...', icon: 'database' },
  
  // Phone providers
  abstract_phone: { action: 'Analyzing carrier information...', icon: 'database' },
  numverify: { action: 'Validating phone number...', icon: 'check' },
  ipqs_phone: { action: 'Checking fraud indicators...', icon: 'shield' },
  twilio_lookup: { action: 'Verifying carrier data...', icon: 'database' },
  whatsapp_check: { action: 'Checking WhatsApp registration...', icon: 'link' },
  telegram_check: { action: 'Checking Telegram presence...', icon: 'link' },
  signal_check: { action: 'Checking Signal registration...', icon: 'link' },
  phone_osint: { action: 'Searching public mentions...', icon: 'search' },
  truecaller: { action: 'Looking up caller ID information...', icon: 'database' },
  phone_reputation: { action: 'Analyzing spam/scam indicators...', icon: 'shield' },
  phoneinfoga: { action: 'Running phone OSINT scan...', icon: 'search' },
  
  // Domain providers
  spiderfoot: { action: 'Crawling domain intelligence...', icon: 'search' },
  
  // Default
  default: { action: 'Processing scan...', icon: 'loader' },
};

function getProviderActionMessage(providerId: string): { action: string; icon: NarrativeItem['icon'] } {
  const normalized = providerId.toLowerCase().replace(/[_-]/g, '');
  
  // Try exact match first
  if (PROVIDER_ACTION_MESSAGES[providerId.toLowerCase()]) {
    return PROVIDER_ACTION_MESSAGES[providerId.toLowerCase()];
  }
  
  // Try normalized key match
  for (const [key, value] of Object.entries(PROVIDER_ACTION_MESSAGES)) {
    const normalizedKey = key.replace(/[_-]/g, '');
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      return value;
    }
  }
  
  return PROVIDER_ACTION_MESSAGES.default;
}

export function useScanNarrative(scanId: string, searchedValue: string, scanType: string): ScanNarrative {
  const { data: etaMap } = useProviderETAs();
  
  const { data: scanEvents, isLoading } = useQuery({
    queryKey: ['scan-events-narrative', scanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_events')
        .select('id, provider, stage, status, duration_ms, findings_count, created_at, error_message')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ScanEvent[];
    },
    enabled: !!scanId,
    staleTime: 10000,
    refetchInterval: (query) => {
      // Refetch every 2s if not complete
      const data = query.state.data;
      if (!data) return 2000;
      const hasComplete = data.some(e => e.stage === 'complete' || e.stage === 'completed');
      return hasComplete ? false : 2000;
    },
  });

  const narrative = useMemo(() => {
    if (!scanEvents || scanEvents.length === 0) {
      return {
        items: [{
          id: 'loading',
          icon: 'loader' as const,
          text: 'Initializing scan...',
          isActive: true,
        }],
        summary: '',
        totalPlatforms: 0,
        totalFindings: 0,
        scanDuration: 0,
        isLoading,
        isComplete: false,
      };
    }

    const items: NarrativeItem[] = [];
    let totalFindings = 0;
    let totalDuration = 0;
    const providers = new Set<string>();
    const completedProviders: { name: string; findings: number; duration: number; timestamp: string }[] = [];
    const activeProviders: { name: string; stage: string; startedAt: string; rawName: string }[] = [];
    const failedProviders: string[] = [];

    // Group events by provider
    const providerEvents = new Map<string, ScanEvent[]>();
    let firstEvent: ScanEvent | null = null;
    let lastEvent: ScanEvent | null = null;

    scanEvents.forEach((event) => {
      if (!firstEvent) firstEvent = event;
      lastEvent = event;

      const existing = providerEvents.get(event.provider) || [];
      existing.push(event);
      providerEvents.set(event.provider, existing);
      providers.add(event.provider);
    });

    // Process each provider's events
    providerEvents.forEach((events, provider) => {
      const latestEvent = events[events.length - 1];
      const completeEvent = events.find((e) => e.stage === 'complete' || e.stage === 'completed');
      const hasError = events.some((e) => e.status === 'error' || e.error_message);
      
      if (hasError) {
        failedProviders.push(formatProviderName(provider));
      } else if (completeEvent) {
        const findings = completeEvent.findings_count || 0;
        const duration = completeEvent.duration_ms || 0;
        totalFindings += findings;
        totalDuration += duration;
        completedProviders.push({
          name: formatProviderName(provider),
          findings,
          duration,
          timestamp: completeEvent.created_at,
        });
      } else {
        // Find the earliest event for this provider (start time)
        const startEvent = events[0];
        activeProviders.push({
          name: formatProviderName(provider),
          rawName: provider,
          stage: latestEvent.stage,
          startedAt: startEvent.created_at,
        });
      }
    });

    const isComplete = activeProviders.length === 0 && completedProviders.length > 0;
    const typeLabel = getTypeLabel(scanType);

    // Build narrative items based on completion state
    if (isComplete) {
      // COMPLETED STATE: Show compact "What we did" feed with timestamps
      const startTime = firstEvent ? formatTime(firstEvent.created_at) : '';
      const endTime = lastEvent ? formatTime(lastEvent.created_at) : '';
      
      // Step 1: Searched sources
      items.push({
        id: 'step-search',
        icon: 'search',
        text: `Searched ${estimatePlatformCount(providers.size)}+ platforms for "${searchedValue}"`,
        timestamp: startTime,
      });

      // Step 2: Found accounts (if any)
      const providersWithFindings = completedProviders.filter(p => p.findings > 0);
      if (providersWithFindings.length > 0) {
        const topProviders = providersWithFindings.slice(0, 2).map(p => p.name);
        items.push({
          id: 'step-found',
          icon: 'check',
          text: `Found ${totalFindings} account${totalFindings !== 1 ? 's' : ''} via ${topProviders.join(', ')}${providersWithFindings.length > 2 ? ` +${providersWithFindings.length - 2}` : ''}`,
          findingsCount: totalFindings,
        });
      }

      // Step 3: Checked username reuse / built connections
      if (totalFindings > 1) {
        items.push({
          id: 'step-connections',
          icon: 'link',
          text: `Built connection graph across ${totalFindings} profiles`,
        });
      }

      // Step 4: Breach check (if applicable)
      const breachProviders = ['hibp', 'breach', 'haveibeenpwned', 'leak', 'dehashed'];
      const hasBreachCheck = Array.from(providers).some((p) =>
        breachProviders.some((bp) => p.toLowerCase().includes(bp))
      );
      if (hasBreachCheck) {
        items.push({
          id: 'step-breach',
          icon: 'shield',
          text: 'Checked breach databases for exposure',
        });
      }

      // Step 5: Verified signals (if we have findings)
      if (totalFindings > 0) {
        items.push({
          id: 'step-verify',
          icon: 'database',
          text: `Verified signals and enriched metadata`,
        });
      }

      // Step 6: Finalized
      const durationSec = totalDuration > 0 ? `${(totalDuration / 1000).toFixed(1)}s` : '';
      items.push({
        id: 'step-complete',
        icon: 'check',
        text: `Scan complete${durationSec ? ` in ${durationSec}` : ''}`,
        timestamp: endTime,
      });

    } else {
      // RUNNING STATE: Show provider-specific messages
      const progressPct = providers.size > 0 
        ? Math.round((completedProviders.length / providers.size) * 100) 
        : 0;

      // Show active provider-specific messages (max 2 displayed) with ETAs
      if (activeProviders.length > 0) {
        const displayActive = activeProviders.slice(0, 2);
        
        displayActive.forEach((provider, idx) => {
          const providerKey = provider.name.toLowerCase().replace(/\s+/g, '');
          const { action, icon } = getProviderActionMessage(providerKey);
          
          // Calculate remaining time for this provider
          const estimatedDuration = getProviderETA(provider.rawName, etaMap);
          const elapsed = Date.now() - new Date(provider.startedAt).getTime();
          const remainingMs = Math.max(0, estimatedDuration - elapsed);
          const etaText = remainingMs > 0 ? formatETA(remainingMs) : '';
          
          items.push({
            id: `active-${providerKey}-${idx}`,
            icon,
            text: action,
            provider: provider.name,
            isActive: true,
            eta: etaText,
          });
        });
        
        // If more than 2 active, show a summary with combined ETA
        if (activeProviders.length > 2) {
          const remainingProviders = activeProviders.slice(2);
          const { formatted: combinedEta } = calculateRemainingETA(
            remainingProviders.map(p => ({ name: p.rawName, startedAt: p.startedAt })),
            etaMap
          );
          
          items.push({
            id: 'active-more',
            icon: 'loader',
            text: `+${activeProviders.length - 2} more providers running...`,
            isActive: true,
            eta: combinedEta,
          });
        }
      }

      // Show most recent completed provider with results
      if (completedProviders.length > 0) {
        const recentWithFindings = completedProviders
          .filter(p => p.findings > 0)
          .slice(-1)[0];
        
        if (recentWithFindings) {
          items.push({
            id: 'completed-recent',
            icon: 'check',
            text: `${recentWithFindings.name} found ${recentWithFindings.findings} account${recentWithFindings.findings !== 1 ? 's' : ''}`,
            provider: recentWithFindings.name,
            isActive: false,
          });
        }
      }

      // Show cumulative findings count
      if (totalFindings > 0) {
        items.push({
          id: 'live-found',
          icon: 'check',
          text: `${totalFindings} account${totalFindings !== 1 ? 's' : ''} found so far`,
          findingsCount: totalFindings,
          isActive: false,
        });
      }

      // Finalizing step (when near completion)
      if (progressPct >= 80 || (activeProviders.length === 1 && completedProviders.length >= 2)) {
        items.push({
          id: 'step-finalize',
          icon: 'loader',
          text: 'Finalizing results...',
          isActive: activeProviders.length <= 1,
        });
      }
    }

    // Generate summary
    const summary = isComplete 
      ? generateSummary(totalFindings, providers.size, completedProviders, typeLabel)
      : '';

    // Calculate overall remaining time
    const { formatted: estimatedTimeRemaining } = isComplete 
      ? { formatted: undefined }
      : calculateRemainingETA(
          activeProviders.map(p => ({ name: p.rawName, startedAt: p.startedAt })),
          etaMap
        );

    return {
      items: items.slice(0, 6), // Max 6 items
      summary,
      totalPlatforms: estimatePlatformCount(providers.size),
      totalFindings,
      scanDuration: totalDuration,
      isLoading,
      isComplete,
      estimatedTimeRemaining,
    };
  }, [scanEvents, searchedValue, scanType, isLoading, etaMap]);

  return narrative;
}

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatProviderName(provider: string): string {
  const nameMap: Record<string, string> = {
    sherlock: 'Sherlock',
    maigret: 'Maigret',
    holehe: 'Holehe',
    whatsmyname: 'WhatsMyName',
    phoneinfoga: 'PhoneInfoga',
    ipqs: 'IPQS',
    hibp: 'HaveIBeenPwned',
    numverify: 'Numverify',
    spiderfoot: 'SpiderFoot',
    gosearch: 'GoSearch',
  };

  const key = provider.toLowerCase().replace(/[_-]/g, '');
  return nameMap[key] || provider.charAt(0).toUpperCase() + provider.slice(1);
}

function getTypeLabel(scanType: string): string {
  switch (scanType) {
    case 'username':
      return 'username';
    case 'email':
      return 'email address';
    case 'phone':
      return 'phone number';
    case 'domain':
      return 'domain';
    default:
      return 'identifier';
  }
}

function estimatePlatformCount(providerCount: number): number {
  // Rough estimate based on known provider coverage
  return Math.max(providerCount * 50, 100);
}

function generateSummary(
  totalFindings: number,
  providerCount: number,
  completedProviders: { name: string; findings: number }[],
  typeLabel: string
): string {
  if (totalFindings === 0) {
    return `No accounts found for this ${typeLabel}. This may indicate a unique identifier or limited online presence.`;
  }

  const topProviders = completedProviders
    .filter((p) => p.findings > 0)
    .slice(0, 2)
    .map((p) => p.name);

  const providerText = topProviders.length > 0 ? ` Most results from ${topProviders.join(' and ')}.` : '';

  if (totalFindings === 1) {
    return `Found 1 account linked to this ${typeLabel}.${providerText}`;
  }

  if (totalFindings < 10) {
    return `Found ${totalFindings} accounts, indicating moderate online presence.${providerText}`;
  }

  return `Found ${totalFindings} accounts across multiple platforms.${providerText}`;
}