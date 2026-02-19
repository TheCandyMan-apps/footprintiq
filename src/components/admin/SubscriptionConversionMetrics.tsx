import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { SubscriptionConversionData } from '@/hooks/useSubscriptionConversion';
import { Users, Zap, TrendingUp, PoundSterling, Crown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

interface Props {
  data: SubscriptionConversionData | undefined;
  isLoading: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="font-semibold mb-1">{label}</p>
      <p className="text-muted-foreground">New paid: <span className="text-foreground font-medium">{payload[0]?.value}</span></p>
      <p className="text-muted-foreground">MRR added: <span className="text-foreground font-medium">£{payload[1]?.value?.toFixed(2)}</span></p>
    </div>
  );
};

export function SubscriptionConversionMetrics({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No subscription data available
        </CardContent>
      </Card>
    );
  }

  const total = data.totalFree + data.totalPro + data.totalEnterprise;
  const totalPaid = data.totalPro + data.totalEnterprise;
  const freeWidth = total > 0 ? (data.totalFree / total) * 100 : 0;
  const proWidth = total > 0 ? (data.totalPro / total) * 100 : 0;
  const entWidth = total > 0 ? (data.totalEnterprise / total) * 100 : 0;

  const statCards = [
    {
      label: 'Free Users',
      value: data.totalFree.toLocaleString(),
      icon: Users,
      color: 'text-muted-foreground',
      bg: 'bg-muted/50',
      badge: null,
    },
    {
      label: 'Pro Subscribers',
      value: data.totalPro.toLocaleString(),
      icon: Zap,
      color: 'text-primary',
      bg: 'bg-primary/10',
      badge: null,
    },
    {
      label: 'Enterprise',
      value: data.totalEnterprise.toLocaleString(),
      icon: Crown,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      badge: null,
    },
    {
      label: 'Conversion Rate',
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      badge: totalPaid > 0 ? `${totalPaid} paid` : null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg, badge }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <div className={`p-1.5 rounded-md ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {badge && <Badge variant="secondary" className="mt-1 text-xs">{badge}</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stacked breakdown bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">User Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-5 rounded-full overflow-hidden gap-0.5">
            <div
              className="bg-muted-foreground/30 transition-all duration-500 rounded-l-full"
              style={{ width: `${freeWidth}%` }}
              title={`Free: ${data.totalFree}`}
            />
            <div
              className="bg-primary transition-all duration-500"
              style={{ width: `${proWidth}%` }}
              title={`Pro: ${data.totalPro}`}
            />
            <div
              className="bg-yellow-500 transition-all duration-500 rounded-r-full"
              style={{ width: `${entWidth}%` }}
              title={`Enterprise: ${data.totalEnterprise}`}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-muted-foreground/30" /> Free ({freeWidth.toFixed(0)}%)</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" /> Pro ({proWidth.toFixed(0)}%)</span>
            {data.totalEnterprise > 0 && (
              <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-500" /> Enterprise ({entWidth.toFixed(0)}%)</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MRR Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PoundSterling className="h-4 w-4 text-primary" />
            Monthly New Conversions & MRR Added
          </CardTitle>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Est. Current MRR</p>
            <p className="text-lg font-bold text-primary">£{data.estimatedMRR.toFixed(0)}</p>
          </div>
        </CardHeader>
        <CardContent>
          {data.mrrTrend.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No trend data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.mrrTrend} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    const [year, month] = v.split('-');
                    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month) - 1]} ${year.slice(2)}`;
                  }}
                  className="text-muted-foreground"
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v}`} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Bar yAxisId="left" dataKey="proCount" name="New Paid" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.85} />
                <Bar yAxisId="right" dataKey="mrr" name="MRR" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" opacity={0.35} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <p className="text-[10px] text-muted-foreground/50 mt-2">MRR estimated at £9.99/mo per Pro · £49.99/mo per Enterprise · based on workspace creation date</p>
        </CardContent>
      </Card>
    </div>
  );
}
