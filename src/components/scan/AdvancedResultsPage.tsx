/**
 * AdvancedResultsPage Component
 *
 * Full-featured results page for Pro/Business/Admin users.
 * This component is NEVER mounted for Free users.
 *
 * Features:
 * - Full tabbed interface (Summary, Accounts, Connections, Timeline, Breaches, Map)
 * - All forensic analysis tools
 * - Export capabilities
 * - Investigation context
 */

import { useEffect, useState, useRef, lazy, Suspense, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useScanJob } from "@/hooks/useScanJob";
import { useScanResultsData } from "@/hooks/useScanResultsData";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { ResultsTabBar } from "./ResultsTabBar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Finding } from "@/types/findings";
import type { ScanJob } from "@/types/scan";
import { WhatsAppTab } from "./results-tabs/WhatsAppTab";

const SummaryTab = lazy(() => import("./results-tabs/SummaryTab"));
const AccountsTab = lazy(() => import("./results-tabs/AccountsTab"));
const ConnectionsTab = lazy(() => import("./results-tabs/ConnectionsTab"));
const TimelineTab = lazy(() => import("./results-tabs/TimelineTab"));
const BreachesTab = lazy(() => import("./results-tabs/BreachesTab"));
const MapTab = lazy(() => import("./results-tabs/MapTab"));
const TelegramTab = lazy(() => import("./results-tabs/TelegramTab"));
const RemediationTab = lazy(() => import("./results-tabs/RemediationTab"));
const PrivacyCenterTab = lazy(() => import("./results-tabs/PrivacyCenterTab"));

const TabSkeleton = () => (
  <div className="p-6">
    <div className="h-7 w-48 bg-muted rounded mb-4" />
    <div className="space-y-3">
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-5/6 bg-muted rounded" />
      <div className="h-4 w-4/6 bg-muted rounded" />
    </div>
  </div>
);

const VALID_TABS = [
  "summary",
  "accounts",
  "connections",
  "timeline",
  "breaches",
  "map",
  "telegram",
  "whatsapp",
  "remediation",
  "privacy",
] as const;
type TabValue = (typeof VALID_TABS)[number];

/** Helper: convert results to Finding[] for score calculators */
function resultsToFindings(results: any[]): Finding[] {
  return results.map((r) => ({
    id: r.id || "",
    type:
      r.kind === "profile_presence"
        ? "account"
        : r.kind === "breach"
          ? "breach"
          : r.kind === "relationship"
            ? "connection"
            : "other",
    title: r.title || r.platform || r.breach_name || "Finding",
    severity: r.severity || "low",
    confidence: r.confidence || 0.5,
    source: r.source || r.provider || "unknown",
    url: r.url,
    observedAt: r.observed_at || r.created_at || new Date().toISOString(),
    metadata: r.metadata || {},
  }));
}

export default function AdvancedResultsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [job, setJob] = useState<ScanJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [broadcastResultCount, setBroadcastResultCount] = useState(0);
  const { toast } = useToast();

  // Get initial tab from URL or default to 'summary'
  const tabFromUrl = searchParams.get("tab") as TabValue | null;
  const initialTab = tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "summary";
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);

  // Phone-only support: WhatsApp Intelligence should only appear for phone targets
  const normalizedTarget = typeof job?.target === "string" ? job.target.replace(/\s+/g, "") : "";
  const isPhoneTarget = /^\+?\d{7,15}$/.test(normalizedTarget);
  const phoneNumber = isPhoneTarget ? normalizedTarget : undefined;

  // Update URL when tab changes
  const handleTabChange = useCallback(
    (value: string) => {
      const newTab = value as TabValue;
      setActiveTab(newTab);

      if (newTab === "summary") {
        searchParams.delete("tab");
      } else {
        searchParams.set("tab", newTab);
      }
      setSearchParams(searchParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // If user navigates directly to WhatsApp tab but this scan isn't a phone scan, bounce to Summary.
  useEffect(() => {
    if (activeTab === "whatsapp" && !isPhoneTarget) {
      setActiveTab("summary");
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    }
  }, [activeTab, isPhoneTarget, searchParams, setSearchParams]);

  // Fetch scan job
  const { workspace } = useWorkspace();
  const { data: jobData, isLoading: jobIsLoading } = useScanJob(jobId || "");

  useEffect(() => {
    if (!jobId) return;
    if (jobIsLoading) return;

    if (!jobData) {
      toast({
        title: "Scan not found",
        description: "We couldn't find that scan. It may have been deleted.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setJob(jobData);
    setJobLoading(false);
  }, [jobData, jobIsLoading, jobId, navigate, toast]);

  // Fetch scan results
  const {
    results,
    tabCounts,
    hasGeoData,
    showTimeline,
    isLoading: resultsLoading,
    exportJSON,
    exportCSV,
    exportPDF,
  } = useScanResultsData(jobId || "");

  // Convert to findings for derived metrics
  const findings = useMemo(() => resultsToFindings(results || []), [results]);

  const handleExportJSON = () => exportJSON?.();
  const handleExportCSV = () => exportCSV?.();
  const handleExportPDF = () => exportPDF?.();

  const handleNewScan = () => navigate("/scan");

  if (jobLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <ResultsTabBar
            tabCounts={tabCounts}
            hasGeoData={hasGeoData}
            showTimeline={showTimeline}
            onExportJSON={handleExportJSON}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
            onNewScan={handleNewScan}
            actionsDisabled={results.length === 0}
            isPhoneTarget={isPhoneTarget}
          />

          <div className="border-t">
            <TabsContent value="summary" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <SummaryTab job={job} results={results} findings={findings} />
              </Suspense>
            </TabsContent>

            <TabsContent value="accounts" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <AccountsTab job={job} results={results} />
              </Suspense>
            </TabsContent>

            <TabsContent value="connections" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <ConnectionsTab job={job} results={results} />
              </Suspense>
            </TabsContent>

            {showTimeline && (
              <TabsContent value="timeline" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <TimelineTab job={job} results={results} />
                </Suspense>
              </TabsContent>
            )}

            <TabsContent value="breaches" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <BreachesTab job={job} results={results} />
              </Suspense>
            </TabsContent>

            {hasGeoData && (
              <TabsContent value="map" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <MapTab job={job} results={results} />
                </Suspense>
              </TabsContent>
            )}

            <TabsContent value="telegram" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <TelegramTab scanId={jobId || ""} isPro={true} />
              </Suspense>
            </TabsContent>

            {isPhoneTarget && (
              <TabsContent value="whatsapp" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <WhatsAppTab scanId={jobId || ""} isPro={true} phoneNumber={phoneNumber} />
                </Suspense>
              </TabsContent>
            )}

            <TabsContent value="remediation" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <RemediationTab job={job} results={results} />
              </Suspense>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <PrivacyCenterTab job={job} results={results} />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
