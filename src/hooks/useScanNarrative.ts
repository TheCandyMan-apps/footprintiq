import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NarrativeItem {
  id: string;
  icon: 'search' | 'check' | 'database' | 'shield' | 'alert';
  text: string;
  provider?: string;
  duration?: number;
  findingsCount?: number;
}

export interface ScanNarrative {
  items: NarrativeItem[];
  summary: string;
  totalPlatforms: number;
  totalFindings: number;
  scanDuration: number;
  isLoading: boolean;
}

interface ScanEvent {
  id: string;
  provider: string;
  stage: string;
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
        .select('id, provider, stage, duration_ms, findings_count, created_at, error_message')
        .eq('scan_id', scanId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ScanEvent[];
    },
    enabled: !!scanId,
    staleTime: 30000,
  });

  const narrative = useMemo(() => {
    if (!scanEvents || scanEvents.length === 0) {
      return {
        items: [],
        summary: '',
        totalPlatforms: 0,
        totalFindings: 0,
        scanDuration: 0,
        isLoading,
      };
    }

    const items: NarrativeItem[] = [];
    let totalFindings = 0;
    let totalDuration = 0;
    const providers = new Set<string>();
    const completedProviders: { name: string; findings: number; duration: number }[] = [];

    // Group events by provider
    const providerEvents = new Map<string, ScanEvent[]>();
    scanEvents.forEach((event) => {
      const existing = providerEvents.get(event.provider) || [];
      existing.push(event);
      providerEvents.set(event.provider, existing);
      providers.add(event.provider);
    });

    // Process each provider's events
    providerEvents.forEach((events, provider) => {
      const completeEvent = events.find((e) => e.stage === 'complete' || e.stage === 'completed');
      const findings = completeEvent?.findings_count || 0;
      const duration = completeEvent?.duration_ms || 0;

      totalFindings += findings;
      totalDuration += duration;

      if (completeEvent) {
        completedProviders.push({
          name: formatProviderName(provider),
          findings,
          duration,
        });
      }
    });

    // Build narrative items
    const typeLabel = getTypeLabel(scanType);
    items.push({
      id: 'search-start',
      icon: 'search',
      text: `Searched "${searchedValue}" across ${estimatePlatformCount(providers.size)} platforms`,
    });

    // Add top 3 provider results
    completedProviders
      .sort((a, b) => b.findings - a.findings)
      .slice(0, 3)
      .forEach((p, idx) => {
        if (p.findings > 0) {
          items.push({
            id: `provider-${idx}`,
            icon: 'check',
            text: `${p.name} found ${p.findings} ${p.findings === 1 ? 'account' : 'accounts'}${p.duration > 0 ? ` in ${(p.duration / 1000).toFixed(1)}s` : ''}`,
            provider: p.name,
            duration: p.duration,
            findingsCount: p.findings,
          });
        }
      });

    // Add breach check if applicable
    const breachProviders = ['hibp', 'breach', 'haveibeenpwned', 'leak'];
    const hasBreachCheck = Array.from(providers).some((p) =>
      breachProviders.some((bp) => p.toLowerCase().includes(bp))
    );
    if (hasBreachCheck) {
      items.push({
        id: 'breach-check',
        icon: 'shield',
        text: 'Breach databases queried for exposure',
      });
    }

    // Generate summary
    const summary = generateSummary(totalFindings, providers.size, completedProviders, typeLabel);

    return {
      items,
      summary,
      totalPlatforms: estimatePlatformCount(providers.size),
      totalFindings,
      scanDuration: totalDuration,
      isLoading,
    };
  }, [scanEvents, searchedValue, scanType, isLoading]);

  return narrative;
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
    return `No accounts were found for this ${typeLabel}. This could indicate a unique identifier or limited online presence.`;
  }

  const topProviders = completedProviders
    .filter((p) => p.findings > 0)
    .slice(0, 2)
    .map((p) => p.name);

  const providerText = topProviders.length > 0 ? ` Most results came from ${topProviders.join(' and ')}.` : '';

  if (totalFindings === 1) {
    return `Found 1 account linked to this ${typeLabel}.${providerText}`;
  }

  if (totalFindings < 10) {
    return `Found ${totalFindings} accounts across various platforms, indicating a moderate online presence.${providerText}`;
  }

  return `Found ${totalFindings} accounts across multiple platforms, indicating significant online presence.${providerText} Review the Accounts tab for detailed breakdown.`;
}
