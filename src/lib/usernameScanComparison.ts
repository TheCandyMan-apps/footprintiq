import { supabase } from "@/integrations/supabase/client";

export interface UsernameScanComparison {
  scan1Id: string;
  scan2Id: string;
  scan1Username: string;
  scan2Username: string;
  scan1Date: string;
  scan2Date: string;
  newSites: any[];
  removedSites: any[];
  commonSites: any[];
  statusChanges: any[];
  scan1Stats: {
    total: number;
    found: number;
    claimed: number;
    notFound: number;
  };
  scan2Stats: {
    total: number;
    found: number;
    claimed: number;
    notFound: number;
  };
}

export const compareUsernameScans = async (
  scan1Id: string,
  scan2Id: string
): Promise<UsernameScanComparison> => {
  // Fetch both scan jobs
  const [job1Result, job2Result] = await Promise.all([
    supabase.from('scan_jobs').select('*').eq('id', scan1Id).single(),
    supabase.from('scan_jobs').select('*').eq('id', scan2Id).single()
  ]);

  if (job1Result.error || job2Result.error) {
    throw new Error('Failed to fetch scan jobs for comparison');
  }

  const job1 = job1Result.data;
  const job2 = job2Result.data;

  // Fetch findings for both scans
  const [findings1Result, findings2Result] = await Promise.all([
    supabase.from('scan_findings').select('*').eq('job_id', scan1Id),
    supabase.from('scan_findings').select('*').eq('job_id', scan2Id)
  ]);

  const findings1 = findings1Result.data || [];
  const findings2 = findings2Result.data || [];

  // Create site maps for comparison
  const sites1Map = new Map(findings1.map(f => [f.site, f]));
  const sites2Map = new Map(findings2.map(f => [f.site, f]));

  // Find new, removed, and common sites
  const newSites = findings2.filter(f => !sites1Map.has(f.site));
  const removedSites = findings1.filter(f => !sites2Map.has(f.site));
  const commonSites = findings2.filter(f => sites1Map.has(f.site));

  // Find status changes in common sites
  const statusChanges = commonSites
    .map(f2 => {
      const f1 = sites1Map.get(f2.site)!;
      if (f1.status !== f2.status) {
        return {
          site: f2.site,
          oldStatus: f1.status,
          newStatus: f2.status,
          url: f2.url,
        };
      }
      return null;
    })
    .filter(Boolean);

  // Calculate stats
  const getStats = (findings: any[]) => {
    return {
      total: findings.length,
      found: findings.filter(f => f.status === 'found').length,
      claimed: findings.filter(f => f.status === 'claimed').length,
      notFound: findings.filter(f => f.status === 'not_found').length,
    };
  };

  return {
    scan1Id,
    scan2Id,
    scan1Username: job1.username,
    scan2Username: job2.username,
    scan1Date: job1.created_at,
    scan2Date: job2.created_at,
    newSites,
    removedSites,
    commonSites,
    statusChanges,
    scan1Stats: getStats(findings1),
    scan2Stats: getStats(findings2),
  };
};
