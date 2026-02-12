import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface BrokerEntry {
  id: string;
  name: string;
  domain: string | null;
  removal_url: string | null;
  risk_level: string;
  category: string | null;
  description: string | null;
  status: string;
}

interface BrokerExposureSummaryProps {
  brokers: BrokerEntry[];
  onStartRemoval: (broker: BrokerEntry) => void;
}

const riskConfig: Record<string, { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline'; icon: React.ReactNode }> = {
  critical: { label: 'Critical', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" /> },
  high: { label: 'High', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
  medium: { label: 'Medium', variant: 'default', icon: <Shield className="h-3 w-3" /> },
  low: { label: 'Low', variant: 'secondary', icon: <Info className="h-3 w-3" /> },
};

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  submitted: 'Submitted',
  awaiting_confirmation: 'Awaiting',
  removed: 'Removed',
  re_listed: 'Re-listed',
};

export function BrokerExposureSummary({ brokers, onStartRemoval }: BrokerExposureSummaryProps) {
  const riskCounts = brokers.reduce((acc, b) => {
    acc[b.risk_level] = (acc[b.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="rounded-xl">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{brokers.length}</p>
            <p className="text-xs text-muted-foreground">Total Brokers</p>
          </CardContent>
        </Card>
        {(['critical', 'high', 'medium', 'low'] as const).map(level => (
          <Card key={level} className="rounded-xl">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{riskCounts[level] || 0}</p>
              <p className="text-xs text-muted-foreground capitalize">{level} Risk</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Broker list */}
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Data Broker Exposure</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {brokers.map(broker => {
              const risk = riskConfig[broker.risk_level] || riskConfig.low;
              const isActionable = broker.status === 'not_started' || broker.status === 're_listed';
              return (
                <div key={broker.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{broker.name}</p>
                      <Badge variant={risk.variant} className="text-[10px] h-5 gap-1">
                        {risk.icon}
                        {risk.label}
                      </Badge>
                    </div>
                    {broker.category && (
                      <p className="text-xs text-muted-foreground mt-0.5">{broker.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {statusLabels[broker.status] || broker.status}
                    </Badge>
                    {isActionable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => onStartRemoval(broker)}
                      >
                        Start Removal
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {brokers.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No data broker exposure detected in this scan.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
