import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NarrativeItem {
  id: string;
  icon: 'search' | 'check' | 'database' | 'shield' | 'alert' | 'link' | 'loader';
  text: string;
  timestamp?: string;
  provider?: string;
  duration?: number;
  findingsCount?: number;
  isActive?: boolean;
}

export interface ScanNarrative {
  items: NarrativeItem[];
  summary: string;
  totalPlatforms: number;
  totalFindings: number;
  scanDuration: number;
  isLoading: boolean;
  isComplete: boolean;
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

export function useScanNarrative(scanId: string, searchedValue: string, scanType: string): ScanNarrative {
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
    const activeProviders: { name: string; stage: string }[] = [];
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
        activeProviders.push({
          name: formatProviderName(provider),
          stage: latestEvent.stage,
        });
      }
    });

    const isComplete = activeProviders.length === 0 && completedProviders.length > 0;
    const typeLabel = getTypeLabel(scanType);

    // Build narrative items based on completion state
    if (isComplete) {
      // COMPLETED STATE: Show compact "What we did" feed
      const startTime = firstEvent ? formatTime(firstEvent.created_at) : '';
      
      // Step 1: Searched sources
      items.push({
        id: 'step-search',
        icon: 'search',
        text: `Searched ${estimatePlatformCount(providers.size)}+ platforms for "${searchedValue}"`,
        timestamp: startTime,
      });

      // Step 2: Providers with results (group top providers)
      const providersWithFindings = completedProviders.filter(p => p.findings > 0);
      if (providersWithFindings.length > 0) {
        const topProviders = providersWithFindings.slice(0, 3).map(p => p.name);
        const totalFromTop = providersWithFindings.slice(0, 3).reduce((sum, p) => sum + p.findings, 0);
        items.push({
          id: 'step-found',
          icon: 'check',
          text: `${topProviders.join(', ')} found ${totalFromTop} account${totalFromTop !== 1 ? 's' : ''}`,
          findingsCount: totalFromTop,
        });
      }

      // Step 3: Checked username reuse
      if (totalFindings > 1) {
        items.push({
          id: 'step-reuse',
          icon: 'link',
          text: `Analyzed username reuse across ${totalFindings} profiles`,
        });
      }

      // Step 4: Breach check (if applicable)
      const breachProviders = ['hibp', 'breach', 'haveibeenpwned', 'leak'];
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

      // Step 5: Finalized
      const endTime = lastEvent ? formatTime(lastEvent.created_at) : '';
      const durationSec = totalDuration > 0 ? `${(totalDuration / 1000).toFixed(1)}s` : '';
      items.push({
        id: 'step-complete',
        icon: 'check',
        text: `Scan complete${durationSec ? ` in ${durationSec}` : ''}`,
        timestamp: endTime,
      });

    } else {
      // RUNNING STATE: Show live steps
      items.push({
        id: 'live-search',
        icon: 'search',
        text: `Searching ${estimatePlatformCount(providers.size)}+ sources for "${searchedValue}"`,
        isActive: true,
      });

      // Show active providers
      if (activeProviders.length > 0) {
        const activeNames = activeProviders.slice(0, 2).map(p => p.name).join(', ');
        const moreCount = activeProviders.length > 2 ? ` +${activeProviders.length - 2} more` : '';
        items.push({
          id: 'live-providers',
          icon: 'loader',
          text: `${activeNames}${moreCount} checking...`,
          isActive: true,
        });
      }

      // Show completed count if any
      if (completedProviders.length > 0) {
        items.push({
          id: 'live-found',
          icon: 'check',
          text: `${totalFindings} account${totalFindings !== 1 ? 's' : ''} found so far`,
          findingsCount: totalFindings,
        });
      }
    }

    // Generate summary
    const summary = isComplete 
      ? generateSummary(totalFindings, providers.size, completedProviders, typeLabel)
      : '';

    return {
      items: items.slice(0, 6), // Max 6 items
      summary,
      totalPlatforms: estimatePlatformCount(providers.size),
      totalFindings,
      scanDuration: totalDuration,
      isLoading,
      isComplete,
    };
  }, [scanEvents, searchedValue, scanType, isLoading]);

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