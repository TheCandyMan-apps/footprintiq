import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ScanResultRow {
  id: string;
  scan_id: string;
  provider: string;
  kind: string;
  severity: string;
  site?: string;
  url?: string;
  status?: string;
  evidence: any;
  meta?: any;
  created_at: string;
}

interface SocialProfile {
  id: string;
  scan_id: string;
  platform: string;
  username: string;
  profile_url: string;
  found: boolean;
  source?: string;
  avatar_url?: string;
  metadata?: any;
  first_seen?: string;
  confidence_score?: number;
}

// Normalize social_profiles to ScanResultRow format
function normalizeSocialProfile(profile: SocialProfile): ScanResultRow {
  return {
    id: profile.id,
    scan_id: profile.scan_id,
    provider: profile.source || 'unknown',
    kind: 'profile_presence',
    severity: 'info',
    site: profile.platform,
    url: profile.profile_url,
    status: profile.found ? 'found' : 'not_found',
    evidence: { 
      username: profile.username, 
      avatar: profile.avatar_url,
      confidence_score: profile.confidence_score 
    },
    meta: { ...(profile.metadata || {}), avatar_url: profile.avatar_url },
    created_at: profile.first_seen || new Date().toISOString(),
  };
}

// Transform findings to match expected ScanResultRow format
function transformFinding(finding: any): ScanResultRow {
  let site = '';
  let url = '';
  
  // Priority 1: Extract from evidence array (most common for breach findings)
  if (Array.isArray(finding.evidence)) {
    // Look for breach name first (for HIBP findings)
    const breachNameEntry = finding.evidence.find((e: any) => e.key === 'Breach Name');
    const siteEntry = finding.evidence.find((e: any) => e.key === 'site' || e.key === 'Site');
    const urlEntry = finding.evidence.find((e: any) => e.key === 'url' || e.key === 'Url' || e.key === 'URL');
    const domainEntry = finding.evidence.find((e: any) => e.key === 'Domain');
    
    // Use breach name if available (for breach findings)
    if (breachNameEntry?.value) {
      site = breachNameEntry.value;
    } else if (siteEntry?.value) {
      site = siteEntry.value;
    } else if (domainEntry?.value && domainEntry.value !== 'N/A') {
      site = domainEntry.value;
    }
    
    if (urlEntry?.value) url = urlEntry.value;
  } else if (finding.evidence?.site) {
    site = finding.evidence.site;
    url = finding.evidence.url || '';
  }
  
  // Priority 2: Extract from meta.title (common for breach findings: "Breach: SiteName")
  if (!site && finding.meta?.title) {
    const breachMatch = finding.meta.title.match(/^Breach:\s*(.+)$/i);
    if (breachMatch) {
      site = breachMatch[1].trim();
    } else {
      site = finding.meta.title;
    }
  }
  
  // Priority 3: Fall back to meta.platform
  if (!site && finding.meta?.platform) {
    site = finding.meta.platform;
  }
  
  // Priority 4: Use provider name as last resort (better than "unknown")
  if (!site && finding.provider) {
    site = finding.provider.charAt(0).toUpperCase() + finding.provider.slice(1);
  }
  
  return {
    ...finding,
    site,
    url,
    status: finding.meta?.status || 'found',
  };
}

export function useRealtimeResults(jobId: string | null) {
  const [results, setResults] = useState<ScanResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Ref to track active post-completion polling loop
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollAttemptsRef = useRef(0);
  const MAX_POLL_ATTEMPTS = 15; // poll every 2s for up to 30s

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    loadInitialResults();
    const channels = setupRealtime();

    return () => {
      channels.forEach(channel => {
        if (channel) supabase.removeChannel(channel);
      });
      stopPolling();
    };
  }, [jobId]);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollAttemptsRef.current = 0;
  };

  const loadInitialResults = async (): Promise<number> => {
    if (!jobId) return 0;

    try {
      // Query both tables in parallel
      const [findingsResult, profilesResult] = await Promise.all([
        supabase
          .from('findings')
          .select('*')
          .eq('scan_id', jobId)
          .order('created_at', { ascending: true }),
        supabase
          .from('social_profiles')
          .select('*')
          .eq('scan_id', jobId)
          .order('first_seen', { ascending: true }),
      ]);

      if (findingsResult.error) {
        console.error('Error loading findings:', findingsResult.error);
      }
      if (profilesResult.error) {
        console.error('Error loading social_profiles:', profilesResult.error);
      }

      // Normalize social_profiles to match ScanResultRow format
      const normalizedProfiles = (profilesResult.data || []).map(normalizeSocialProfile);
      
      // Transform findings to match expected format
      const transformedFindings = (findingsResult.data || []).map(transformFinding);

      // Merge transformed findings and normalized profiles
      const merged = [
        ...transformedFindings,
        ...normalizedProfiles,
      ];

      const total = merged.length;
      console.log(`[useRealtimeResults] Loaded ${findingsResult.data?.length || 0} findings and ${profilesResult.data?.length || 0} social_profiles for scan ${jobId} (total=${total})`);
      setResults(merged);
      return total;
    } catch (error) {
      console.error('Failed to load initial results:', error);
      return 0;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Start a polling loop after scan completion.
   * Retries every 2s for up to 30s until results appear.
   * This handles the race condition where scan_complete fires before
   * DB writes are visible to the frontend.
   */
  const startCompletionPolling = () => {
    stopPolling(); // clear any existing poll
    pollAttemptsRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current++;
      console.log(`[useRealtimeResults] Post-completion poll attempt ${pollAttemptsRef.current}/${MAX_POLL_ATTEMPTS}`);

      const count = await loadInitialResults();

      if (count > 0 || pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        console.log(`[useRealtimeResults] Stopping poll — found ${count} results after ${pollAttemptsRef.current} attempts`);
        stopPolling();
      }
    }, 2000);
  };

  const setupRealtime = () => {
    if (!jobId) return [];

    // Channel for findings table
    const findingsChannel = supabase
      .channel(`findings_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'findings',
          filter: `scan_id=eq.${jobId}`,
        },
        (payload) => {
          console.log('[useRealtimeResults] New finding received:', payload.new);
          const transformed = transformFinding(payload.new);
          setResults((prev) => [...prev, transformed]);
          // If we get a realtime insert, stop any active polling
          stopPolling();
        }
      )
      .subscribe();

    // Channel for social_profiles table
    const profilesChannel = supabase
      .channel(`social_profiles_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_profiles',
          filter: `scan_id=eq.${jobId}`,
        },
        (payload) => {
          console.log('[useRealtimeResults] New social_profile received:', payload.new);
          const normalized = normalizeSocialProfile(payload.new as SocialProfile);
          setResults((prev) => [...prev, normalized]);
          stopPolling();
        }
      )
      .subscribe();

    return [findingsChannel, profilesChannel];
  };

  const refetch = async () => {
    setLoading(true);
    const count = await loadInitialResults();
    // If still no results, start the completion polling loop
    if (count === 0) {
      startCompletionPolling();
    }
  };

  return { results, loading, refetch };
}
