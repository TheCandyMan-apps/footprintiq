import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScanHealth {
  id: string;
  scan_id: string;
  workspace_id: string | null;
  user_id: string | null;
  state: string;
  last_stage: string | null;
  last_heartbeat_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_code: string | null;
  error_detail: string | null;
  latency_ms_total: number | null;
}

export function useScanHealth(scanId: string | undefined) {
  return useQuery({
    queryKey: ["scan-health", scanId],
    enabled: !!scanId,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state === "completed" || state === "failed") return false;
      return 3000;
    },
    queryFn: async (): Promise<ScanHealth | null> => {
      if (!scanId) return null;
      // Use type assertion since scan_health is new and types haven't regenerated yet
      const { data, error } = await (supabase as any)
        .from("scan_health")
        .select("*")
        .eq("scan_id", scanId)
        .maybeSingle();

      if (error) {
        console.error("[useScanHealth] Error:", error);
        return null;
      }
      return data as ScanHealth | null;
    },
  });
}
