import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingDown, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
];

interface CreditUsage {
  reason: string;
  total_credits: number;
  scan_count: number;
}

export function CreditUsageBreakdown() {
  const { data: usageData, isLoading } = useQuery({
    queryKey: ['credit-usage-breakdown'],
    queryFn: async () => {
      // Get credit usage grouped by reason
      const { data, error } = await supabase
        .from('credits_ledger')
        .select('reason, delta, meta')
        .lt('delta', 0) // Only debits (negative deltas)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by reason
      const grouped = (data || []).reduce((acc: Record<string, CreditUsage>, item) => {
        const reason = item.reason || 'unknown';
        if (!acc[reason]) {
          acc[reason] = {
            reason: formatReason(reason),
            total_credits: 0,
            scan_count: 0,
          };
        }
        acc[reason].total_credits += Math.abs(item.delta);
        acc[reason].scan_count += 1;
        return acc;
      }, {});

      return Object.values(grouped).sort((a, b) => b.total_credits - a.total_credits);
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const formatReason = (reason: string): string => {
    const map: Record<string, string> = {
      'harvester_scan': 'Harvester OSINT',
      'maigret_scan': 'Maigret Username',
      'darkweb_scan': 'Dark Web Monitoring',
      'dating_scan': 'Dating Platform Search',
      'pdf_export': 'PDF Exports',
      'api_usage': 'API Access',
      'premium_reveal': 'Evidence Reveals',
    };
    return map[reason] || reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const chartData = usageData?.map((item, index) => ({
    name: item.reason,
    value: item.total_credits,
    color: COLORS[index % COLORS.length],
  })) || [];

  const totalCreditsUsed = usageData?.reduce((sum, item) => sum + item.total_credits, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Breakdown</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!usageData || usageData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage Breakdown</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No credit usage in the last 30 days</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Credit Usage Breakdown</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <TrendingDown className="w-4 h-4 mr-2" />
            {totalCreditsUsed} credits used
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          {usageData.map((item, index) => (
            <div
              key={item.reason}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div>
                  <p className="font-semibold">{item.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.scan_count} scan{item.scan_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">
                {item.total_credits} credits
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
