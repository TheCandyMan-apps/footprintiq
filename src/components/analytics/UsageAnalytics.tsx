import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UsageStats {
  totalScans: number;
  totalUsers: number;
  activeToday: number;
  avgScanTime: number;
  scanTrend: number;
}

export function UsageAnalytics() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Fetch scan statistics
      const { data: scans, error } = await supabase
        .from("scans")
        .select("created_at")
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const scansToday = scans?.filter(
        (scan) => new Date(scan.created_at) >= today
      ).length || 0;

      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const scansLastWeek = scans?.filter(
        (scan) => new Date(scan.created_at) >= lastWeek
      ).length || 0;

      const previousWeek = new Date();
      previousWeek.setDate(previousWeek.getDate() - 14);
      const scansPreviousWeek = scans?.filter(
        (scan) =>
          new Date(scan.created_at) >= previousWeek &&
          new Date(scan.created_at) < lastWeek
      ).length || 0;

      const trend =
        scansPreviousWeek > 0
          ? ((scansLastWeek - scansPreviousWeek) / scansPreviousWeek) * 100
          : 0;

      setStats({
        totalScans: scans?.length || 0,
        totalUsers: 1, // Single user for now
        activeToday: scansToday,
        avgScanTime: 45, // Placeholder
        scanTrend: Math.round(trend),
      });
    } catch (error) {
      console.error("Error loading usage stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalScans}</div>
          {stats.scanTrend !== 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp
                className={`h-3 w-3 ${
                  stats.scanTrend > 0 ? "text-green-500" : "text-red-500"
                }`}
              />
              <span className={stats.scanTrend > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(stats.scanTrend)}%
              </span>
              <span>from last week</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Today</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeToday}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Scans initiated today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Avg Scan Time</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgScanTime}s</div>
          <p className="text-xs text-muted-foreground mt-1">
            Average completion time
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="text-sm">
            Active
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">
            All systems operational
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
