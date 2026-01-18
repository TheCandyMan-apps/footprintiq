import { Separator } from '@/components/ui/separator';
import { FootprintDNACard } from '@/components/FootprintDNACard';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { LockedInsightsGrid } from '@/components/billing/LockedInsightBlock';
import { VerificationHistoryPanel } from '@/components/forensic';
import { LensSummaryCard } from '@/components/scan/LensSummaryCard';
import { useLensAnalysis } from '@/hooks/useLensAnalysis';
import { ScanJob, ScanResult } from '@/hooks/useScanResultsData';

interface SummaryTabProps {
  jobId: string;
  job: ScanJob;
  grouped: {
    found: any[];
    claimed: any[];
    not_found: any[];
    unknown: any[];
  };
  resultsCount: number;
  results: ScanResult[];
}

export function SummaryTab({ jobId, job, grouped, resultsCount, results }: SummaryTabProps) {
  // LENS Analysis
  const lensAnalysis = useLensAnalysis(results);

  return (
    <div className="space-y-6">
      {/* LENS Summary at top */}
      <LensSummaryCard
        overallScore={lensAnalysis.overallScore}
        highConfidence={lensAnalysis.highConfidence}
        moderateConfidence={lensAnalysis.moderateConfidence}
        lowConfidence={lensAnalysis.lowConfidence}
        totalFindings={resultsCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main analysis content */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-semibold text-muted-foreground">Analysis & Insights</h3>
          
          {/* Footprint DNA Card */}
          <FootprintDNACard scanId={jobId} userId={job?.requested_by || undefined} />

          {/* Locked Insights for Free users */}
          <LockedInsightsGrid />

          {/* AI Insights Panel */}
          <AIInsightsPanel 
            scanData={{
              jobId,
              breaches: grouped.found.length,
              exposures: resultsCount,
              dataBrokers: grouped.claimed.length,
              darkWeb: grouped.unknown.length,
            }}
          />
        </div>

        {/* Verification History Sidebar */}
        <div className="lg:col-span-1">
          <VerificationHistoryPanel scanId={jobId} />
        </div>
      </div>
    </div>
  );
}

export default SummaryTab;
