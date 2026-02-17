import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SovereigntyRequest } from '@/hooks/useSovereignty';
import { Globe, Shield, FileText } from 'lucide-react';

interface JurisdictionBreakdownProps {
  requests: SovereigntyRequest[];
}

const JURISDICTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  gdpr: { label: 'GDPR', icon: <Globe className="h-3.5 w-3.5" />, color: 'hsl(var(--primary))' },
  ccpa: { label: 'CCPA', icon: <Shield className="h-3.5 w-3.5" />, color: 'hsl(var(--chart-1, 220 70% 50%))' },
  uk_sds: { label: 'UK SDS', icon: <FileText className="h-3.5 w-3.5" />, color: 'hsl(var(--chart-3, 43 74% 66%))' },
};

export function JurisdictionBreakdown({ requests }: JurisdictionBreakdownProps) {
  const breakdown = useMemo(() => {
    const map: Record<string, { total: number; completed: number; overdue: number }> = {};
    requests.forEach((r) => {
      if (!map[r.jurisdiction]) map[r.jurisdiction] = { total: 0, completed: 0, overdue: 0 };
      map[r.jurisdiction].total++;
      if (r.status === 'completed') map[r.jurisdiction].completed++;
      if (
        r.deadline_at &&
        new Date(r.deadline_at) < new Date() &&
        !['completed', 'rejected'].includes(r.status)
      ) {
        map[r.jurisdiction].overdue++;
      }
    });
    return map;
  }, [requests]);

  if (Object.keys(breakdown).length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">By Jurisdiction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(breakdown).map(([key, data]) => {
          const meta = JURISDICTION_META[key] || { label: key, icon: null, color: 'hsl(var(--muted))' };
          const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  {meta.icon}
                  {meta.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {data.completed}/{data.total}
                  </span>
                  {data.overdue > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {data.overdue} overdue
                    </Badge>
                  )}
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${rate}%`, backgroundColor: meta.color }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
