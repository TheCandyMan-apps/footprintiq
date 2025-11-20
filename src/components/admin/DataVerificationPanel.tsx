import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database, Activity, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DataSourceStats {
  table: string;
  count: number;
  lastUpdated: string | null;
  status: 'healthy' | 'warning' | 'error';
}

export function DataVerificationPanel() {
  const [stats, setStats] = useState<DataSourceStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataStats();
    const interval = setInterval(loadDataStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadDataStats = async () => {
    try {
      const tables: Array<{ name: string; dateField: string }> = [
        { name: 'scans', dateField: 'created_at' },
        { name: 'findings', dateField: 'created_at' },
        { name: 'removal_requests', dateField: 'created_at' },
        { name: 'social_integrations', dateField: 'created_at' },
        { name: 'entity_nodes', dateField: 'created_at' },
        { name: 'scan_jobs', dateField: 'created_at' },
        { name: 'system_errors', dateField: 'created_at' }
      ];

      const statsPromises = tables.map(async ({ name, dateField }) => {
        try {
          // Get count using RPC or direct query
          const { count, error } = await (supabase as any)
            .from(name)
            .select('id', { count: 'exact', head: true });

          if (error) throw error;

          // Get most recent record - using any to avoid complex type inference
          const { data: recentData } = await (supabase as any)
            .from(name)
            .select(dateField)
            .order(dateField, { ascending: false })
            .limit(1)
            .maybeSingle();

          const status: 'healthy' | 'warning' | 'error' = 
            count === 0 ? 'warning' : 
            count && count > 0 ? 'healthy' : 'error';

          return {
            table: name,
            count: count || 0,
            lastUpdated: recentData?.[dateField] || null,
            status
          };
        } catch (err) {
          console.error(`Error fetching stats for ${name}:`, err);
          return {
            table: name,
            count: 0,
            lastUpdated: null,
            status: 'error' as const
          };
        }
      });

      const results = await Promise.all(statsPromises);
      setStats(results);
    } catch (error) {
      console.error('Error loading data stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          <CardTitle>Data Source Verification</CardTitle>
        </div>
        <CardDescription>
          Real-time statistics from database tables
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {stats.map((stat) => (
              <div
                key={stat.table}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(stat.status)}
                  <div>
                    <p className="font-medium text-sm capitalize">
                      {stat.table.replace(/_/g, ' ')}
                    </p>
                    {stat.lastUpdated && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {formatDistanceToNow(new Date(stat.lastUpdated), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(stat.status)}>
                    {stat.count.toLocaleString()} records
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Auto-refreshes every minute</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
