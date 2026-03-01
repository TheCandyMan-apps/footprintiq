/**
 * AdvancedResultsPage Component
 *
 * Full-featured results page for Pro/Business/Admin users.
 * This component is NEVER mounted for Free users.
 */

import { useEffect, useState, lazy, Suspense, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useScanResultsData, ScanJob, ScanResult } from "@/hooks/useScanResultsData";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ResultsTabBar } from "./ResultsTabBar";
import { WhatsAppTab } from "./results-tabs/WhatsAppTab";
import { InvestigationProvider } from "@/contexts/InvestigationContext";
import { supabase } from "@/integrations/supabase/client";
import { flags } from "@/lib/featureFlags";

const SummaryTab = lazy(() => import("./results-tabs/SummaryTab"));
const AccountsTab = lazy(() => import("./results-tabs/AccountsTab"));
const ConnectionsTab = lazy(() => import("./results-tabs/ConnectionsTab"));
const TimelineTab = lazy(() => import("./results-tabs/TimelineTab"));
const BreachesTab = lazy(() => import("./results-tabs/BreachesTab"));
const MapTab = lazy(() => import("./results-tabs/MapTab"));
const TelegramTab = lazy(() => import("./results-tabs/TelegramTab"));
const RemediationPlanTab = lazy(() => import("./results-tabs/RemediationPlanTab"));
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

interface AdvancedResultsPageProps {
  jobId: string;
}

export default function AdvancedResultsPage({ jobId }: AdvancedResultsPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [job, setJob] = useState<ScanJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
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

  // Fetch scan job from database
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    async function fetchJob() {
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        toast({
          title: "Scan not found",
          description: "We couldn't find that scan. It may have been deleted.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      // Derive target from available fields
      const target = data.username || data.email || data.phone || "";
      setJob({
        id: data.id,
        username: data.username || "",
        target,
        scan_type: data.scan_type,
        status: data.status || "unknown",
        created_at: data.created_at,
        started_at: null,
        finished_at: data.completed_at || null,
        error: null,
        all_sites: false,
        requested_by: data.user_id || null,
        telegram_triggered_at: data.telegram_triggered_at || null,
      });
      setJobLoading(false);
    }

    fetchJob();
    return () => { cancelled = true; };
  }, [jobId, navigate, toast]);

  // Fetch scan results
  const {
    results,
    loading: resultsLoading,
    grouped,
    tabCounts,
    hasGeoData,
    geoLocations,
    breachResults,
    refetch,
  } = useScanResultsData(jobId);

  const showTimeline = true; // Always show timeline tab for advanced users

  const handleNewScan = () => navigate("/scan");

  if (jobLoading || resultsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <InvestigationProvider scanId={jobId}>
    <div className="space-y-4">
      <Card className="p-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <ResultsTabBar
            tabCounts={tabCounts}
            hasGeoData={hasGeoData}
            showTimeline={showTimeline}
            onNewScan={handleNewScan}
            actionsDisabled={results.length === 0}
          />

          <div className="border-t">
            <TabsContent value="summary" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <SummaryTab
                  jobId={jobId}
                  job={job!}
                  grouped={grouped}
                  resultsCount={results.length}
                  results={results}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="accounts" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <AccountsTab results={results} jobId={jobId} />
              </Suspense>
            </TabsContent>

            <TabsContent value="connections" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <ConnectionsTab
                  results={results}
                  username={job?.username || ""}
                  jobId={jobId}
                />
              </Suspense>
            </TabsContent>

            {showTimeline && (
              <TabsContent value="timeline" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <TimelineTab
                    scanId={jobId}
                    results={results}
                    username={job?.username || ""}
                    isPremium={true}
                  />
                </Suspense>
              </TabsContent>
            )}

            <TabsContent value="breaches" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <BreachesTab results={results} breachResults={breachResults} />
              </Suspense>
            </TabsContent>

            {hasGeoData && (
              <TabsContent value="map" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <MapTab locations={geoLocations} isPremium={true} />
                </Suspense>
              </TabsContent>
            )}

            <TabsContent value="telegram" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <TelegramTab scanId={jobId} isPro={true} />
              </Suspense>
            </TabsContent>

            {isPhoneTarget && (
              <TabsContent value="whatsapp" className="mt-0">
                <Suspense fallback={<TabSkeleton />}>
                  <WhatsAppTab scanId={jobId} isPro={true} phoneNumber={phoneNumber} />
                </Suspense>
              </TabsContent>
            )}

            <TabsContent value="remediation" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <RemediationPlanTab results={results} />
              </Suspense>
            </TabsContent>

            <TabsContent value="privacy" className="mt-0">
              <Suspense fallback={<TabSkeleton />}>
                <PrivacyCenterTab scanId={jobId} />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
