import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ScanResult } from '@/hooks/useScanResultsData';

/**
 * Fetches and aggregates all findings and social_profiles across all user scans
 * Returns data in the ScanResult format expected by MindMapGraph
 */
export function useAggregatedMindMapData() {
  return useQuery({
    queryKey: ['aggregated-mind-map-data'],
    queryFn: async (): Promise<{ results: ScanResult[]; username: string; totalScans: number }> => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { results: [], username: 'Your Profile', totalScans: 0 };
      }

      // Fetch findings and social_profiles in parallel
      const [findingsRes, profilesRes, scansRes] = await Promise.all([
        supabase
          .from('findings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('social_profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('scans')
          .select('id, username')
          .eq('user_id', user.id)
          .limit(100),
      ]);

      const findings = findingsRes.data || [];
      const profiles = profilesRes.data || [];
      const scans = scansRes.data || [];

      // Deduplicate by URL
      const seenUrls = new Set<string>();
      const results: ScanResult[] = [];

      // Process findings - extract data from evidence and meta JSON fields
      findings.forEach((finding) => {
        // Parse evidence to extract URL and other data
        const evidence = finding.evidence as any;
        const meta = finding.meta as any;
        const kind = finding.kind || '';
        
        // Try to get URL from evidence or meta
        let url = '';
        let platform = '';
        let displayName = '';
        let category = 'Other';
        
        // Handle breach findings
        if (kind === 'breach.hit' || kind === 'breach') {
          category = 'Data Breach';
          if (Array.isArray(evidence)) {
            const breachName = evidence.find((e: any) => e.key === 'Breach Name');
            const domain = evidence.find((e: any) => e.key === 'Domain');
            if (breachName?.value) {
              platform = breachName.value;
              displayName = breachName.value;
            }
            if (domain?.value && domain.value !== 'N/A') {
              url = `https://${domain.value}`;
            } else if (breachName?.value) {
              url = `https://haveibeenpwned.com/account/${breachName.value}`;
            }
          }
          if (!platform && meta?.raw_data?.Name) {
            platform = meta.raw_data.Name;
            displayName = meta.raw_data.Name;
          }
          if (!url && meta?.raw_data?.Domain) {
            url = `https://${meta.raw_data.Domain}`;
          }
        }
        // Handle email validation/reputation
        else if (kind === 'email.validation' || kind === 'email.reputation') {
          category = 'Email Intelligence';
          if (Array.isArray(evidence)) {
            const deliverability = evidence.find((e: any) => e.key === 'Deliverability');
            const email = evidence.find((e: any) => e.key === 'Email');
            if (deliverability?.value) {
              platform = `Email Validation: ${deliverability.value}`;
              displayName = platform;
            }
            if (email?.value) {
              url = `email-validation://${email.value}`;
            }
          }
          if (!url) url = `email-validation://${finding.id}`;
        }
        // Handle phone intelligence
        else if (kind.startsWith('phone.')) {
          category = 'Phone Intelligence';
          platform = meta?.platform || 'Phone Intel';
          displayName = platform;
          url = `phone-intel://${finding.id}`;
        }
        // Standard profile handling
        else {
          if (Array.isArray(evidence)) {
            const urlEv = evidence.find((e: any) => e.key === 'url');
            url = urlEv?.value || '';
          } else if (typeof evidence === 'object' && evidence?.url) {
            url = evidence.url;
          }
          if (!url && meta?.url) url = meta.url;
          if (!url && meta?.profile_url) url = meta.profile_url;
          
          // Extract platform/site
          if (Array.isArray(evidence)) {
            const siteEv = evidence.find((e: any) => e.key === 'site');
            platform = siteEv?.value || '';
          }
          if (!platform) platform = meta?.platform || meta?.site || '';
          if (!platform) platform = extractSiteFromUrl(url);
          
          // Extract username/displayName
          if (Array.isArray(evidence)) {
            const usernameEv = evidence.find((e: any) => e.key === 'username');
            displayName = usernameEv?.value || '';
          }
          if (!displayName) displayName = meta?.username || '';
          
          category = meta?.category || 'Other';
        }
        
        if (!url || seenUrls.has(url)) return;
        seenUrls.add(url);

        results.push({
          id: finding.id,
          kind: finding.kind || 'profile_presence',
          provider: finding.provider || 'unknown',
          status: 'found',
          url,
          site: platform,
          meta: {
            platform,
            username: displayName,
            displayName: meta?.displayName || meta?.display_name || displayName || '',
            bio: meta?.bio || '',
            avatar: meta?.avatar || meta?.avatar_url || '',
            category,
            confidence: finding.confidence || 0.7,
          } as any,
          evidence: Array.isArray(evidence) ? evidence : [
            { key: 'url', value: url },
            { key: 'site', value: platform },
            { key: 'exists', value: true },
          ],
        } as ScanResult);
      });

      // Process social_profiles
      profiles.forEach((profile) => {
        const url = profile.profile_url || '';
        if (!url || seenUrls.has(url)) return;
        seenUrls.add(url);

        results.push({
          id: profile.id,
          kind: 'profile_presence',
          provider: profile.source || 'unknown',
          status: 'found',
          url,
          site: profile.platform || extractSiteFromUrl(url),
          meta: {
            platform: profile.platform || extractSiteFromUrl(url),
            username: profile.username || '',
            displayName: profile.full_name || profile.username || '',
            bio: profile.bio || '',
            avatar: profile.avatar_url || '',
            category: 'Other',
            confidence: profile.confidence_score || 0.7,
          } as any,
          evidence: [
            { key: 'url', value: url },
            { key: 'site', value: profile.platform || extractSiteFromUrl(url) },
            { key: 'username', value: profile.username || '' },
            { key: 'exists', value: true },
          ],
        } as ScanResult);
      });

      // Get primary username from most recent scan, or use generic label
      const primaryUsername = scans[0]?.username || 'Your Digital Footprint';

      return {
        results,
        username: primaryUsername,
        totalScans: scans.length,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Extract site/platform name from URL
 */
function extractSiteFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    // Remove common prefixes
    const cleaned = hostname.replace(/^(www\.|m\.|mobile\.)/, '');
    // Get the main domain part
    const parts = cleaned.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
    return cleaned;
  } catch {
    return 'Unknown';
  }
}

export default useAggregatedMindMapData;
