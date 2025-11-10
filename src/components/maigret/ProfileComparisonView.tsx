import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileComparisonViewProps {
  workspaceId: string;
}

type Snapshot = {
  id: string;
  username: string;
  site: string;
  status: string;
  url: string;
  confidence: number;
  raw_data: any;
  created_at: string;
  workspace_id: string;
  scan_id: string;
};

export function ProfileComparisonView({ workspaceId }: ProfileComparisonViewProps) {
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [leftSnapshotId, setLeftSnapshotId] = useState<string>("");
  const [rightSnapshotId, setRightSnapshotId] = useState<string>("");

  // Fetch monitored usernames
  const { data: monitoredUsernames } = useQuery({
    queryKey: ["monitored-usernames", workspaceId],
    queryFn: async () => {
      // @ts-expect-error - Supabase type inference limitation
      const response = await supabase
        .from("maigret_monitored_usernames")
        .select("username")
        .eq("workspace_id", workspaceId)
        .eq("is_active", true);
      
      if (response.error) throw response.error;
      return (response.data || []) as Array<{ username: string }>;
    },
  });

  // Fetch sites for selected username
  const { data: sites } = useQuery({
    queryKey: ["username-sites", workspaceId, selectedUsername],
    queryFn: async () => {
      if (!selectedUsername) return [];
      
      const response = await supabase
        .from("maigret_profile_snapshots")
        .select("site")
        .eq("workspace_id", workspaceId)
        .eq("username", selectedUsername);
      
      if (response.error) throw response.error;
      
      const uniqueSites = [...new Set(response.data.map((s: any) => s.site))];
      return uniqueSites as string[];
    },
    enabled: !!selectedUsername,
  });

  // Fetch snapshots for comparison
  const { data: snapshots } = useQuery({
    queryKey: ["snapshots", workspaceId, selectedUsername, selectedSite],
    queryFn: async () => {
      if (!selectedUsername || !selectedSite) return [];
      
      const response = await supabase
        .from("maigret_profile_snapshots")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("username", selectedUsername)
        .eq("site", selectedSite)
        .order("created_at", { ascending: false });
      
      if (response.error) throw response.error;
      return (response.data || []) as Snapshot[];
    },
    enabled: !!selectedUsername && !!selectedSite,
  });

  // Auto-select first and last snapshot
  const autoSelectSnapshots = () => {
    if (snapshots && snapshots.length >= 2) {
      setLeftSnapshotId(snapshots[snapshots.length - 1].id);
      setRightSnapshotId(snapshots[0].id);
    }
  };

  // Get selected snapshots
  const leftSnapshot = snapshots?.find(s => s.id === leftSnapshotId);
  const rightSnapshot = snapshots?.find(s => s.id === rightSnapshotId);

  const DiffField = ({ label, left, right }: { label: string; left: any; right: any }) => {
    const leftStr = JSON.stringify(left);
    const rightStr = JSON.stringify(right);
    const isDifferent = leftStr !== rightStr;

    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="grid grid-cols-2 gap-4">
          <Card className={`p-3 ${isDifferent ? 'bg-red-500/10 border-red-500/20' : 'bg-muted/50'}`}>
            <div className="text-sm break-all">{leftStr || "—"}</div>
          </Card>
          <Card className={`p-3 ${isDifferent ? 'bg-green-500/10 border-green-500/20' : 'bg-muted/50'}`}>
            <div className="text-sm break-all">{rightStr || "—"}</div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Profile to Compare</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Username</label>
            <Select value={selectedUsername} onValueChange={setSelectedUsername}>
              <SelectTrigger>
                <SelectValue placeholder="Choose username" />
              </SelectTrigger>
              <SelectContent>
                {monitoredUsernames?.map((m) => (
                  <SelectItem key={m.username} value={m.username}>
                    {m.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Site</label>
            <Select value={selectedSite} onValueChange={setSelectedSite} disabled={!selectedUsername}>
              <SelectTrigger>
                <SelectValue placeholder="Choose site" />
              </SelectTrigger>
              <SelectContent>
                {sites?.map((site) => (
                  <SelectItem key={site} value={site}>
                    {site}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={autoSelectSnapshots} 
              disabled={!snapshots || snapshots.length < 2}
              className="w-full"
            >
              Compare First vs Latest
            </Button>
          </div>
        </div>

        {snapshots && snapshots.length < 2 && selectedSite && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only {snapshots.length} snapshot found. Need at least 2 snapshots to compare.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {snapshots && snapshots.length >= 2 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Select Snapshots</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Left (Older)</label>
              <Select value={leftSnapshotId} onValueChange={setLeftSnapshotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select snapshot" />
                </SelectTrigger>
                <SelectContent>
                  {snapshots.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={snapshot.id}>
                      {new Date(snapshot.created_at).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Right (Newer)</label>
              <Select value={rightSnapshotId} onValueChange={setRightSnapshotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select snapshot" />
                </SelectTrigger>
                <SelectContent>
                  {snapshots.map((snapshot) => (
                    <SelectItem key={snapshot.id} value={snapshot.id}>
                      {new Date(snapshot.created_at).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {leftSnapshot && rightSnapshot && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Snapshot Comparison</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {formatDistanceToNow(new Date(leftSnapshot.created_at))} ago
              </Badge>
              <ArrowRight className="w-4 h-4" />
              <Badge variant="outline">
                {formatDistanceToNow(new Date(rightSnapshot.created_at))} ago
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <DiffField label="Status" left={leftSnapshot.status} right={rightSnapshot.status} />
            <DiffField label="URL" left={leftSnapshot.url} right={rightSnapshot.url} />
            <DiffField 
              label="Raw Data" 
              left={leftSnapshot.raw_data} 
              right={rightSnapshot.raw_data} 
            />
            <DiffField 
              label="Confidence" 
              left={leftSnapshot.confidence} 
              right={rightSnapshot.confidence} 
            />
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500/20 border border-red-500/20 rounded"></div>
                <span className="text-muted-foreground">Old Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/20 border border-green-500/20 rounded"></div>
                <span className="text-muted-foreground">New Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted/50 border rounded"></div>
                <span className="text-muted-foreground">Unchanged</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
