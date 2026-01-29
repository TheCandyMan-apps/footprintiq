import { useMemo } from 'react';
import { useRealtimeResults } from '@/hooks/useRealtimeResults';
import { groupByStatus } from '@/utils/exporters';
import { filterOutProviderHealth, isProviderHealthFinding } from '@/lib/providerHealthUtils';

export interface ScanResult {
  id: string;
  site: string;
  status: string;
  url: string;
  meta?: {
    geo?: {
      lat: number;
      lng: number;
      city?: string;
      country?: string;
    };
    location?: {
      coordinates?: { lat: number; lng: number };
    };
  };
  evidence?: any;
  metadata?: {
    coordinates?: { lat: number; lng: number };
  };
}

export interface ScanJob {
  id: string;
  username: string;
  target?: string;
  scan_type?: string;
  status: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  error: string | null;
  all_sites: boolean;
  requested_by: string | null;
}

export interface TabCounts {
  accounts: number;
  connections: number;
  timeline: number;
  breaches: number;
  map: number;
}

export function useScanResultsData(jobId: string) {
  const { results, loading, refetch } = useRealtimeResults(jobId);

  // Group results by status - ensure proper typing
  type GroupedResults = { found: any[]; claimed: any[]; not_found: any[]; unknown: any[] };
  const grouped = useMemo((): GroupedResults => {
    const result = groupByStatus(results as any[]);
    return {
      found: result.found || [],
      claimed: result.claimed || [],
      not_found: result.not_found || [],
      unknown: result.unknown || [],
    };
  }, [results]);

  // Calculate counts for tab badges (excluding provider health findings)
  const tabCounts = useMemo((): TabCounts => {
    const displayResults = filterOutProviderHealth(results as any[]);
    const displayGrouped = groupByStatus(displayResults);
    const foundCount = displayGrouped.found?.length || 0;
    const claimedCount = displayGrouped.claimed?.length || 0;

    // Detect breach-related findings (excluding provider health)
    const breachKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised'];
    const breachResults = displayResults.filter(r => {
      if (isProviderHealthFinding(r)) return false;
      const kind = (r.kind || '').toLowerCase();
      const provider = (r.provider || '').toLowerCase();
      return breachKeywords.some(k => kind.includes(k) || provider.includes(k));
    });

    return {
      accounts: foundCount + claimedCount,
      connections: foundCount, // Connection graph uses found profiles
      timeline: 0, // Timeline uses provider events, not results
      breaches: breachResults.length,
      map: 0, // Will be calculated based on geo data
    };
  }, [results]);

  // Detect if any results have geo data
  const hasGeoData = useMemo(() => {
    return (results as ScanResult[]).some(r => {
      return (
        r.meta?.geo ||
        r.meta?.location?.coordinates ||
        r.evidence?.location ||
        r.metadata?.coordinates
      );
    });
  }, [results]);

  // Extract geo locations from results
  const geoLocations = useMemo(() => {
    const locations: Array<{
      ip: string;
      formatted: string;
      address: { country?: string; country_code?: string };
      region: string;
      coordinates: { lat: number; lng: number };
    }> = [];

    (results as ScanResult[]).forEach(r => {
      let geo = r.meta?.geo || r.meta?.location?.coordinates || r.metadata?.coordinates;
      
      if (geo && typeof geo.lat === 'number' && typeof geo.lng === 'number') {
        const country = r.meta?.geo?.country || '';
        let region = 'Other';
        
        // Determine region based on country
        const usCountries = ['US', 'USA', 'United States'];
        const euCountries = ['UK', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'PL', 'SE', 'AT', 'BE'];
        const apacCountries = ['JP', 'CN', 'AU', 'SG', 'KR', 'IN', 'NZ'];
        
        if (usCountries.some(c => country.toUpperCase().includes(c))) {
          region = 'US';
        } else if (euCountries.some(c => country.toUpperCase().includes(c))) {
          region = 'EU';
        } else if (apacCountries.some(c => country.toUpperCase().includes(c))) {
          region = 'Asia-Pacific';
        }

        locations.push({
          ip: r.site || 'Unknown',
          formatted: `${r.meta?.geo?.city || ''} ${country}`.trim() || 'Unknown Location',
          address: { country, country_code: country.substring(0, 2) },
          region,
          coordinates: { lat: geo.lat, lng: geo.lng },
        });
      }
    });

    return locations;
  }, [results]);

  // Filter breach-related results (excluding provider health)
  const breachResults = useMemo(() => {
    const breachKeywords = ['breach', 'hibp', 'leak', 'pwned', 'compromised', 'exposure'];
    return (results as any[]).filter(r => {
      if (isProviderHealthFinding(r)) return false;
      const kind = (r.kind || '').toLowerCase();
      const provider = (r.provider || '').toLowerCase();
      const site = (r.site || '').toLowerCase();
      return breachKeywords.some(k => 
        kind.includes(k) || provider.includes(k) || site.includes(k)
      );
    });
  }, [results]);

  return {
    results: results as ScanResult[],
    loading,
    grouped,
    tabCounts: {
      ...tabCounts,
      map: geoLocations.length,
    },
    hasGeoData,
    geoLocations,
    breachResults,
    refetch,
  };
}
